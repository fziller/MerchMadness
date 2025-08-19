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

function writeJsx(
  modelFileAbs: string,
  resultFileAbs: string,
  destJsxPath: string
) {
  // Backslashes für ExtendScript doppeln
  const esc = (p: string) => p.replace(/\\/g, "\\\\");
  const jsx = `
// #target photoshop
var debugStep = 1;
try {
  var modelFile = File("${esc(modelFileAbs)}");
  open(modelFile);

  debugStep = 2;
  // TODO: ggf. gewünschten Layer selektieren

  var file = new File("${esc(resultFileAbs)}");
  var options = new JPEGSaveOptions();
  options.quality = 12;
  options.embedColorProfile = true;
  options.formatOptions = FormatOptions.OPTIMIZEDBASELINE;

  debugStep = 8;
  app.activeDocument.saveAs(file, options, true, Extension.LOWERCASE);
} catch (e) {
  alert("Error on step " + debugStep + ": " + e.message);
}
`;
  fs.mkdirSync(path.dirname(destJsxPath), { recursive: true });
  fs.writeFileSync(destJsxPath, jsx, "utf8");
}

async function runMac(jsxPath: string) {
  const psApp = "Adobe Photoshop 2025";
  // osascript AppleScript inline
  const script = [
    'tell application "' + psApp + '"',
    "  activate",
    '  do javascript of file "' + jsxPath + '"',
    "end tell",
  ].join("\n");
  await spawnPromise("osascript", ["-e", script]);
}

async function runWinViaPowerShell(jsxPath: string) {
  // pwsh bevorzugen, sonst powershell
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
  // Fallback ohne PowerShell: WSH/JScript via cscript.exe
  // COM über ActiveX aus JScript ansprechen
  const wshFile = path.join(os.tmpdir(), `ps-wsh-${Date.now()}.js`);
  const js = `
var jsx = WScript.Arguments.Item(0);
var app = new ActiveXObject("Photoshop.Application");
app.DoJavaScriptFile(jsx, null, 1);
`;
  fs.writeFileSync(wshFile, js, "utf8");
  const cscript = path.join(
    process.env.SystemRoot || "C:\\Windows",
    "System32",
    "cscript.exe"
  );
  await spawnPromise(cscript, ["//Nologo", wshFile, jsxPath]);
}

export async function runGetImageFromPSFile(params: {
  resultFileName: string;
  documentUrl: string;
  projectRoot?: string;
}) {
  const projectRoot = params.projectRoot || process.cwd();
  const publicDir = path.resolve(projectRoot, "public");
  const uploadsDir = path.join(publicDir, "uploads");

  // Eingaben auflösen
  const modelRel = params.documentUrl
    .replace(/^\//, "")
    .split("/")
    .join(path.sep);
  const modelAbs = path.join(publicDir, modelRel);
  const resultAbs = path.join(uploadsDir, params.resultFileName);

  fs.mkdirSync(path.dirname(resultAbs), { recursive: true });

  // JSX schreiben (ein zentrales Script, OS-neutral)
  const jsxPath = path.join(projectRoot, "scripts", "getImageFromPSFile.jsx");
  writeJsx(modelAbs, resultAbs, jsxPath);

  if (process.platform === "darwin") {
    await runMac(jsxPath);
  } else if (process.platform === "win32") {
    try {
      await runWinViaPowerShell(jsxPath);
    } catch {
      // Fallback ohne PowerShell
      await runWinViaWSH(jsxPath);
    }
  } else {
    throw new Error(`Unsupported platform: ${process.platform}`);
  }

  // Poll auf Ergebnis (max ~30s)
  const deadline = Date.now() + 30_000;
  while (Date.now() < deadline) {
    if (fs.existsSync(resultAbs)) return;
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error("Timeout: result file not created");
}
