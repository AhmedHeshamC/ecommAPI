const Product = require('../../../src/models/product.model');

describe('Product Model', () => {
  it('should create a product', async () => {
    const product = await Product.create({
      name: 'Unit Test Product',
      description: 'desc',
      price: 10,
      inventory: 5,
      category: 'unit'
    });
    expect(product).toHaveProperty('id');
    expect(product.name).toBe('Unit Test Product');
  });

  // ...add more unit tests for findById, update, delete, etc.
});
