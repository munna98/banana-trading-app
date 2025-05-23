// lib/db.js - Database client for Banana Trading System
import { PrismaClient } from '@prisma/client';

// Global variable to store Prisma client instance
let prismaInstance;

// Function to get or create Prisma client instance
function getPrismaClient() {
  if (!prismaInstance) {
    prismaInstance = new PrismaClient({
      log: ['query', 'info', 'warn', 'error'],
      errorFormat: 'pretty',
    });
  }
  return prismaInstance;
}

// Database connection manager
class DatabaseManager {
  constructor() {
    this.client = getPrismaClient();
  }

  // Get Prisma client instance
  getClient() {
    return this.client;
  }

  // Test database connection
  async testConnection() {
    try {
      await this.client.$connect();
      console.log('Database connected successfully');
      return true;
    } catch (error) {
      console.error('Database connection failed:', error);
      return false;
    }
  }

  // Initialize database with sample data
  async initializeDatabase() {
    try {
      // Check if data already exists
      const itemCount = await this.client.item.count();
      
      if (itemCount === 0) {
        // Create default banana types
        await this.client.item.createMany({
          data: [
            { name: 'Cavendish Banana', description: 'Regular yellow bananas', unit: 'Bunch' },
            { name: 'Red Banana', description: 'Red variety bananas', unit: 'Bunch' },
            { name: 'Plantain', description: 'Cooking bananas', unit: 'Bunch' },
            { name: 'Baby Banana', description: 'Small sweet bananas', unit: 'Bunch' },
          ]
        });

        // Create sample supplier
        await this.client.supplier.create({
          data: {
            name: 'Sample Supplier',
            phone: '123-456-7890',
            address: 'Sample Address',
            balance: 0
          }
        });

        // Create sample customer
        await this.client.customer.create({
          data: {
            name: 'Sample Customer',
            phone: '098-765-4321',
            address: 'Customer Address',
            balance: 0
          }
        });

        console.log('Database initialized with sample data');
      }
    } catch (error) {
      console.error('Database initialization failed:', error);
    }
  }

  // Close database connection
  async disconnect() {
    try {
      await this.client.$disconnect();
      console.log('Database disconnected');
    } catch (error) {
      console.error('Error disconnecting from database:', error);
    }
  }

  // Transaction wrapper for safe operations
  async transaction(operations) {
    try {
      return await this.client.$transaction(operations);
    } catch (error) {
      console.error('Transaction failed:', error);
      throw error;
    }
  }

  // Execute raw SQL query (for complex operations)
  async executeRaw(query, params = []) {
    try {
      return await this.client.$executeRaw(query, ...params);
    } catch (error) {
      console.error('Raw query execution failed:', error);
      throw error;
    }
  }

  // Get raw query results
  async queryRaw(query, params = []) {
    try {
      return await this.client.$queryRaw(query, ...params);
    } catch (error) {
      console.error('Raw query failed:', error);
      throw error;
    }
  }

  // Database backup (export to JSON)
  async backup() {
    try {
      const data = {
        items: await this.client.item.findMany(),
        suppliers: await this.client.supplier.findMany(),
        customers: await this.client.customer.findMany(),
        purchases: await this.client.purchase.findMany({
          include: { items: true }
        }),
        sales: await this.client.sale.findMany({
          include: { items: true }
        }),
        payments: await this.client.payment.findMany(),
        receipts: await this.client.receipt.findMany(),
        expenses: await this.client.expense.findMany(),
      };
      
      return {
        timestamp: new Date().toISOString(),
        data
      };
    } catch (error) {
      console.error('Backup failed:', error);
      throw error;
    }
  }

  // Database health check
  async healthCheck() {
    try {
      const stats = {
        items: await this.client.item.count(),
        suppliers: await this.client.supplier.count(),
        customers: await this.client.customer.count(),
        purchases: await this.client.purchase.count(),
        sales: await this.client.sale.count(),
        payments: await this.client.payment.count(),
        receipts: await this.client.receipt.count(),
        expenses: await this.client.expense.count(),
      };
      
      return {
        status: 'healthy',
        stats,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}

// Create singleton instance
const dbManager = new DatabaseManager();

// Get the Prisma client instance
const prismaClient = dbManager.getClient();

// Export the Prisma client as the default export (most common usage)
export default prismaClient;

// Also export as named exports for flexibility
export const db = prismaClient;
export const prisma = prismaClient;
export { dbManager };

// Utility functions for common operations
export const dbUtils = {
  // Format date for database
  formatDate: (date) => {
    return date instanceof Date ? date : new Date(date);
  },

  // Safe number conversion
  safeNumber: (value, defaultValue = 0) => {
    const num = parseFloat(value);
    return isNaN(num) ? defaultValue : num;
  },

  // Generate unique reference number
  generateReference: (prefix = 'REF') => {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `${prefix}-${timestamp}-${random}`.toUpperCase();
  },

  // Pagination helper
  getPaginationParams: (page = 1, limit = 10) => {
    const skip = (page - 1) * limit;
    return { skip, take: limit };
  },

  // Search helper
  createSearchFilter: (searchTerm, fields) => {
    if (!searchTerm) return {};
    
    return {
      OR: fields.map(field => ({
        [field]: {
          contains: searchTerm,
          mode: 'insensitive'
        }
      }))
    };
  }
};

// Initialize database on import (in development)
if (process.env.NODE_ENV === 'development') {
  dbManager.testConnection()
    .then(() => {
      return dbManager.initializeDatabase();
    })
    .catch((error) => {
      console.log('Database tables may not exist yet. Run: npx prisma migrate dev --name init');
      console.error('Init error:', error.message);
    });
}