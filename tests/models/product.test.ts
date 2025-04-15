import { productFixture } from '../fixtures/products';

describe('Product Model', () => {
  it('should match product fixture schema', () => {
    expect(productFixture).toHaveProperty('name');
    expect(productFixture).toHaveProperty('price');
    expect(productFixture).toHaveProperty('inventory');
  });
});
