const fs = require('fs');
const path = require('path');

// Folder containing the files (Change this if needed)
const folderPath = './'; // Current directory

// Function to make filenames URL-friendly
function sanitizeFilename(filename) {
    return filename
        .toLowerCase() // Convert to lowercase
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/[^a-z0-9.-]/g, '') // Remove special characters except dots and hyphens
        .replace(/-+/g, '-') // Remove duplicate hyphens
        .replace(/^\.+|\.+$/g, ''); // Remove leading/trailing dots
}

// Process files in the folder
fs.readdir(folderPath, (err, files) => {
    if (err) {
        console.error('Error reading directory:', err);
        return;
    }

    files.forEach(file => {
        const oldPath = path.join(folderPath, file);
        const ext = path.extname(file); // Get file extension
        const name = path.basename(file, ext); // Get filename without extension
        const newName = sanitizeFilename(name) + ext; // Clean the name and add extension
        const newPath = path.join(folderPath, newName);

        // Rename file if the name has changed
        if (file !== newName) {
            fs.rename(oldPath, newPath, err => {
                if (err) {
                    console.error(`Error renaming ${file}:`, err);
                } else {
                    console.log(`Renamed: ${file} → ${newName}`);
                }
            });
        }
    });
});
