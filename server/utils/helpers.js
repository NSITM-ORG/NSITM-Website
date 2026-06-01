import chalk from 'chalk';

// Logger utility
const logger = {
  info: (message) => console.log(chalk.blue(`ℹ ${message}`)),
  success: (message) => console.log(chalk.green(`✓ ${message}`)),
  warning: (message) => console.log(chalk.yellow(`⚠ ${message}`)),
  error: (message) => console.log(chalk.red(`✗ ${message}`)),
};

// Response formatter
const sendResponse = (res, statusCode, success, message, data = null) => {
  const response = {
    success,
    message,
  };

  if (data) {
    response.data = data;
  }

  return res.status(statusCode).json(response);
};

// Success response
const successResponse = (res, message, data, statusCode = 200) => {
  return sendResponse(res, statusCode, true, message, data);
};

// Error response
const errorResponse = (res, message, statusCode = 500, errors = null) => {
  const response = {
    success: false,
    message,
  };

  if (errors) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
};

export { logger, sendResponse, successResponse, errorResponse };
