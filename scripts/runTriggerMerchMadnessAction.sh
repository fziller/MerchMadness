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

while getopts f:m:s: flag
do
    case "${flag}" in
        f) RESULT_FILE_NAME=${OPTARG};;
        m) MODEL_DOCUMENT=${OPTARG};;
        s) SHIRT_FILE=${OPTARG};;
    esac
done

# Define variables to make the script more flexible
# ACTION_FILE="${PWD}/photoshop/Impericon_T-shirt_Woman.atn"

ACTION_NAME="Impericon_T-shirt_Woman"
# ACTION_NAME="Impericon_HAUPTatn"
ACTION_FILE="${PWD}/photoshop/${ACTION_NAME}.atn"
SHIRT_FILE="${PWD}/public${SHIRT_FILE}" # SHIRT_FILE already has a leading slash
MODEL_FILE="${PWD}/public${MODEL_DOCUMENT}"
LAYER_NAME="T-shirt_women"
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

# # Unless we find a better way of executing the action, we need to close Photoshop beforehand.
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

echo "Triggering script with parameters: ACTION_FILE=${ACTION_FILE} SHIRT_FILE=${SHIRT_FILE} MODEL_FILE=${MODEL_FILE} LAYER_NAME=${LAYER_NAME} ACTION_NAME=${ACTION_NAME} RESULT_FILE_PATH=${RESULT_FILE_PATH}"

ACTION_FILE=${ACTION_FILE} \
SHIRT_FILE=${SHIRT_FILE} \
MODEL_FILE=${MODEL_FILE} \
LAYER_NAME=${LAYER_NAME} \
ACTION_NAME=${ACTION_NAME} \
RESULT_FILE_PATH=${RESULT_FILE_PATH} \
open -a "${PS_APP}" --args -r ${SCRIPT_FILE}

# osascript - "$ACTION_FILE" <<EOF
# tell application "Adobe Photoshop 2025"
#     activate
#     do javascript of file \"${SCRIPT_FILE}\"
# end tell
# EOF
# osascript -e 'tell application "Adobe Photoshop 2025"' -e 'system attribute ACTION_FILE' -e 'activate' -e 'do javascript of file "${SCRIPT_FILE}"' -e 'end tell' # Faster execution when already running. 
# In case this is running on linux, we need to find a different command.






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

# TODO 
# Find a way how we can execute the script without closing and reopening photoshop
# Script should find photoshop instance itself