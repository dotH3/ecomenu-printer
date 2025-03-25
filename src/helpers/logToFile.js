const fs = require('fs');
const path = require('path');
const os = require('os');

const destinationPath = path.join(os.homedir(), "Desktop", "ecomenu-printer");

const logToFile = (message) => {
    const logFilePath = path.join(destinationPath, 'log.txt');

    if (!fs.existsSync(destinationPath)){
        fs.mkdirSync(destinationPath, { recursive: true });
    }

    const now = new Date();
    const timestamp = now.toISOString(); 

    const logMessage = `[${timestamp}] ${message}`;

    fs.appendFile(logFilePath, `${logMessage}\n`, (err) => {
        if (err) {
            console.error('Error writing to log file:', err);
        }
    });
}

module.exports = {
    logToFile
}
