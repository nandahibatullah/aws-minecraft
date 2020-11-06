// 40X - Client Side Error
// 50X - Server Side Error

module.exports = {
  ERROR_STATUS_ARRAY: [
    {
      status: '400',
      message: 'Bad Request',
      data: 'Error making a request to the server',
    },
    {
      status: '502',
      message: 'Bad Gateway',
      data: 'Error while performing actions on the server',
    },
  ],
};
