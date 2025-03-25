const { logToFile } = require("../helpers/logToFile");
const { printerList } = require("../helpers/printerList");

const getPrinterList = async(req,res)=>{
    logToFile("GET /printer-list");
    const printerArray = await printerList(res);
    return res.status(200).json(printerArray)
}
module.exports = {
    getPrinterList
}