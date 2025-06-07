const { exec } = require("child_process");
const { writeLog } = require("../misc/writeLog");

function listarImpresorasWindows() {
  return new Promise((resolve, reject) => {
    exec("wmic printer get Name", { shell: true }, (err, stdout, stderr) => {
      if (err) return reject(err);
      const lines = stdout
        .split(/\r?\n/)
        .slice(1)
        .map((line) => line.trim())
        .filter((line) => line.length > 0);
      resolve(lines);
    });
  });
}

const getPrinterList = async (req, res) => {
  if (process.platform === "win32") {
    try {
      writeLog("Obteniendo impresoras vía WMIC en Windows...");
      const names = await listarImpresorasWindows();
      const lista = names.map((name) => ({ name }));
      return res.json(lista);
    } catch (err) {
      console.error("Error listando impresoras en Windows:", err);
      return res.status(500).json({
        error: "No se pudieron listar impresoras en Windows",
        detalle: err.message || err.toString(),
      });
    }
  } else {
    exec(
      "lpstat -p | grep \"printer \" | awk '{print $2}'",
      (err, stdout, stderr) => {
        if (err) {
          console.error("Error listando impresoras en Unix:", err);
          return res.status(500).json({
            error: "No se pudieron listar impresoras en Unix",
            detalle: err.message || err.toString(),
          });
        }
        const names = stdout
          .split(/\r?\n/)
          .map((line) => line.trim())
          .filter((line) => line.length > 0);
        const lista = names.map((name) => ({ name }));
        return res.json(lista);
      }
    );
  }
};
module.exports = {
  getPrinterList,
};
