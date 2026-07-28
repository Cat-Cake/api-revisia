const pdfParse = require('pdf-parse');

async function extractText(buffer) {
  const { text } = await pdfParse(buffer);
  return cleanText(text);
}

function cleanText(text) {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

module.exports = { extractText, cleanText };
