const Validation = require('../../../src/utils/validation.util');
const { ApiError } = require('../../../src/utils/error.util');

describe('Validation Util', () => {
  it('should be defined', () => {
    expect(Validation).toBeDefined();
  });

  describe('validateUserRegistration', () => {
    it('should pass validation with valid data', () => {
      const validData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      };
      
      expect(() => Validation.validateUserRegistration(validData)).not.toThrow();
    });

    it('should throw ApiError with invalid data', () => {
      const invalidData = {
        name: 'T', // Too short
        email: 'notanemail',
        password: '123' // Too short
      };
      
      expect(() => Validation.validateUserRegistration(invalidData)).toThrow(ApiError);
    });
  });
});