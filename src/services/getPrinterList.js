const { printerList } = require("../helpers/printerList");

const getPrinterList = async(req,res)=>{
    const printerArray = await printerList(res);
    return res.status(200).json(printerArray)
}
module.exports = {
    getPrinterList
}