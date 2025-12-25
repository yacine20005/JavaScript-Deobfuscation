const fs = require('fs');
const path = require('path');

// We load the extracted strings
const strings = JSON.parse(fs.readFileSync('strings.json', 'utf8'));
const baseDir = './decoded';

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace $1[index] (decimal or hex) with the actual string
    content = content.replace(/\$1\[(0x[0-9a-fA-F]+|[0-9]+)\]/g, (match, index) => { // the regex captures decimal or hex numbers
        const idx = parseInt(index);
        const val = strings[idx];
        return val !== undefined ? `"${val.replace(/"/g, '\\"')}"` : match;
    });

    // Merge concatenations "a" + "b"
    content = content.replace(/" \+ "/g, "");

    fs.writeFileSync(filePath.replace('.js', '.readable.js'), content);
    console.log("File created: " + filePath.replace('.js', '.readable.js'));
}

// Recursive traversal of folders in /decoded
function walk(dir) {
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.lstatSync(fullPath).isDirectory()) walk(fullPath);
        else if (file.endsWith('deobfuscated.js')) processFile(fullPath);
    });
}

walk(baseDir);
