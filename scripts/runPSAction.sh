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
ACTION_FILE="Impericon_T-shirt_Woman.atn"
SCRIPT_FILE="triggerMerchMadnessAction.jsx"
MODEL_FILE="T-shirt_Women_Model.psb"
SHIRT_FILE="T-shirt_Women_Motiv1.webp"
PS_APP="Adobe Photoshop 2025"

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

# 1. Automation should be available in the photoshop directory of the repo (Maybe uploaded?)
# 2. Script should be available in the script directory of the repo
echo "Step 1"
sudo cp scripts/${SCRIPT_FILE} /Applications/Adobe\ Photoshop\ 2025/Presets/Scripts/
echo "Step 2"
sudo cp photoshop/${ACTION_FILE} /Applications/Adobe\ Photoshop\ 2025/Presets/Actions/
echo "Step 3"
sudo cp model/${MODEL_FILE} /Applications/Adobe\ Photoshop\ 2025/Presets/Scripts/
echo "Step 4"
sudo cp shirt/${SHIRT_FILE} /Applications/Adobe\ Photoshop\ 2025/Presets/Scripts/

# 5. Now we need to open the model file
# TODO Adapt the application name

echo "Step 5"
open -a "${PS_APP}" --args -r "/Applications/${PS_APP}/Presets/Scripts/${SCRIPT_FILE}"

# TODO
# Copy the image file into clipboard
# Select layer in the opened model file
# Find a proper way to store the result as image to provide it.