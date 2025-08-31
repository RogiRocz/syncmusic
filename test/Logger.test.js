import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import path from 'path';

const logPath = './test.log';

jest.unstable_mockModule('fs', () => ({
  existsSync: jest.fn(),
  appendFile: jest.fn(),
  mkdirSync: jest.fn(),
  default: {
    existsSync: jest.fn(),
    appendFile: jest.fn(),
    mkdirSync: jest.fn(),
  }
}));

describe('Logger', () => {
  let Logger;
  let fs;

  beforeEach(async () => {
    jest.resetModules();
    process.env.LOGGING_PATH = logPath;
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});

    // Dynamically import modules after mocking and resetting modules
    fs = await import('fs');
    Logger = (await import('../logs/Logger.js')).default;
  });

  afterEach(() => {
    jest.clearAllMocks();
    delete process.env.LOGGING_PATH;
  });

  it('should log a message to the console', () => {
    Logger.info('This is a test message');
    expect(console.log).toHaveBeenCalledWith('[INFO] This is a test message');
  });

  it('should write a log message to the file', () => {
    const logMessage = 'This is a test message';

    fs.default.existsSync.mockReturnValue(true);
    Logger.info(logMessage);

    expect(fs.default.appendFile).toHaveBeenCalledTimes(1);
    const logDataString = fs.default.appendFile.mock.calls[0][1];
    const logData = JSON.parse(logDataString);

    expect(logData).toMatchObject({
      level: 'info',
      message: logMessage,
    });
    expect(logData).toHaveProperty('timestamp');
  });

  it('should handle the case where LOGGING_PATH is not defined', async () => {
    delete process.env.LOGGING_PATH;
    jest.resetModules() // Reset modules to re-import Logger with the new env var
    const NewLogger = (await import('../logs/Logger.js')).default;
    const newFs = await import('fs');

    NewLogger.info('This is a test message');
    expect(console.error).toHaveBeenCalledWith(
      'LOGGING_PATH não está definido. O log não será gravado em arquivo.'
    );
    expect(newFs.default.appendFile).not.toHaveBeenCalled();
  });

  it('should call the log method with the correct log level for info', () => {
    const logSpy = jest.spyOn(Logger, 'log');
    Logger.info('This is an info message');
    expect(logSpy).toHaveBeenCalledWith('info', 'This is an info message');
  });

  it('should call the log method with the correct log level for debug', () => {
    const logSpy = jest.spyOn(Logger, 'log');
    Logger.debug('This is a debug message');
    expect(logSpy).toHaveBeenCalledWith('debug', 'This is a debug message');
  });

  it('should call the log method with the correct log level for error', () => {
    const logSpy = jest.spyOn(Logger, 'log');
    Logger.error('This is an error message');
    expect(logSpy).toHaveBeenCalledWith('error', 'This is an error message');
  });
});
