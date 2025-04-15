const db = require('../config/db');
const bcrypt = require('bcrypt');

class User {
  static async create({ name, email, password, role = 'user' }) {
    try {
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const [result] = await db.execute(
        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
        [name, email, hashedPassword, role]
      );
      
      return { id: result.insertId, name, email, role };
    } catch (error) {
      throw new Error(`Error creating user: ${error.message}`);
    }
  }

  static async findByEmail(email) {
    try {
      const [users] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
      return users[0] || null;
    } catch (error) {
      throw new Error(`Error finding user by email: ${error.message}`);
    }
  }

  static async findById(id) {
    try {
      const [users] = await db.execute(
        'SELECT id, name, email, role, created_at FROM users WHERE id = ?',
        [id]
      );
      return users[0] || null;
    } catch (error) {
      throw new Error(`Error finding user by ID: ${error.message}`);
    }
  }

  static async updatePassword(userId, newPassword) {
    try {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await db.execute(
        'UPDATE users SET password = ? WHERE id = ?',
        [hashedPassword, userId]
      );
      return true;
    } catch (error) {
      throw new Error(`Error updating password: ${error.message}`);
    }
  }

  static async comparePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  static async getAll(limit = 10, offset = 0) {
    try {
      const [users] = await db.execute(
        'SELECT id, name, email, role, created_at FROM users LIMIT ? OFFSET ?',
        [parseInt(limit), parseInt(offset)]
      );
      return users;
    } catch (error) {
      throw new Error(`Error getting users: ${error.message}`);
    }
  }
}

module.exports = User;
