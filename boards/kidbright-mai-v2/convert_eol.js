const fs = require('fs');
const path = require('path');

const files = process.argv.slice(2);

if (files.length === 0) {
  console.log("Usage: node convert_eol.js <file1> <file2> ...");
  process.exit(1);
}

files.forEach(file => {
  const filePath = path.resolve(file);
  if (fs.existsSync(filePath)) {
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      // Convert CRLF to LF
      const newContent = content.replace(/\r\n/g, '\n');

      if (content !== newContent) {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`Converted: ${file}`);
      } else {
        console.log(`Skipped (already LF): ${file}`);
      }
    } catch (err) {
      console.error(`Error processing ${file}: ${err.message}`);
    }
  } else {
    console.error(`File not found: ${file}`);
  }
});
