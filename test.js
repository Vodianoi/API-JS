const fs = require('fs');
const homedir = require('os').homedir();
function getIcon(item) {
    if (item.isDirectory()) {
        return '📁';
    }
    return '🌷';
}
async function listFilesOf(path) {
    const files = await fs.promises.readdir(path, {withFileTypes: true});
    return files.map((file) => {
        return `${getIcon(file)} ${file.name}`
    });
}
const logFiles = files => {
    for (const file of files) {
        console.log(file);
    }
};
listFilesOf(homedir)
    .then(files => {
        logFiles(files);
        return files.length;
    })
    .then(filesCount => {
        console.error(`Done! The folder "${homedir}" contains ${filesCount} items`);
    })
    .catch(error => {
        console.error(`Cannot list the folder "${homedir}"`, error);
    });