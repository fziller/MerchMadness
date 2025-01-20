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

while getopts f:s: flag
do
    case "${flag}" in
        f) RESULT_FILE_NAME=${OPTARG};;
        s) SHIRT_FILE=${OPTARG};;
    esac
done

# Define variables to make the script more flexible
# ACTION_FILE="${PWD}/photoshop/Impericon_T-shirt_Woman.atn"
ACTION_FILE="${PWD}/photoshop/Impericon_T-shirt_Woman.atn"
SHIRT_FILE="${PWD}/public${SHIRT_FILE}" # SHIRT_FILE already has a leading slash
MODEL_FILE="${PWD}/model/T-shirt_Women_Model.psb"
LAYER_NAME="T-shirt_women"
ACTION_NAME="Impericon_T-shirt_Woman"
RESULT_FILE_PATH="${PWD}/public/uploads/${RESULT_FILE_NAME}"
PS_APP="Adobe Photoshop 2025"
SCRIPT_FILE="triggerMerchMadnessAction.jsx"

echo "SHIRT_FILE: ${SHIRT_FILE}"
echo "RESULT_FILE_PATH: ${RESULT_FILE_PATH}"


# Unless we find a better way of executing the action, we need to close Photoshop beforehand.
PS_ID=$(ps -ax | grep "Photoshop" | head -1 | awk '{print $1;}')
if [[ ! -z ${PS_ID} ]]; then
  echo "Found running photoshop instance on PID ${PS_ID}. Will kill it ..."
  kill ${PS_ID} 2> /dev/null  # Kill any photoshop instance, if it is running.
fi

# PS needs some time to properly close
echo "Sleeping until PS is closed"
sleep 5


#############
# Execution #
#############

echo "Triggering script with parameters: ACTION_FILE=${ACTION_FILE} SHIRT_FILE=${SHIRT_FILE} MODEL_FILE=${MODEL_FILE} LAYER_NAME=${LAYER_NAME} ACTION_NAME=${ACTION_NAME} RESULT_FILE_PATH=${RESULT_FILE_PATH} open -a "${PS_APP}" --args -r '${PWD}/scripts/${SCRIPT_FILE}'"

ACTION_FILE=${ACTION_FILE} \
SHIRT_FILE=${SHIRT_FILE} \
MODEL_FILE=${MODEL_FILE} \
LAYER_NAME=${LAYER_NAME} \
ACTION_NAME=${ACTION_NAME} \
RESULT_FILE_PATH=${RESULT_FILE_PATH} \
open -a "${PS_APP}" --args -r "${PWD}/scripts/${SCRIPT_FILE}"

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