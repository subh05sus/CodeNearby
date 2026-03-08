#!/bin/bash

# MongoDB Migration Script using mongodump and mongorestore
# This is more robust for very large databases.

if [ "$#" -ne 2 ]; then
    echo "Usage: ./migrate-db.sh <SOURCE_URI> <TARGET_URI>"
    echo "Example: ./migrate-db.sh \"mongodb+srv://user:pass@source.mongodb.net/db\" \"mongodb+srv://user:pass@target.mongodb.net/db\""
    exit 1
fi

SOURCE_URI=$1
TARGET_URI=$2

# Create a temporary directory for the dump
TMP_DUMP_DIR=$(mktemp -d)
echo "Created temporary dump directory: $TMP_DUMP_DIR"

echo "Dumping source database..."
mongodump --uri="$SOURCE_URI" --out="$TMP_DUMP_DIR"

if [ $? -eq 0 ]; then
    echo "Dump completed successfully."
    
    echo "Restoring to target database..."
    mongorestore --uri="$TARGET_URI" "$TMP_DUMP_DIR"
    
    if [ $? -eq 0 ]; then
        echo "Restore completed successfully!"
    else
        echo "Error: Restore failed."
    fi
else
    echo "Error: Dump failed."
fi

# Cleanup
echo "Cleaning up temporary files..."
rm -rf "$TMP_DUMP_DIR"

echo "Migration process finished."
