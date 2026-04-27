class ApiResponse {
  static success(message, data = null) {
    return { success: true, message, data };
  }

  static error(message, errors = null) {
    const response = { success: false, message };
    if (errors) response.errors = errors;
    return response;
  }
}

module.exports = ApiResponse;
