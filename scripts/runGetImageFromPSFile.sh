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

# Define variables to make the script more flexible
MODEL_FILE="${PWD}/public${MODEL_DOCUMENT}"
RESULT_FILE_PATH="${PWD}/public/uploads/${RESULT_FILE_NAME}"
SCRIPT_FILE="${PWD}/scripts/getImageFromPSFile.jsx"
PS_APP="Adobe Photoshop 2025"

echo "MODEL_FILE: ${MODEL_FILE}"
echo "RESULT_FILE_PATH: ${RESULT_FILE_PATH}"


# Unless we find a better way of executing the action, we need to close Photoshop beforehand.
PS_ID=$(ps -ax | grep "Photoshop" | head -1 | awk '{print $1;}')
if [[ ! -z ${PS_ID} ]]; then
  echo "Found running photoshop instance on PID ${PS_ID}. Will kill it ..."
  kill ${PS_ID} 2> /dev/null  # Kill any photoshop instance, if it is running.
fi

# PS needs some time to properly close
echo "Sleeping until PS is closed"
sleep 3


#############
# Execution #
#############

echo "Triggering script with parameters: MODEL_FILE=${MODEL_FILE} RESULT_FILE_PATH=${RESULT_FILE_PATH} open -a "${PS_APP}" --args -r ${SCRIPT_FILE}"

MODEL_FILE=${MODEL_FILE} \
RESULT_FILE_PATH=${RESULT_FILE_PATH} \
open -a "${PS_APP}" --args -r ${SCRIPT_FILE}

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