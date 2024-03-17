const { createLogger, format, transports } = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const moment = require('moment-timezone');

const timeZone = 'Asia/HoChiMinh';

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
    createTransport('info', 'app/logs/Server-info-%DATE%.log'),
    createTransport('error', 'app/logs/Server-error-%DATE%.log'),
    createTransport('debug', 'app/logs/Server-debug-%DATE%.log'),
    createTransport('warn', 'app/logs/Server-warning-%DATE%.log')
  ],
  exceptionHandlers: [
    new transports.File({
      filename: `app/logs/Exception-error-${moment().tz(timeZone).format('YYYY-MM-DD')}.log`,
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
