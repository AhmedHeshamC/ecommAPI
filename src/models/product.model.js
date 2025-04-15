const db = require('../config/db');

class Product {
  static async create({ name, description, price, inventory, category, images = [] }) {
    try {
      // Insert product
      const [result] = await db.execute(
        'INSERT INTO products (name, description, price, inventory, category) VALUES (?, ?, ?, ?, ?)',
        [name, description, price, inventory, category]
      );
      
      const productId = result.insertId;
      
      // Insert product images if any
      if (images.length > 0) {
        const imageValues = images.map(img => [productId, img]);
        await db.query(
          'INSERT INTO product_images (product_id, image_url) VALUES ?',
          [imageValues]
        );
      }
      
      return { id: productId, name, description, price, inventory, category };
    } catch (error) {
      throw new Error(`Error creating product: ${error.message}`);
    }
  }

  static async findById(id) {
    try {
      // Get product details
      const [products] = await db.execute(
        'SELECT * FROM products WHERE id = ?',
        [id]
      );
      
      if (!products.length) return null;
      
      // Get product images
      const [images] = await db.execute(
        'SELECT image_url FROM product_images WHERE product_id = ?',
        [id]
      );
      
      const imageUrls = images.map(img => img.image_url);
      
      return { ...products[0], images: imageUrls };
    } catch (error) {
      throw new Error(`Error finding product by ID: ${error.message}`);
    }
  }

  static async getAll(limit = 10, offset = 0, filters = {}) {
    try {
      let query = 'SELECT * FROM products';
      const queryParams = [];
      
      // Build WHERE clause based on filters
      if (Object.keys(filters).length > 0) {
        const filterClauses = [];
        
        if (filters.name) {
          filterClauses.push('name LIKE ?');
          queryParams.push(`%${filters.name}%`);
        }
        
        if (filters.category) {
          filterClauses.push('category = ?');
          queryParams.push(filters.category);
        }
        
        if (filters.minPrice) {
          filterClauses.push('price >= ?');
          queryParams.push(parseFloat(filters.minPrice));
        }
        
        if (filters.maxPrice) {
          filterClauses.push('price <= ?');
          queryParams.push(parseFloat(filters.maxPrice));
        }
        
        if (filterClauses.length > 0) {
          query += ' WHERE ' + filterClauses.join(' AND ');
        }
      }
      
      // Add pagination
      query += ' LIMIT ? OFFSET ?';
      queryParams.push(parseInt(limit), parseInt(offset));
      
      // Execute query
      const [products] = await db.execute(query, queryParams);
      
      // Get images for products
      if (products.length > 0) {
        const productIds = products.map(p => p.id);
        const [allImages] = await db.query(
          'SELECT product_id, image_url FROM product_images WHERE product_id IN (?)',
          [productIds]
        );
        
        // Map images to their products
        const imageMap = {};
        allImages.forEach(img => {
          if (!imageMap[img.product_id]) {
            imageMap[img.product_id] = [];
          }
          imageMap[img.product_id].push(img.image_url);
        });
        
        // Add image arrays to products
        products.forEach(product => {
          product.images = imageMap[product.id] || [];
        });
      }
      
      return products;
    } catch (error) {
      throw new Error(`Error getting products: ${error.message}`);
    }
  }

  static async update(id, productData) {
    try {
      // Update main product details
      const updateFields = Object.keys(productData)
        .filter(key => key !== 'images')
        .map(key => `${key} = ?`);
      
      if (updateFields.length > 0) {
        const updateValues = Object.entries(productData)
          .filter(([key]) => key !== 'images')
          .map(([_, value]) => value);
          
        await db.execute(
          `UPDATE products SET ${updateFields.join(', ')} WHERE id = ?`,
          [...updateValues, id]
        );
      }
      
      // Update product images if provided
      if (productData.images && Array.isArray(productData.images)) {
        // Remove existing images
        await db.execute('DELETE FROM product_images WHERE product_id = ?', [id]);
        
        // Insert new images
        if (productData.images.length > 0) {
          const imageValues = productData.images.map(img => [id, img]);
          await db.query(
            'INSERT INTO product_images (product_id, image_url) VALUES ?',
            [imageValues]
          );
        }
      }
      
      return await this.findById(id);
    } catch (error) {
      throw new Error(`Error updating product: ${error.message}`);
    }
  }

  static async delete(id) {
    try {
      // Delete product images first
      await db.execute('DELETE FROM product_images WHERE product_id = ?', [id]);
      // Delete product
      const [result] = await db.execute('DELETE FROM products WHERE id = ?', [id]);
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Error deleting product: ${error.message}`);
    }
  }

  static async updateInventory(id, quantity) {
    try {
      await db.execute(
        'UPDATE products SET inventory = inventory - ? WHERE id = ? AND inventory >= ?',
        [quantity, id, quantity]
      );
      
      // Check if update was successful
      const [result] = await db.execute(
        'SELECT id FROM products WHERE id = ? AND inventory >= 0',
        [id]
      );
      
      return result.length > 0;
    } catch (error) {
      throw new Error(`Error updating inventory: ${error.message}`);
    }
  }
}

module.exports = Product;
