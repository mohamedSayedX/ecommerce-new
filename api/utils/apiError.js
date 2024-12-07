//@desc this calss is responsible for operational errors that i cant predict
class ApiError extends Error {
  
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith(4) ? "fail" : "error";
    this.isOperational = true;
  }
  
}

module.exports = ApiError;
