// lib/invoiceGenerator.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Generates a unique invoice number based on a prefix and a continuously incrementing sequence.
 * The sequence does not reset daily.
 * @param {string} prefix - The prefix for the invoice (e.g., "PUR", "SALE").
 * @returns {Promise<string>} The generated invoice number.
 */
export async function generateInvoiceNumber(prefix) {
  const today = new Date();

  // Format date as DDMMYYYY
  // Get day, month, and year components
  const day = String(today.getDate()).padStart(2, '0'); // Ensures two digits (e.g., 01, 15)
  const month = String(today.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed, so add 1 and pad
  const year = today.getFullYear();

  // Combine into DDMMYYYY format
  const formattedDate = `${day}${month}${year}`;

  let counter;
  await prisma.$transaction(async (tx) => {
    // Use upsert to find the counter for the given prefix or create it if it doesn't exist.
    // If found, increment lastNumber. If created, set lastNumber to 1.
    counter = await tx.invoiceCounter.upsert({
      where: { prefix }, // Look for a counter with this prefix
      update: {
        // If the record exists, increment the lastNumber
        lastNumber: {
          increment: 1,
        },
      },
      create: {
        // If the record does not exist, create it with lastNumber starting at 1
        prefix,
        lastNumber: 1,
      },
    });
  });

  // Pad the sequence number with leading zeros to ensure it's always 4 digits (e.g., 1 becomes 0001)
  const sequenceNumber = String(counter.lastNumber).padStart(4, '0');

  // Construct the final invoice number
  return `${prefix}-${formattedDate}-${sequenceNumber}`;
}
