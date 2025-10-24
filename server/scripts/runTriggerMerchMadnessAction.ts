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

function writeJsx(params: {
  actionFileAbs: string;
  shirtFileAbs: string;
  modelFileAbs: string;
  resultFileAbs: string;
  actionName: string;
  layerName: string; // <- injizieren, nicht getenv
  actionSetName?: string; // default "Standardaktionen"
  destJsxPath: string;
}) {
  const {
    actionFileAbs,
    shirtFileAbs,
    modelFileAbs,
    resultFileAbs,
    actionName,
    layerName,
    actionSetName = "Standardaktionen",
    destJsxPath,
  } = params;
  const esc = (p: string) => p.replace(/\\/g, "\\\\"); // ExtendScript braucht \\

  const jsx = `
// #target photoshop

function deleteActions(setName) {
  var ref = new ActionReference();
  ref.putName(stringIDToTypeID("actionSet"), setName);
  var desc = new ActionDescriptor();
  desc.putReference(stringIDToTypeID("null"), ref);
  try { executeAction(stringIDToTypeID("delete"), desc, DialogModes.NO); } catch (e) {}
}

var debugStep = 1;
try {
  while (app.documents.length > 0) {
    app.activeDocument.close(SaveOptions.DONOTSAVECHANGES);
  }

  // 1) Actions laden
  app.load(File("${esc(actionFileAbs)}"));
  debugStep = 2;

  // 2) Shirt-Bild in Clipboard
  var shirtImage = File("${esc(shirtFileAbs)}");
  app.open(shirtImage);
  app.activeDocument.selection.selectAll();
  app.activeDocument.selection.copy();

  debugStep = 3;

  // 3) Model-PSB öffnen
  var modelFile = File("${esc(modelFileAbs)}");
  open(modelFile);

  // 4) Ziel-Layer aktivieren
  debugStep = 4;
  var layers = app.activeDocument.layers; // geht auch über .artLayers, aber .layers deckt Gruppen ab
  function selectLayerByName(doc, name) {
    // brute force durch alle Ebenen/Unterebenen
    function walk(layerSetOrDoc) {
      var L = layerSetOrDoc.layers || layerSetOrDoc.artLayers;
      for (var i=0; i<L.length; i++) {
        var ly = L[i];
        if (ly.name === name) { doc.activeLayer = ly; return true; }
        if (ly.typename === "LayerSet") { if (walk(ly)) return true; }
      }
      return false;
    }
    return walk(doc);
  }
  if (!selectLayerByName(app.activeDocument, "${layerName}")) {
    // not fatal: die Action könnte selbst selektieren; aber wir loggen:
    // alert("Layer not found: ${layerName}");
  }

  // 5) Action ausführen (Name, Set)
  debugStep = 5;
  app.doAction("${actionName}", "${actionSetName}");

  // 6) zurück zum Modelfile (falls Action ein neues Dok geöffnet hat)
  debugStep = 6;
  open(modelFile);

  // 7) Export als JPG
  debugStep = 7;
  var file = new File("${esc(resultFileAbs)}");
  var options = new JPEGSaveOptions();
  options.quality = 12;
  options.embedColorProfile = true;
  options.formatOptions = FormatOptions.OPTIMIZEDBASELINE;

  debugStep = 8;
  app.activeDocument.saveAs(file, options, true, Extension.LOWERCASE);

} catch (e) {
  // alert("Error on step " + debugStep + ": " + e.message);
} finally {
  deleteActions("${actionSetName}");
}
`;
  fs.mkdirSync(path.dirname(destJsxPath), { recursive: true });
  fs.writeFileSync(destJsxPath, jsx, "utf8");
}

async function runMac(jsxPath: string, psAppName = "Adobe Photoshop 2025") {
  const script = [
    `tell application "${psAppName}"`,
    "  activate",
    `  do javascript of file "${jsxPath}"`,
    "end tell",
  ].join("\n");
  await spawnPromise("osascript", ["-e", script]);
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
  actionUrl: string; // z.B. /uploads/Impericon_T-shirt_Woman.atn
  resultFileName: string; // z.B. result_foo.jpg
  modelDocumentUrl: string; // z.B. /uploads/base.psb
  shirtFileUrl: string; // z.B. /uploads/print_front.png
  actionName: string; // z.B. 250402_Impericon_Frontprint_FarbbereichTiefe
  layerName?: string; // default "Longsleeve"
  actionSetName?: string; // default "Standardaktionen"
  projectRoot?: string;
  timeoutMs?: number; // default 10000
  photoshopAppNameMac?: string; // default "Adobe Photoshop 2025"
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
    photoshopAppNameMac = "Adobe Photoshop 2025",
  } = params;

  const publicDir = path.resolve(projectRoot, "public");
  const uploadsDir = path.join(publicDir, "uploads");

  const rel = (u: string) => u.replace(/^\//, "").split("/").join(path.sep);

  const actionFileAbs = path.join(publicDir, rel(actionUrl));
  const shirtFileAbs = path.join(publicDir, rel(shirtFileUrl));
  const modelFileAbs = path.join(publicDir, rel(modelDocumentUrl));
  const resultFileAbs = path.join(uploadsDir, resultFileName);

  fs.mkdirSync(path.dirname(resultFileAbs), { recursive: true });

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
  });

  if (process.platform === "darwin") {
    await runMac(jsxPath, photoshopAppNameMac);
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
    if (fs.existsSync(resultFileAbs)) return;
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error("Timeout: result file not created");
}
