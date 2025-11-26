import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawn, spawnSync } from "node:child_process";

function which(cmd: string): string | null {
  const res = spawnSync(
    process.platform === "win32" ? "where" : "which",
    [cmd],
    { stdio: "pipe" }
  );
  if (res.status === 0) {
    const out = String(res.stdout).split(/\r?\n/).find(Boolean);
    return out || null;
  }
  return null;
}

function spawnPromise(
  cmd: string,
  args: string[],
  opts: any = {}
): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { ...opts });
    let stderr = "";
    child.stderr.on("data", (d) => {
      stderr += d.toString();
    });
    child.on("close", (code) =>
      code === 0
        ? resolve()
        : reject(
            new Error(`Failed (${code}): ${cmd} ${args.join(" ")}\n${stderr}`)
          )
    );
    child.on("error", reject);
  });
}

async function killPhotoshop(): Promise<void> {
  if (process.platform === "darwin") {
    // macOS: Photoshop-Prozess hart killen
    try {
      console.warn("[MerchMadness] Killing Photoshop via pkill");
      await spawnPromise("pkill", ["-9", "Adobe Photoshop"]);
    } catch (e) {
      console.error("[MerchMadness] Failed to kill Photoshop on macOS:", e);
    }
  } else if (process.platform === "win32") {
    // Windows: Prozessname ggf. anpassen (Photoshop.exe / Photoshop 2025 etc.)
    try {
      console.warn("[MerchMadness] Killing Photoshop via taskkill");
      await spawnPromise("taskkill", ["/IM", "Photoshop.exe", "/F"]);
    } catch (e) {
      console.error("[MerchMadness] Failed to kill Photoshop on Windows:", e);
    }
  } else {
    console.warn(
      "[MerchMadness] killPhotoshop: unsupported platform",
      process.platform
    );
  }
}

