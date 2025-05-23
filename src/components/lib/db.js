// lib/db.js - Database client using Prisma
import { PrismaClient } from '@prisma/client';

// Global Prisma client instance
let prisma;

// Initialize Prisma client with proper configuration
if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient({
    log: ['error'],
  });
} else {
  if (!global.__prisma) {
    global.__prisma = new PrismaClient({
      log: ['query', 'info', 'warn', 'error'],
    });
  }
  prisma = global.__prisma;
}

// Database connection helper
export const connectDB = async () => {
  try {
    await prisma.$connect();
    console.log('Database connected successfully');
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
};

// Database disconnection helper
export const disconnectDB = async () => {
  try {
    await prisma.$disconnect();
    console.log('Database disconnected successfully');
  } catch (error) {
    console.error('Database disconnection failed:', error);
  }
};

// Transaction wrapper for complex operations
export const withTransaction = async (callback) => {
  try {
    const result = await prisma.$transaction(callback);
    return { success: true, data: result };
  } catch (error) {
    console.error('Transaction failed:', error);
    return { success: false, error: error.message };
  }
};

// Database health check
export const healthCheck = async () => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { status: 'healthy', timestamp: new Date() };
  } catch (error) {
    return { status: 'unhealthy', error: error.message, timestamp: new Date() };
  }
};

// Get database statistics
export const getDBStats = async () => {
  try {
    const [
      itemCount,
      supplierCount,
      customerCount,
      purchaseCount,
      saleCount,
      expenseCount
    ] = await Promise.all([
      prisma.item.count(),
      prisma.supplier.count(),
      prisma.customer.count(),
      prisma.purchase.count(),
      prisma.sale.count(),
      prisma.expense.count()
    ]);

    return {
      items: itemCount,
      suppliers: supplierCount,
      customers: customerCount,
      purchases: purchaseCount,
      sales: saleCount,
      expenses: expenseCount,
      total: itemCount + supplierCount + customerCount + purchaseCount + saleCount + expenseCount
    };
  } catch (error) {
    console.error('Failed to get database stats:', error);
    return null;
  }
};

// Backup database (SQLite specific)
export const backupDatabase = async (backupPath) => {
  try {
    // This would need to be implemented based on your backup strategy
    // For SQLite, you could copy the database file
    console.log(`Database backup initiated to: ${backupPath}`);
    return { success: true, path: backupPath };
  } catch (error) {
    console.error('Database backup failed:', error);
    return { success: false, error: error.message };
  }
};

// Clean up old records (optional maintenance function)
export const cleanupOldRecords = async (daysOld = 365) => {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    // Example: Clean up old expenses
    const deletedExpenses = await prisma.expense.deleteMany({
      where: {
        date: {
          lt: cutoffDate
        }
      }
    });

    console.log(`Cleaned up ${deletedExpenses.count} old records`);
    return { success: true, deletedCount: deletedExpenses.count };
  } catch (error) {
    console.error('Cleanup failed:', error);
    return { success: false, error: error.message };
  }
};

// Export the prisma client instance
export default prisma;