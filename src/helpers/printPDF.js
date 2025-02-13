const path = require("path");
const os = require("os");
const { execSync } = require("child_process");
const fs = require("fs/promises");

const printPDF = async(pdfPath, printerName) => {
  try {
    const printCommand = `powershell -Command "Start-Process -FilePath '${pdfPath}' -Verb PrintTo -ArgumentList '\\"${printerName}\\"' -PassThru | % {Start-Sleep -Seconds 2; $_} | Stop-Process";`;
    execSync(printCommand);
    return true;
} catch (error) {
    throw new Error(error);
  }
};

module.exports = {
  printPDF,
};
