const fs = require('fs');
const path = require('path');

/**
 * Logger utility for consistent application logging
 */
class Logger {
  constructor() {
    this.logDir = path.join(__dirname, '../../logs');
    
    // Create logs directory if it doesn't exist
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  /**
   * Format a log message
   */
  formatMessage(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    return JSON.stringify({
      timestamp,
      level,
      message,
      ...meta
    }) + '\n';
  }

  /**
   * Write log to file
   */
  writeToFile(content, filename) {
    const filePath = path.join(this.logDir, filename);
    fs.appendFileSync(filePath, content);
  }

  /**
   * Log info level message
   */
  info(message, meta = {}) {
    const content = this.formatMessage('info', message, meta);
    console.log(message, meta);
    this.writeToFile(content, 'app.log');
  }

  /**
   * Log error level message
   */
  error(message, error = null, meta = {}) {
    const errorMeta = error ? {
      error: {
        message: error.message,
        stack: error.stack
      },
      ...meta
    } : meta;
    
    const content = this.formatMessage('error', message, errorMeta);
    console.error(message, errorMeta);
    this.writeToFile(content, 'error.log');
  }

  /**
   * Log warning level message
   */
  warn(message, meta = {}) {
    const content = this.formatMessage('warn', message, meta);
    console.warn(message, meta);
    this.writeToFile(content, 'app.log');
  }

  /**
   * Log security events specifically for audit purposes
   */
  security(message, meta = {}) {
    const content = this.formatMessage('security', message, meta);
    console.log(`[SECURITY] ${message}`, meta);
    this.writeToFile(content, 'security.log');
  }

  /**
   * Log database operations for debugging
   */
  db(message, meta = {}) {
    if (process.env.NODE_ENV === 'development') {
      const content = this.formatMessage('db', message, meta);
      console.log(`[DB] ${message}`);
      this.writeToFile(content, 'db.log');
    }
  }
}

module.exports = new Logger();
