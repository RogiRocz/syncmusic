import fs from 'fs';
import path from 'path';

class Logger {
    static log(level, message) {
        const logData = {
            level,
            message,
            timestamp: new Date().toLocaleString('pt-BR'),
        };
            console.log(JSON.stringify(logData));

        if (level === 'info' || level === 'error') {
            const logPath = process.env.LOGGING_PATH;
            if (!logPath) {
                console.error('LOGGING_PATH não está definido. O log não será gravado em arquivo.');
                return;
            }

            const logMessage = JSON.stringify(logData) + '\n';

            const logDir = path.dirname(logPath);
            if (!fs.existsSync(logDir)) {
                fs.mkdirSync(logDir, { recursive: true });
            }

            fs.appendFile(logPath, logMessage, (err) => {
                if (err) {
                    console.error('Erro ao escrever no arquivo de log:', err);
                }
            });
        }
    }

    static info(message) {
        this.log('info', message);
    }

    static debug(message) {
        this.log('debug', message);
    }

    static warn(message){
        this.log('warn', message);
    }

    static error(message) {
        this.log('error', message);
    }
}

export default Logger;
