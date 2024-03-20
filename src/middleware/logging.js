const { createLogger, format, transports } = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const moment = require('moment-timezone');

const timeZone = 'Asia/Ho_Chi_Minh';

const formatDate = (info) => {
  return `${moment().tz(timeZone).format('YYYY-MM-DD HH:mm:ss')} ${info.message}`;
};

const createTransport = (level, filename) => {
  return new DailyRotateFile({
    level: level,
    filename: filename,
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
    format: format.combine(
      format.timestamp(),
      format.printf(info => formatDate(info))
    )
  });
};

const customerLogger = createLogger({
  level: 'info',
  transports: [
    createTransport('info', './src/logs/Server-info-%DATE%.log'),
    createTransport('error', './src/logs/Server-error-%DATE%.log'),
    createTransport('debug', './src/logs/Server-debug-%DATE%.log'),
    createTransport('warn', './src/logs/Server-warning-%DATE%.log')
  ],
  exceptionHandlers: [
    new transports.File({
      filename: `./src/logs/Exception-error-${moment().tz(timeZone).format('YYYY-MM-DD')}.log`,
      format: format.combine(
        format.timestamp(),
        format.printf(info => formatDate(info))
      )
    })
  ]
});

customerLogger.on('rotate', function (oldFilename, newFilename) {
  console.log('Rotating log files...');
  console.log('Old Filename:', oldFilename);
  console.log('New Filename:', newFilename);
});

module.exports = customerLogger;
