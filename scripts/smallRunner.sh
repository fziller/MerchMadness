osascript <<EOF
tell application "Adobe Photoshop 2025"
    activate
    do javascript of file "${PWD}/scripts/triggerMerchMadnessAction.jsx"
end tell
EOF