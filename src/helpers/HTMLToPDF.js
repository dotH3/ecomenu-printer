const path = require("path");
const os = require("os");
const { execSync } = require("child_process");
const fs = require("fs/promises");

const destinationPath = path.join(
  os.homedir(),
  "Desktop",
  "ecomenu-printer",
  "pdfs"
);

const HTMLToPDF = async (htmlPath, { zoom, height, width }) => {
  try {
    await fs.mkdir(destinationPath, { recursive: true });

    const fileName = `output_${Date.now()}_${Math.random()
      .toString(36)
      .slice(2)}.pdf`;
    const filePath = path.join(destinationPath, fileName);

    const wkhtmltopdfCommand = `powershell -Command "./wkhtmltopdf --encoding utf-8 --zoom ${zoom} --images --page-height ${height} --page-width ${width} --margin-right 0 --margin-left 0 ${htmlPath} ${filePath}"`;

    execSync(wkhtmltopdfCommand);

    return filePath;
  } catch (error) {
    throw new Error(error);
  }
};

module.exports = {
  HTMLToPDF,
};
