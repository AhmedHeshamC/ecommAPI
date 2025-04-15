const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const logger = require('../utils/logger.util');

// Load environment variables from .env
dotenv.config();

async function seedDatabase() {
  let connection;
  try {
    logger.info('Starting database seed process...');

    // Create a direct database connection using env vars
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
      multipleStatements: true
    });

    logger.info(`Connected to database: ${process.env.DB_NAME}`);

    // Read SQL seed file
    const seedFilePath = path.join(__dirname, '../../database/seeds.sql');
    const seedSql = fs.readFileSync(seedFilePath, 'utf8');

    // Execute the entire SQL file
    await connection.query(seedSql);

    logger.info('Database seeded successfully!');
    logger.info('Added 10 products across 5 categories.');
    process.exit(0);
  } catch (error) {
    logger.error('Error seeding database:', error);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}

seedDatabase();
