import request from 'supertest';
import app from '../../src/server';
import jwt from 'jsonwebtoken';

// Mock the Product model used by the controller
jest.mock('../../src/models/product.model', () => {
  return {
    getAll: jest.fn().mockResolvedValue([
      { id: 1, name: 'Test Product', price: 19.99, inventory: 10 }
    ]),
    findById: jest.fn().mockImplementation((id) => {
      if (id === '1') {
        return Promise.resolve({ id: 1, name: 'Test Product', price: 19.99 });
      } 
      return Promise.resolve(null);
    }),
    create: jest.fn().mockResolvedValue({ 
      id: 2, 
      name: 'New Product', 
      price: 29.99 
    }),
    update: jest.fn().mockResolvedValue({ 
      id: 1, 
      name: 'Updated Product', 
      price: 39.99 
    }),
    delete: jest.fn().mockResolvedValue(true)
  };
});

// Mock JWT and User model for authentication
jest.mock('jsonwebtoken');
jest.mock('../../src/models/user.model', () => ({
  findById: jest.fn().mockResolvedValue({
    id: 1,
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'admin'
  })
}));

describe('Product Controller', () => {
  // Helper to generate auth token for tests
  const getAuthToken = (role = 'admin') => {
    // Mock JWT verify to return our test payload
    (jwt.verify as jest.Mock).mockImplementation(() => ({ 
      id: 1, 
      role 
    }));
    return 'fake-jwt-token';
  };

  describe('GET methods', () => {
    it('GET /api/v1/products should return products', async () => {
      const res = await request(app).get('/api/v1/products');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('data');
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('GET /api/v1/products/:id should return a single product', async () => {
      const res = await request(app).get('/api/v1/products/1');
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('id', 1);
    });

    it('GET /api/v1/products/:id should return 404 for non-existent product', async () => {
      const res = await request(app).get('/api/v1/products/999');
      expect(res.status).toBe(404);
    });
  });

  describe('POST methods', () => {
    it('POST /api/v1/products should create a new product when admin', async () => {
      const authToken = getAuthToken('admin');
      const newProduct = { 
        name: 'New Product', 
        description: 'Test desc', 
        price: 29.99, 
        inventory: 50,
        category: 'test' 
      };
      
      const res = await request(app)
        .post('/api/v1/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newProduct);
      
      expect(res.status).toBe(201);
      expect(res.body.data).toHaveProperty('id', 2);
      expect(res.body.data).toHaveProperty('name', 'New Product');
    });
    
    it('POST /api/v1/products should return 401 without auth token', async () => {
      const res = await request(app)
        .post('/api/v1/products')
        .send({ name: 'Test Product', price: 19.99 });
      
      expect(res.status).toBe(401);
    });
  });
});