function writeJsx(params: {
  actionFileAbs: string;
  shirtFileAbs: string;
  modelFileAbs: string;
  resultFileAbs: string;
  actionName: string;
  layerName: string;
  actionSetName?: string;
  destJsxPath: string;
  logFileAbs: string;
}) {
  const {
    actionFileAbs,
    shirtFileAbs,
    modelFileAbs,
    resultFileAbs,
    actionName,
    layerName,
    actionSetName = "Default Actions",
    destJsxPath,
    logFileAbs,
  } = params;

  const esc = (p: string) => p.replace(/\\/g, "\\\\"); // ExtendScript braucht \\

  const jsx = `
// #target photoshop

app.displayDialogs = DialogModes.NO;

// Konfiguration aus Node injiziert
var ACTION_NAME = "${actionName}";
var ACTION_SET_NAME = "${actionSetName}";
var TARGET_LAYER_NAME = "${layerName}";
var RESULT_FILE_PATH = "${esc(resultFileAbs)}";
var ACTION_FILE_PATH = "${esc(actionFileAbs)}";
var SHIRT_FILE_PATH = "${esc(shirtFileAbs)}";
var MODEL_FILE_PATH = "${esc(modelFileAbs)}";
var LOG_FILE_PATH = "${esc(logFileAbs)}";

// ---- Logging Helpers ----

var logFile = new File(LOG_FILE_PATH);

function nowIso() {
  var d = new Date();
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  return d.getFullYear() + "-" +
         pad(d.getMonth() + 1) + "-" +
         pad(d.getDate()) + "T" +
         pad(d.getHours()) + ":" +
         pad(d.getMinutes()) + ":" +
         pad(d.getSeconds());
}

function log(msg) {
  try {
    logFile.open("a");
    logFile.writeln(nowIso() + " | " + msg);
    logFile.close();
  } catch (e) {
    // ignore logging errors
  }
}

// ---- Action Helpers ----

function deleteActions(setName) {
  if (!setName) {
    log("deleteActions: no setName provided, skipping");
    return;
  }
  log("deleteActions: attempting to delete set '" + setName + "'");
  var ref = new ActionReference();
  ref.putName(stringIDToTypeID("actionSet"), setName);
  var desc = new ActionDescriptor();
  desc.putReference(stringIDToTypeID("null"), ref);
  try {
    executeAction(stringIDToTypeID("delete"), desc, DialogModes.NO);
    log("deleteActions: set '" + setName + "' deleted");
  } catch (e) {
    log("deleteActions: failed to delete set '" + setName + "': " + e.message);
  }
}

function findActionSetForAction(actionName) {
  var sidActionSet = stringIDToTypeID("actionSet");
  var sidAction = stringIDToTypeID("action");
  var sidName = stringIDToTypeID("name");
  var sidNumberOfChildren = stringIDToTypeID("numberOfChildren");

  var i = 1;
  while (true) {
    var setRef = new ActionReference();
    setRef.putIndex(sidActionSet, i);

    var setDesc;
    try {
      setDesc = executeActionGet(setRef);
    } catch (e) {
      break; // keine weiteren Sets
    }

    var setName = setDesc.getString(sidName);
    var actionCount = setDesc.getInteger(sidNumberOfChildren);

    for (var j = 1; j <= actionCount; j++) {
      var actRef = new ActionReference();
      actRef.putIndex(sidAction, j);
      actRef.putIndex(sidActionSet, i);

      var actDesc = executeActionGet(actRef);
      var actName = actDesc.getString(sidName);

      if (actName === actionName) {
        log("findActionSetForAction: found action '" + actionName + "' in set '" + setName + "'");
        return setName;
      }
    }

    i++;
  }

  log("findActionSetForAction: no set found for action '" + actionName + "'");
  return null;
}

function describeDocState(doc) {
  var s = "";
  try {
    s += "doc=" + doc.name + "; ";
    s += "layers=" + doc.layers.length + "; ";
    s += "activeLayer=" + doc.activeLayer.name + "; ";
  } catch (e) {
    s += "describeDocState error: " + e.message;
  }
  return s;
}

function runActionByName(actionName, preferredSetName) {
  log("runActionByName: actionName=" + actionName + ", preferredSetName=" + preferredSetName);

  // if (preferredSetName && preferredSetName.length) {
  //   try {
  //     log("runActionByName: trying preferred set '" + preferredSetName + "'");
  //     app.doAction(actionName, preferredSetName);
  //     log("runActionByName: action executed successfully with preferred set");
  //     return;
  //   } catch (e) {
  //     log("runActionByName: preferred set failed: " + e.message + " (#" + e.number + ")");
  //   }
  // }

  var detectedSetName = findActionSetForAction(actionName);
  if (!detectedSetName) {
    var msg = "Could not find any action set containing action: " + actionName;
    log("runActionByName: " + msg);
    throw new Error(msg);
  }

  try {
    log("runActionByName: trying detected set '" + detectedSetName + "'");
    app.doAction(actionName, detectedSetName);
    log("runActionByName: action executed successfully with detected set '" + detectedSetName + "'");
  } catch (e) {
    var ctx = "";
    try {
      ctx = describeDocState(app.activeDocument);
    } catch (_e) {}
    log("runActionByName: ERROR in app.doAction: " + e.message + " (#" + e.number + "); ctx=" + ctx);
    throw e;
  }
}

// ---- Layer Helper ----

function selectLayerByName(doc, name) {
  function walk(layerSetOrDoc) {
    var L = layerSetOrDoc.layers || layerSetOrDoc.artLayers;
    for (var i = 0; i < L.length; i++) {
      var ly = L[i];
      if (ly.name === name) {
        doc.activeLayer = ly;
        return true;
      }
      if (ly.typename === "LayerSet") {
        if (walk(ly)) return true;
      }
    }
    return false;
  }
  return walk(doc);
}

// ---- Main Script ----

function main() {
  var debugStep = 1;
  log("=== MerchMadness run started ===");
  log("ACTION_NAME=" + ACTION_NAME + ", ACTION_SET_NAME=" + ACTION_SET_NAME + ", TARGET_LAYER_NAME=" + TARGET_LAYER_NAME);

  try {
    debugStep = 1;
    log("Step 1: closing all open documents");
    while (app.documents.length > 0) {
      app.activeDocument.close(SaveOptions.DONOTSAVECHANGES);
    }

    debugStep = 2;
    log("Step 2: loading actions from '" + ACTION_FILE_PATH + "'");
    app.load(File(ACTION_FILE_PATH));

    debugStep = 3;
    log("Step 3: opening shirt image '" + SHIRT_FILE_PATH + "' and copying to clipboard");
    var shirtImage = File(SHIRT_FILE_PATH);
    app.open(shirtImage);
    app.activeDocument.selection.selectAll();
    app.activeDocument.selection.copy();
    log("Step 3: shirt copied to clipboard, state: " + describeDocState(app.activeDocument));

    debugStep = 4;
    log("Step 4: opening model file '" + MODEL_FILE_PATH + "'");
    var modelFile = File(MODEL_FILE_PATH);
    open(modelFile);
    log("Step 4: model opened, state: " + describeDocState(app.activeDocument));

    debugStep = 5;
    log("Step 5: selecting target layer '" + TARGET_LAYER_NAME + "'");
    if (!selectLayerByName(app.activeDocument, TARGET_LAYER_NAME)) {
      log("Step 5: target layer not found: '" + TARGET_LAYER_NAME + "'. Action may select its own layer.");
    } else {
      log("Step 5: target layer selected, state: " + describeDocState(app.activeDocument));
    }

    debugStep = 6;
    log("Step 6: executing action '" + ACTION_NAME + "'");
    log("Step 6: BEFORE action state: " + describeDocState(app.activeDocument));
    runActionByName(ACTION_NAME, ACTION_SET_NAME);
    log("Step 6: AFTER action state: " + describeDocState(app.activeDocument));

    debugStep = 7;
    log("Step 7: reopening model file (in case action changed focus)");
    open(modelFile);
    log("Step 7: model refocused, state: " + describeDocState(app.activeDocument));

    debugStep = 8;
    log("Step 8: exporting result to '" + RESULT_FILE_PATH + "'");
    var file = new File(RESULT_FILE_PATH);
    var options = new JPEGSaveOptions();
    options.quality = 12;
    options.embedColorProfile = true;
    options.formatOptions = FormatOptions.OPTIMIZEDBASELINE;
    app.activeDocument.saveAs(file, options, true, Extension.LOWERCASE);
    log("Step 8: export finished");

  } catch (e) {
    var extra = "";
    try {
      extra = describeDocState(app.activeDocument);
    } catch (_e) {}
    log("FATAL ERROR at debugStep " + debugStep + ": " + e.message + " (#" + e.number + "); ctx=" + extra);
    // Do not show the alert. Photoshop needs to be able to continue.
    // alert("Error on step " + debugStep + ": " + e.message);
  } finally {
    try {
      var setNameForCleanup = findActionSetForAction(ACTION_NAME) || ACTION_SET_NAME;
      log("Cleanup: attempting to delete action set '" + setNameForCleanup + "'");
      deleteActions(setNameForCleanup);
    } catch (cleanupError) {
      log("Cleanup: failed to delete action set: " + cleanupError.message);
    }
    log("=== MerchMadness run finished ===");
  }
}

try {
  main();
} catch (e) {
  log("ERROR in merge job: " + e.toString());
  // bewusst NICHT wieder einen Dialog auslösen
}
`;

  fs.mkdirSync(path.dirname(destJsxPath), { recursive: true });
  fs.writeFileSync(destJsxPath, jsx, "utf8");
}

