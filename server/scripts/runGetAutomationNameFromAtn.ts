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
 * @param {string} jsxPath - The path to the JSX file to run.
 * @param {string} [photoshopBundleIdMac="com.adobe.Photoshop"] - The bundle ID of Photoshop on macOS.
 * @throws {Error} If the platform is not supported.
 */
async function runPhotoshopJsx(
  jsxPath: string,
  photoshopBundleIdMac = "com.adobe.Photoshop"
) {
  console.log("Run ps automation, jsxPath: ", jsxPath);
  if (process.platform === "darwin") {
    const script = [
      `tell application id "${photoshopBundleIdMac}"`,
      "  activate",
      '  do javascript of file "' + jsxPath + '"',
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
}) {
  const { atnFileAbs, destJsxPath, metaFileAbs } = params;

  const esc = (p: string) => p.replace(/\\/g, "\\\\"); // für ExtendScript

  const jsx = `
// #target photoshop

function deleteActions(setName) {
  var ref = new ActionReference();
  ref.putName(stringIDToTypeID("actionSet"), setName);
  var desc = new ActionDescriptor();
  desc.putReference(stringIDToTypeID("null"), ref);
  try { executeAction(stringIDToTypeID("delete"), desc, DialogModes.NO); } catch (e) {}
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

var debugStep = 1;

try {
  var before = snapshotActions();
  debugStep = 2;

  app.load(File("${esc(atnFileAbs)}"));
  debugStep = 3;

  var after = snapshotActions();
  var newActions = diffSnapshots(before, after);

  var firstName = "";
  if (newActions.length > 0) {
    firstName = newActions[0].actionName;
  }

  var metaFile = new File("${esc(metaFileAbs)}");
  metaFile.encoding = "UTF8";
  metaFile.open("w");
  metaFile.write(firstName);
  metaFile.close();

} catch (e) {
  alert("Error in inspect ATN at step " + debugStep + ": " + e.message);
} finally {
    deleteActions("Standardaktionen");
}
`;

  fs.mkdirSync(path.dirname(destJsxPath), { recursive: true });
  fs.writeFileSync(destJsxPath, jsx, "utf8");
}

/**
 * Runs an ATN file and inspects the changes made to Photoshop.
 * Returns the name of the first action added by the ATN file.
 *
 * @param {Object} params - Parameters for the function.
 * @param {string} params.atnFileAbs - The absolute path to the ATN file.
 * @param {string} [params.projectRoot] - The root directory of the project. Defaults to process.cwd().
 * @param {string} [params.photoshopBundleIdMac] - The bundle ID of Photoshop on a Mac. Defaults to "com.adobe.Photoshop".
 * @returns {Promise<string>} The name of the first action added by the ATN file.
 * @throws {Error} If the ATN inspection did not produce a meta file.
 * @throws {Error} If no action name was detected in the ATN file.
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

  const stamp = Date.now();
  const jsxPath = path.join(scriptsDir, `inspectAtn_${stamp}.jsx`);
  const metaFileAbs = path.join(os.tmpdir(), `inspectAtn_${stamp}.txt`);

  console.log("Inspecting ATN file:", jsxPath);

  writeInspectAtnJsx({
    atnFileAbs,
    destJsxPath: jsxPath,
    metaFileAbs,
  });

  await runPhotoshopJsx(jsxPath, photoshopBundleIdMac);

  if (!fs.existsSync(metaFileAbs)) {
    throw new Error("ATN inspection did not produce a meta file");
  }

  const content = fs.readFileSync(metaFileAbs, "utf8").trim();
  if (!content) {
    throw new Error("No action name detected in ATN file");
  }

  return content;
}
