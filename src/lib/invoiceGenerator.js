// lib/invoiceGenerator.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Generates a unique invoice number based on a prefix and a daily sequence.
 * The sequence resets daily.
 * @param {string} prefix - The prefix for the invoice (e.g., "PUR", "SALE").
 * @returns {Promise<string>} The generated invoice number.
 */
export async function generateInvoiceNumber(prefix) {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalize to the beginning of the day

  const formattedDate = today.toISOString().split('T')[0].replace(/-/g, ''); // YYYYMMDD

  let counter;
  await prisma.$transaction(async (tx) => {
    // Find or create the counter for the given prefix
    counter = await tx.invoiceCounter.upsert({
      where: { prefix },
      update: {},
      create: { prefix },
    });

    // Check if the lastDate is not today, if so, reset the counter
    const lastCounterDate = new Date(counter.lastDate);
    lastCounterDate.setHours(0, 0, 0, 0);

    if (lastCounterDate.getTime() !== today.getTime()) {
      counter = await tx.invoiceCounter.update({
        where: { prefix },
        data: {
          lastNumber: 1,
          lastDate: today,
        },
      });
    } else {
      // Increment the counter for today
      counter = await tx.invoiceCounter.update({
        where: { prefix },
        data: {
          lastNumber: {
            increment: 1,
          },
        },
      });
    }
  });

  const sequenceNumber = String(counter.lastNumber).padStart(4, '0'); // Pad with leading zeros (e.g., 0001)

  return `${prefix}-${formattedDate}-${sequenceNumber}`;
}