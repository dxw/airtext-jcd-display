#!/bin/bash

# Script to create a zip archive for JCDecaux with only the minimum necessary folders and files
# Edit the ITEMS array below to include/exclude folders and files
ITEMS=(
  build
  config
  data
  images
  index.html
)

# Set the output filename with timestamp
OUTPUT_FILE="jcd-zip/airtext-jcd-$(date +%Y%m%d-%H%M%S).zip"

# Navigate to the project root directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_ROOT" || exit 1

echo "Creating archive: $OUTPUT_FILE"
echo "Including: ${ITEMS[*]}"

# Create zip archive with only the specified folders
if zip -r "$OUTPUT_FILE" \
  "${ITEMS[@]}" \
  -x "*.DS_Store" \
  -x "__MACOSX/*"; then
  echo "✓ Archive created successfully: $OUTPUT_FILE"
  echo "  Size: $(du -h "$OUTPUT_FILE" | cut -f1)"
else
  echo "✗ Error creating archive"
  exit 1
fi
