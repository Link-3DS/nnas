const colors = require('colors');
const moment = require('moment');

function log(type, message) {
  const timestamp = moment().format('YYYY-MM-DD HH:mm:ss');
  const formatted = `[${timestamp}] [${type.toUpperCase()}] ${message}`;

  switch (type) {
    case 'info':
      console.log(colors.blue(formatted));
      break;
    case 'warn':
      console.warn(colors.yellow(formatted));
      break;
    case 'error':
      console.error(colors.red(formatted));
      break;
    case 'success':
      console.log(colors.green(formatted));
      break;
    case 'database':
      console.log(colors.cyan(formatted));
      break;
    default:
      console.log(formatted);
  }
}

module.exports = {
  info: (msg) => log('info', msg),
  warn: (msg) => log('warn', msg),
  error: (msg) => log('error', msg),
  success: (msg) => log('success', msg),
  database: (msg) => log('database', msg),
};