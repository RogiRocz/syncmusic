import fs from 'fs';
import path from 'path';

class Logger {
    static log(level, message, details = {}) {
        const logData = {
            level,
            message,
            timestamp: new Date().toLocaleString('pt-BR'),
            ...details
        };

        console.log(JSON.stringify(logData, null, 2));

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

    static info(message, details = {}) {
        this.log('info', message, details);
    }

    static error(message, details = {}) {
        this.log('error', message, details);
    }

    static warn(message, details = {}) {
        this.log('warn', message, details);
    }

    static debug(message, details = {}) {
        this.log('debug', message, details);
    }
}

export default Logger;
