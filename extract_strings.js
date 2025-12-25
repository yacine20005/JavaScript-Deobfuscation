const fs = require('fs');

// We reproduce here the decoding functions found in the obfuscated code
function a7_0x73a(num) {
  let dec = []; let cur = num;
  do { let ch = cur & 65535; if (ch > 0) dec.push(ch); cur >>= 16; } while (cur > 0);
  return dec.reverse();
}
function a7_0x9a3(obj) {
  for (const key in obj) {
    const numbers = obj[key]; let r = [];
    if (typeof numbers === "number") r = a7_0x73a(numbers);
    else { for (let i = 0; i < numbers.length; i++) r.push(...a7_0x73a(numbers[i])); }
    obj[key] = String.fromCharCode(...r);
  }
  return obj;
}

// We read the original file to find the definition of $1
const originalCode = fs.readFileSync('deobfuscated.js', 'utf8');
// We extract what is between a7_0x9a3([ and ]);
const match = originalCode.match(/a7_0x9a3\(\[([\s\S]*?)\]\);/);

if (match) {
    // We recreate the array properly using eval on the extracted part
    const tableData = eval("[" + match[1] + "]");
    const decodedStrings = a7_0x9a3(tableData);
    
    fs.writeFileSync('strings.json', JSON.stringify(decodedStrings, null, 2));
    console.log("Success: " + Object.keys(decodedStrings).length + " strings extracted.");
} else {
    console.error("Unable to find the $1 array in background.js");
}
