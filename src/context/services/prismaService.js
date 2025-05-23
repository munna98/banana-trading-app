// context/services/prismaService.js
import { PrismaClient } from '@prisma/client';

// Initialize Prisma Client as singleton
let prisma;

export function getPrismaClient() {
  if (!prisma) {
    prisma = new PrismaClient();
  }
  return prisma;
}

// Generic error handler for database operations
export function handleDatabaseError(error, operation) {
  console.error(`Database error during ${operation}:`, error);
  throw new Error(`${operation} failed: ${error.message}`);
}

// Cleanup function for application shutdown
export async function closePrismaConnection() {
  if (prisma) {
    await prisma.$disconnect();
    prisma = null;
  }
}