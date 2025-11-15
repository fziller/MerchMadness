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

/**
 * Runs a given JSX file in Photoshop on the current platform.
 */
async function runPhotoshopJsx(
  jsxPath: string,
  photoshopBundleIdMac = "com.adobe.Photoshop"
) {
  console.log(
    "[getAutomationNameFromAtn] Run ps automation, jsxPath:",
    jsxPath
  );

  if (process.platform === "darwin") {
    const escaped = jsxPath.replace(/"/g, '\\"');
    const script = [
      `tell application id "${photoshopBundleIdMac}"`,
      "  activate",
      `  do javascript of file "${escaped}"`,
      "end tell",
    ].join("\n");

    await spawnPromise("osascript", ["-e", script]);
  } else if (process.platform === "win32") {
    const pwsh = which("pwsh") || which("powershell");
    if (!pwsh) throw new Error("No PowerShell host found");

    const cmdArgs = [
      "-NoProfile",
      "-ExecutionPolicy",
      "Bypass",
      "-Command",
      `$app = New-Object -ComObject "Photoshop.Application"; $app.DoJavaScriptFile("${jsxPath.replace(
        /\\/g,
        "\\\\"
      )}", $null, 1)`,
    ];

    await spawnPromise(pwsh, cmdArgs);
  } else {
    throw new Error(`Unsupported platform: ${process.platform}`);
  }
}

function writeInspectAtnJsx(params: {
  atnFileAbs: string;
  destJsxPath: string;
  metaFileAbs: string;
  logFileAbs: string;
}) {
  const { atnFileAbs, destJsxPath, metaFileAbs, logFileAbs } = params;

  const esc = (p: string) => p.replace(/\\/g, "\\\\"); // für ExtendScript

  const jsx = `
// #target photoshop

// --- Konfiguration (aus Node injiziert) ---
var ATN_FILE_PATH = "${esc(atnFileAbs)}";
var META_FILE_PATH = "${esc(metaFileAbs)}";
var LOG_FILE_PATH = "${esc(logFileAbs)}";

// --- Logging ---

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

// --- Action-Helpers ---

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

function snapshotActions() {
  var result = [];

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
      break; // kein weiteres Set
    }

    var setName = setDesc.getString(sidName);
    var actionCount = setDesc.getInteger(sidNumberOfChildren);
    var actions = [];

    for (var j = 1; j <= actionCount; j++) {
      var actRef = new ActionReference();
      actRef.putIndex(sidAction, j);
      actRef.putIndex(sidActionSet, i);

      var actDesc = executeActionGet(actRef);
      var actName = actDesc.getString(sidName);
      actions.push(actName);
    }

    result.push({
      setName: setName,
      actions: actions
    });

    i++;
  }

  return result;
}

// Diff der Actions (welche Action-Namen sind neu?)
function diffSnapshots(before, after) {
  function toMap(list) {
    var map = {};
    for (var i = 0; i < list.length; i++) {
      var s = list[i];
      map[s.setName] = s.actions.slice(0);
    }
    return map;
  }

  var beforeMap = toMap(before);
  var newlyAdded = [];

  for (var i = 0; i < after.length; i++) {
    var set = after[i];
    var prevActions = beforeMap[set.setName] || [];
    for (var j = 0; j < set.actions.length; j++) {
      var actName = set.actions[j];

      var existed = false;
      for (var k = 0; k < prevActions.length; k++) {
        if (prevActions[k] === actName) {
          existed = true;
          break;
        }
      }

      if (!existed) {
        newlyAdded.push({
          setName: set.setName,
          actionName: actName
        });
      }
    }
  }

  return newlyAdded;
}

// Welche Action-Sets sind komplett neu hinzugekommen?
function diffNewSets(before, after) {
  var beforeNames = {};
  for (var i = 0; i < before.length; i++) {
    beforeNames[before[i].setName] = true;
  }
  var newSetNames = [];
  for (var j = 0; j < after.length; j++) {
    var sName = after[j].setName;
    if (!beforeNames[sName]) {
      newSetNames.push(sName);
    }
  }
  return newSetNames;
}

var debugStep = 1;
var loadedSetNames = []; // Sets, die durch dieses ATN neu hinzugekommen sind

log("----- NEW ATN INSPECT RUN -----");
log("=== inspect ATN run started ===");
log("ATN_FILE_PATH=" + ATN_FILE_PATH);

try {
  debugStep = 1;
  log("Step 1: snapshot before");
  var before = snapshotActions();
  log("Step 1: found " + before.length + " sets before");

  debugStep = 2;
  log("Step 2: load ATN '" + ATN_FILE_PATH + "'");
  app.load(File(ATN_FILE_PATH));

  debugStep = 3;
  log("Step 3: snapshot after");
  var after = snapshotActions();
  log("Step 3: found " + after.length + " sets after");

  var newActions = diffSnapshots(before, after);
  log("Step 3: newActions length = " + newActions.length);

  loadedSetNames = diffNewSets(before, after);
  log("Step 3: loadedSetNames = " + loadedSetNames.join(", "));

  var firstName = "";
  if (newActions.length > 0) {
    firstName = newActions[0].actionName;
    log("Using first new actionName: '" + firstName + "'");
  } else {
    log("No new actions detected");
  }

  var metaFile = new File(META_FILE_PATH);
  metaFile.encoding = "UTF8";
  metaFile.open("w");
  metaFile.write(firstName);
  metaFile.close();
  log("Meta file written to: " + META_FILE_PATH);

} catch (e) {
  log("FATAL: Error in inspect ATN at step " + debugStep + ": " + e.message);
  alert("Error in inspect ATN at step " + debugStep + ": " + e.message);
} finally {
  // Nur die Action-Sets löschen, die durch dieses ATN neu dazugekommen sind
  try {
    if (loadedSetNames && loadedSetNames.length > 0) {
      log("Cleanup: deleting new sets: " + loadedSetNames.join(", "));
      for (var i = 0; i < loadedSetNames.length; i++) {
        deleteActions(loadedSetNames[i]);
      }
    } else {
      log("Cleanup: no new sets to delete");
    }
  } catch (cleanupError) {
    log("Cleanup: failed: " + cleanupError.message);
  }
  log("=== inspect ATN run finished ===");
}
`;

  fs.mkdirSync(path.dirname(destJsxPath), { recursive: true });
  fs.writeFileSync(destJsxPath, jsx, "utf8");
}

/**
 * Runs an ATN file and inspects the changes made to Photoshop.
 * Returns the name of the first action added by the ATN file.
 */
export async function getAutomationNameFromAtn(params: {
  atnFileAbs: string;
  projectRoot?: string;
  photoshopBundleIdMac?: string;
}): Promise<string> {
  const {
    atnFileAbs,
    projectRoot = process.cwd(),
    photoshopBundleIdMac = "com.adobe.Photoshop",
  } = params;

  const scriptsDir = path.join(projectRoot, "scripts");
  fs.mkdirSync(scriptsDir, { recursive: true });

  const logsDir = path.join(projectRoot, "logs");
  fs.mkdirSync(logsDir, { recursive: true });

  const stamp = Date.now();
  const jsxPath = path.join(scriptsDir, `getAutomationNameFromAtn.jsx`);
  const metaFileAbs = path.join(os.tmpdir(), `getAutomationNameFromAtn.txt`);

  // Create the logfile
  const logFileAbs = path.join(logsDir, "photoshop_inspect.log");

  console.log("[getAutomationNameFromAtn] JSX path:", jsxPath);
  console.log("[getAutomationNameFromAtn] Meta file:", metaFileAbs);
  console.log("[getAutomationNameFromAtn] Log file:", logFileAbs);

  writeInspectAtnJsx({
    atnFileAbs,
    destJsxPath: jsxPath,
    metaFileAbs,
    logFileAbs,
  });

  await runPhotoshopJsx(jsxPath, photoshopBundleIdMac);

  if (!fs.existsSync(metaFileAbs)) {
    console.error(
      "[getAutomationNameFromAtn] Meta file not found. Check log:",
      logFileAbs
    );
    throw new Error("ATN inspection did not produce a meta file");
  }

  const content = fs.readFileSync(metaFileAbs, "utf8").trim();
  console.log(
    "[getAutomationNameFromAtn] Meta content:",
    JSON.stringify(content)
  );

  if (!content) {
    console.error(
      "[getAutomationNameFromAtn] Meta file is empty. Check log:",
      logFileAbs
    );
    throw new Error("No action name detected in ATN file");
  }

  return content;
}
