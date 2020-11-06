// 4XX status code related to client side error
// 5XX status code related to server side error

const getErrorStatus = require('./constants/errorData');

function findErrorMessage(status) {
  return getErrorStatus.ERROR_STATUS_ARRAY.find((v) => v.status === status) || { error: 'There must be an error' };
}

const sucessResponse = (status, message, data) => ({
  status,
  message,
  data,
});

const errorResponse = (statusCode) => findErrorMessage(statusCode);

module.exports = {
  errorResponse,
  sucessResponse,
};
