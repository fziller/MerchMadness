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

# Define variables to make the script more flexible
ACTION_FILE="${PWD}/photoshop/Impericon_T-shirt_Woman.atn"
SHIRT_FILE="${PWD}/shirt/T-shirt_Women_Motiv1.webp"
MODEL_FILE="${PWD}/model/T-shirt_Women_Model.psb"
LAYER_NAME="T-shirt_women"
ACTION_NAME="Impericon_T-shirt_Woman"
RESULT_FILE_PATH="${PWD}/result/result.jpg"
# RESULT_FILE_PATH="~/Downloads/merchmadness_result.jpg"
PS_APP="Adobe Photoshop 2025"
SCRIPT_FILE="triggerMerchMadnessAction.jsx"

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

ACTION_FILE=${ACTION_FILE} \
SHIRT_FILE=${SHIRT_FILE} \
MODEL_FILE=${MODEL_FILE} \
LAYER_NAME=${LAYER_NAME} \
ACTION_NAME=${ACTION_NAME} \
RESULT_FILE_PATH=${RESULT_FILE_PATH} \
open -a "${PS_APP}" --args -r "${PWD}/scripts/${SCRIPT_FILE}"

# TODO
# Copy the image file into clipboard
# Select layer in the opened model file
# Find a proper way to store the result as image to provide it.