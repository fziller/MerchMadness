# !/bin/bash

###############
# Prequisites # 
###############

while getopts f:m: flag
do
    case "${flag}" in
        f) RESULT_FILE_NAME=${OPTARG};;
        m) MODEL_DOCUMENT=${OPTARG};;
    esac
done

echo "our directory from shell: ${PWD}"

# Define variables to make the script more flexible
MODEL_FILE="${PWD}/public${MODEL_DOCUMENT}"
RESULT_FILE_PATH="${PWD}/public/uploads/${RESULT_FILE_NAME}"
SCRIPT_FILE="${PWD}/scripts/getImageFromPSFile.jsx"
PS_APP="Adobe Photoshop 2025"

echo "MODEL_FILE: ${MODEL_FILE}"
echo "RESULT_FILE_PATH: ${RESULT_FILE_PATH}"

#############
# Execution #
#############

cat > ${SCRIPT_FILE} <<EOF
// #target photoshop

// Open the model file which was copied before

var debugStep = 1;

try {
  // Load automation
  var modelFile = File("${MODEL_FILE}");
  open(modelFile);

  // We need to switch to the correct layer so that the automation can actually handle it.
  debugStep = 2;

  // // Save the file to jpg after action is successful
  var file = new File("${RESULT_FILE_PATH}");
  var options = new JPEGSaveOptions();
  options.quality = 12; // Maximalqualität (1-12)
  options.embedColorProfile = true;
  options.formatOptions = FormatOptions.OPTIMIZEDBASELINE;

  debugStep = 8;
  app.activeDocument.saveAs(file, options, true, Extension.LOWERCASE);
} catch (e) {
  alert("Error on step " + debugStep + ": " + e.message);
}
EOF

osascript <<EOF
tell application "${PS_APP}"
    activate
    do javascript of file "${SCRIPT_FILE}"
end tell
EOF

# We try to find the file for 30 seconds. If it can not be found by then, something went wrong.
for((index = 0; index <= 15; index++)); do
    if [[ ! -f ${RESULT_FILE_PATH} ]]; then
        echo "Could not find result file. Sleeping for 5 seconds"
        sleep 2
    else
        # If we successfully could find the result file, we want to return with success.
        exit 0
    fi
done

# If we could not find the file in time, we want return error
exit 1

# TODO 
# Find a way how we can execute the script without closing and reopening photoshop
# Script should find photoshop instance itself