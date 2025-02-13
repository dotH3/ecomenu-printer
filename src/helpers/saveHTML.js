const os = require("os");
const fs = require("fs").promises;
const path = require("path");

const destinationPath = path.join(os.homedir(), "Desktop", "ecomenu-printer", "htmls");

const saveHTML = async (buffer) => {
  try {
    await fs.mkdir(destinationPath, { recursive: true });
    const fileName = `output_${Date.now()}_${Math.random().toString(36).slice(2)}.html`;
    const filePath = path.join(destinationPath, fileName);
    await fs.writeFile(filePath, buffer);
    return filePath;
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};

module.exports = {saveHTML}