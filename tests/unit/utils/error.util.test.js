const { ApiError } = require('../../../src/utils/error.util');

describe('Error Util', () => {
  describe('ApiError', () => {
    it('should create an instance with statusCode and message', () => {
      const error = new ApiError('Test error', 400);
      
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(400);
      expect(error.status).toBe('fail'); // For 4xx errors, status is "fail"
    });

    it('should set status to "error" for 5xx errors', () => {
      const error = new ApiError('Server error', 500);
      
      expect(error.status).toBe('error');
    });

    it('should be operational', () => {
      const error = new ApiError('Test error', 400);
      
      expect(error.isOperational).toBe(true);
    });
  });
});
