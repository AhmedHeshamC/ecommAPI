import jwt from 'jsonwebtoken';

// Helper to generate fake auth tokens for testing
export const getTestAuthToken = (role = 'user'): string => {
  return jwt.sign({ id: 1, role }, 'test-secret');
};

// Mock request user for controller unit tests
export const getMockRequestUser = (role = 'user') => ({
  id: 1,
  name: role === 'admin' ? 'Admin User' : 'Regular User',
  email: role === 'admin' ? 'admin@example.com' : 'user@example.com',
  role
});

// Add HTTP headers with auth token
export const withAuth = (request: any, role = 'user'): any => {
  const token = getTestAuthToken(role);
  return request.set('Authorization', `Bearer ${token}`);
};