async function runMac(jsxPath: string, timeoutMs = 15_000) {
  const escaped = jsxPath.replace(/"/g, '\\"');
  const script = [
    `tell application id "com.adobe.Photoshop"`,
    "  activate",
    `  do javascript of file "${escaped}"`,
    "end tell",
  ].join("\n");

  return new Promise<void>((resolve, reject) => {
    const child = spawn("osascript", ["-e", script]);

    let stderr = "";
    child.stderr.on("data", (d) => {
      stderr += d.toString();
    });

    let finished = false;

    const timer = setTimeout(async () => {
      if (finished) return;
      finished = true;

      console.error(
        `[MerchMadness] runMac timeout after ${timeoutMs}ms. Killing Photoshop + osascript...`
      );

      try {
        // erst Photoshop killen
        await killPhotoshop();
      } catch (e) {
        console.error("[MerchMadness] killPhotoshop in runMac failed:", e);
      }

      try {
        // dann sicherstellen, dass osascript selbst auch weg ist
        child.kill("SIGKILL");
      } catch (e) {
        console.error("[MerchMadness] killing osascript failed:", e);
      }

      reject(
        new Error(
          `[MerchMadness] runMac: osascript/Photoshop did not finish within ${timeoutMs}ms`
        )
      );
    }, timeoutMs);

    child.on("close", (code) => {
      if (finished) return;
      finished = true;
      clearTimeout(timer);

      if (code === 0) {
        resolve();
      } else {
        reject(
          new Error(
            `[MerchMadness] runMac failed (${code}): osascript -e ${JSON.stringify(
              script
            )}\n${stderr}`
          )
        );
      }
    });

    child.on("error", (err) => {
      if (finished) return;
      finished = true;
      clearTimeout(timer);
      reject(err);
    });
  });
}

async function runWinViaPowerShell(jsxPath: string) {
  const pwsh = which("pwsh");
  const psh = which("powershell");
  const host = pwsh || psh;
  if (!host) throw new Error("No PowerShell host found");
  const cmdArgs = [
    "-NoProfile",
    "-ExecutionPolicy",
    "Bypass",
    "-Command",
    `$app=New-Object -ComObject "Photoshop.Application"; $app.DoJavaScriptFile("${jsxPath.replace(
      /\\/g,
      "\\\\"
    )}", $null, 1)`,
  ];
  await spawnPromise(host, cmdArgs);
}

async function runWinViaWSH(jsxPath: string) {
  const wshFile = path.join(os.tmpdir(), `ps-wsh-${Date.now()}.js`);
  const js = `
var jsx = WScript.Arguments.Item(0);
var app = new ActiveXObject("Photoshop.Application");
app.DoJavaScriptFile(jsx, null, 1);
`;
  fs.writeFileSync(wshFile, js, "utf8");
  const cscript = path.join(
    process.env.SystemRoot || "C:\\\\Windows",
    "System32",
    "cscript.exe"
  );
  await spawnPromise(cscript, ["//Nologo", wshFile, jsxPath]);
}

export async function runTriggerMerchMadnessAction(params: {
  actionUrl: string;
  resultFileName: string;
  modelDocumentUrl: string;
  shirtFileUrl: string;
  actionName: string;
  layerName?: string;
  actionSetName?: string;
  projectRoot?: string;
  timeoutMs?: number;
}) {
  const {
    actionUrl,
    resultFileName,
    modelDocumentUrl,
    shirtFileUrl,
    actionName,
    layerName = "Longsleeve",
    actionSetName = "Default Actions",
    projectRoot = process.cwd(),
    timeoutMs = 10_000,
  } = params;

  const publicDir = path.resolve(projectRoot, "public");
  const uploadsDir = path.join(publicDir, "uploads");

  const rel = (u: string) => u.replace(/^\//, "").split("/").join(path.sep);

  const actionFileAbs = path.join(publicDir, rel(actionUrl));
  const shirtFileAbs = path.join(publicDir, rel(shirtFileUrl));
  const modelFileAbs = path.join(publicDir, rel(modelDocumentUrl));
  const resultFileAbs = path.join(uploadsDir, resultFileName);

  fs.mkdirSync(path.dirname(resultFileAbs), { recursive: true });

  // Logs jetzt im Projektordner, nicht /var
  const logsDir = path.join(projectRoot, "logs");
  fs.mkdirSync(logsDir, { recursive: true });
  const logFileAbs = path.join(logsDir, "photoshop_render.log");
  console.log("[MerchMadness] Photoshop JSX log file:", logFileAbs);

  const jsxPath = path.join(
    projectRoot,
    "scripts",
    "triggerMerchMadnessAction.jsx"
  );
  writeJsx({
    actionFileAbs,
    shirtFileAbs,
    modelFileAbs,
    resultFileAbs,
    actionName,
    layerName,
    actionSetName,
    destJsxPath: jsxPath,
    logFileAbs,
  });

  if (process.platform === "darwin") {
    await runMac(jsxPath, timeoutMs);
  } else if (process.platform === "win32") {
    try {
      await runWinViaPowerShell(jsxPath);
    } catch {
      await runWinViaWSH(jsxPath);
    }
  } else {
    throw new Error(`Unsupported platform: ${process.platform}`);
  }

  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    if (fs.existsSync(resultFileAbs)) {
      console.log(
        `[MerchMadness] Result file created within ${timeoutMs}ms:`,
        resultFileAbs
      );
      return;
    }
    await new Promise((r) => setTimeout(r, 1000));
  }

  console.error(
    `[MerchMadness] Timeout: result file not created after ${timeoutMs}ms. Attempting to kill Photoshop...`
  );
  await killPhotoshop();

  throw new Error(
    `Timeout: result file not created after ${timeoutMs}ms (Photoshop killed)`
  );
}
