# !/bin/bash
# In order to trigger a photoshop automation, we need to do the following:

# 1. We need to have the proper automation in place (*.atn)
# 2. We need to have the script that will execute the automation in place (*.jsx)
# 3. *.jsx needs to be copied into the photoshop presets/scripts folder
# 4. *.atn needs to be copied into the photoshop presets/actions folder
# 5. The basic model file needs to be opened (*.psb)
# 6. The shirt image needs to be copied into the tray
# 7. The automation will be triggered
# 8. We need to export the resulting image somehow.

###############
# Prequisites # 
###############

while getopts a:c:f:m:n:s: flag
do
    case "${flag}" in
        a) ACTION=${OPTARG};;
        c) MOTIV=${OPTARG};;
        f) RESULT_FILE_NAME=${OPTARG};;
        m) MODEL_DOCUMENT=${OPTARG};;
        n) ACTION_NAME=${OPTARG};;
        s) SHIRT_FILE=${OPTARG};;
    esac
done

# Define variables to make the script more flexible
# ACTION_FILE="${PWD}/photoshop/Impericon_T-shirt_Woman.atn"

# ACTION_NAME="Impericon_HAUPTatn"
# ACTION_NAME="haupt_atn_großes_motiv"

# ACTION_NAME="${MOTIV}"
# ACTION_FILE="${PWD}/photoshop/${ACTION_NAME}.atn"
echo "Our action file: ${ACTION}"
ACTION_FILE="${PWD}/public${ACTION}"
SHIRT_FILE="${PWD}/public${SHIRT_FILE}" # SHIRT_FILE already has a leading slash
MODEL_FILE="${PWD}/public${MODEL_DOCUMENT}"
LAYER_NAME="Longsleeve"
RESULT_FILE_PATH="${PWD}/public/uploads/${RESULT_FILE_NAME}"
PS_APP="Adobe Photoshop 2025"
SCRIPT_FILE="${PWD}/scripts/triggerMerchMadnessAction.jsx"


# TODO This is a workoTshirt
# if [[ ${MODEL_FILE} == "*T_shirt_man*" ]]; then
#     echo "Man T-shirt"
#     LAYER_NAME="Tshirt"
# fi
# if [[ ${MODEL_FILE} == "*T_shirt_Woman_Model*" ]]; then
#     echo "Woman T-shirt"
#     LAYER_NAME="T-shirt_women"
# fi
# if [[ ${MODEL_FILE} == "*Longsleeve-man*" ]]; then
#     echo "Longsleeve T-shirt"
#     LAYER_NAME="Longsleeve"
# fi

# No need to wait for Photoshop to be closed and opened before.
# PS_ID=$(ps -ax | grep "Photoshop" | head -1 | awk '{print $1;}')
# if [[ ! -z ${PS_ID} ]]; then
#   echo "Found running photoshop instance on PID ${PS_ID}. Will kill it ..."
#   kill ${PS_ID} 2> /dev/null  # Kill any photoshop instance, if it is running.
# fi

# # PS needs some time to properly close
# echo "Sleeping until PS is closed"
# sleep 5


#############
# Execution #
#############
# Old way of executing the action.
# ACTION_FILE=${ACTION_FILE} \
# SHIRT_FILE=${SHIRT_FILE} \
# MODEL_FILE=${MODEL_FILE} \
# LAYER_NAME=${LAYER_NAME} \
# ACTION_NAME=${ACTION_NAME} \
# RESULT_FILE_PATH=${RESULT_FILE_PATH} \
# open -a "${PS_APP}" --args -r ${SCRIPT_FILE}

# Creates or overrides a script with given variables to execute fast and directly.
cat > ${SCRIPT_FILE} <<EOF
// #target photoshop

// Magic function coming up to delete already created actions and cleaning up
function deleteActions(setName) {
  var ref = new ActionReference();
  ref.putName(stringIDToTypeID("actionSet"), setName);

  var desc = new ActionDescriptor();
  desc.putReference(stringIDToTypeID("null"), ref);

  try {
    executeAction(stringIDToTypeID("delete"), desc, DialogModes.NO);
  } catch (e) {
    alert("Fehler: " + e);
  }
}

var debugStep = 1;

try {
  while (app.documents.length > 0) {
    app.activeDocument.close(SaveOptions.DONOTSAVECHANGES);
  }
  // Load automation
  app.load(File("${ACTION_FILE}"));
  debugStep = 2;
  // Copy the image into the clipboard
  var shirtImage = File("${SHIRT_FILE}");
  app.open(shirtImage);
  app.activeDocument.selection.selectAll();
  app.activeDocument.selection.copy();

  debugStep = 3;
  var modelFile = File("${MODEL_FILE}");
  open(modelFile);

  // We need to switch to the correct layer so that the automation can actually handle it.
  debugStep = 4;
  var layers = app.activeDocument.artLayers;
  for (var i = 0; i < layers.length; i++) {
    if (layers[i].name === $.getenv("LAYER_NAME")) {
      app.activeDocument.activeLayer = layers[i];
      break;
    }
  }

  // 1st param is name of action, second is set of actions.
  // TODO i18n can make this one complicated
  debugStep = 5;
  app.doAction("${ACTION_NAME}", "Standardaktionen");

  debugStep = 6;
  // Navigate back to modelfile
  open(modelFile);

  debugStep = 7;
  // // Save the file to jpg after action is successful
  var file = new File("${RESULT_FILE_PATH}");
  var options = new JPEGSaveOptions();
  options.quality = 12; // Maximalqualität (1-12)
  options.embedColorProfile = true;
  options.formatOptions = FormatOptions.OPTIMIZEDBASELINE;

  debugStep = 8;
  app.activeDocument.saveAs(file, options, true, Extension.LOWERCASE);


  //while (app.documents.length > 0) {
  //  app.documents[0].close(SaveOptions.DONOTSAVECHANGES);
  //}  
  // var idquit = charIDToTypeID( "quit" );
  // executeAction( idquit, undefined, DialogModes.ALL );
} catch (e) {
  // alert("Error on step " + debugStep + ": " + e.message);
  // app.ActiveDocument.Close(SaveOptions.DONOTSAVECHANGES)
} finally {
  deleteActions("Standardaktionen");
}
EOF

# Execute via Applescript. // TODO in case we run on another environment, we need to find a better way.
osascript <<EOF
tell application "${PS_APP}"
    activate
    do javascript of file "${SCRIPT_FILE}"
end tell
EOF

# We try to find the file for 10 seconds. If it can not be found by then, something went wrong.
for((index = 0; index <= 5; index++)); do
    if [[ ! -f ${RESULT_FILE_PATH} ]]; then
        echo "Could not find result file. Sleeping for 2 seconds"
        sleep 2
    else
        # If we successfully could find the result file, we want to return with success.
        exit 0
    fi
done

# If we could not find the file in time, we want return error
exit 1
