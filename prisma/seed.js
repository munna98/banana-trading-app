// Seed script for fundamental accounts in banana trading app
// This can be used with Prisma's db seed functionality

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedAccounts() {
  console.log('🌱 Seeding fundamental accounts...');

  // Create all accounts in the correct order (parents first)
  const accounts = [
    // ASSET ACCOUNTS
    {
      code: '1000',
      name: 'Assets',
      type: 'ASSET',
      description: 'Main asset category',
      parentId: null,
      openingBalance: 0.0,
      canDebitOnPayment: false,
      canCreditOnReceipt: false,
      isSeeded: true 
    },
    {
      code: '1100',
      name: 'Current Assets',
      type: 'ASSET',
      description: 'Assets expected to be converted to cash within one year',
      parentCode: '1000',
      openingBalance: 0.0,
      canDebitOnPayment: false,
      canCreditOnReceipt: false,
      isSeeded: true 
    },
    {
      code: '1110',
      name: 'Cash',
      type: 'ASSET',
      description: 'Liquid money in cash and bank',
      parentCode: '1100',
      openingBalance: 0.0,
      canDebitOnPayment: false,
      canCreditOnReceipt: false,
      isSeeded: true 
    },
    {
      code: '1111',
      name: 'Cash Account',
      type: 'ASSET',
      description: 'Primary business cash account',
      parentCode: '1110',
      openingBalance: 0.0,
      canDebitOnPayment: false,
      canCreditOnReceipt: true,
      isSeeded: true 
    },
    {
      code: '1112',
      name: 'Bank',
      type: 'ASSET',
      description: 'Primary business bank account',
      parentCode: '1110',
      openingBalance: 0.0,
      canDebitOnPayment: false,
      canCreditOnReceipt: true,
      isSeeded: true 
    },
    {
      code: '1120',
      name: 'Accounts Receivable',
      type: 'ASSET',
      description: 'Money owed by customers',
      parentCode: '1100',
      openingBalance: 0.0,
      canDebitOnPayment: false,
      canCreditOnReceipt: true,
      isSeeded: true 
    },
    {
      code: '1121',
      name: 'Trade Receivables',
      type: 'ASSET',
      description: 'Outstanding customer invoices',
      parentCode: '1120',
      openingBalance: 0.0,
      canDebitOnPayment: false,
      canCreditOnReceipt: true,
      isSeeded: true 
    },
    {
      code: '1130',
      name: 'Inventory',
      type: 'ASSET',
      description: 'Trading inventory',
      parentCode: '1100',
      openingBalance: 0.0,
      canDebitOnPayment: true,
      canCreditOnReceipt: false,
      isSeeded: true 
    },
    {
      code: '1131',
      name: 'Banana Inventory',
      type: 'ASSET',
      description: 'Fresh banana stock for trading',
      parentCode: '1130',
      openingBalance: 0.0,
      canDebitOnPayment: true,
      canCreditOnReceipt: false,
      isSeeded: true 
    },
    {
      code: '1132',
      name: 'Packaging Materials',
      type: 'ASSET',
      description: 'Boxes, bags, and other packaging supplies',
      parentCode: '1130',
      openingBalance: 0.0,
      canDebitOnPayment: true,
      canCreditOnReceipt: false,
      isSeeded: true 
    },
    {
      code: '1140',
      name: 'Prepaid Expenses',
      type: 'ASSET',
      description: 'Expenses paid in advance',
      parentCode: '1100',
      openingBalance: 0.0,
      canDebitOnPayment: true,
      canCreditOnReceipt: false,
      isSeeded: true 
    },
    {
      code: '1200',
      name: 'Fixed Assets',
      type: 'ASSET',
      description: 'Long-term physical assets',
      parentCode: '1000',
      openingBalance: 0.0,
      canDebitOnPayment: false,
      canCreditOnReceipt: false,
      isSeeded: true 
    },
    {
      code: '1210',
      name: 'Equipment',
      type: 'ASSET',
      description: 'Business equipment and machinery',
      parentCode: '1200',
      openingBalance: 0.0,
      canDebitOnPayment: true,
      canCreditOnReceipt: false,
      isSeeded: true 
    },
    {
      code: '1220',
      name: 'Vehicles',
      type: 'ASSET',
      description: 'Delivery trucks and transportation',
      parentCode: '1200',
      openingBalance: 0.0,
      canDebitOnPayment: true,
      canCreditOnReceipt: false,
      isSeeded: true 
    },
    {
      code: '1230',
      name: 'Furniture & Fixtures',
      type: 'ASSET',
      description: 'Office and warehouse furniture',
      parentCode: '1200',
      openingBalance: 0.0,
      canDebitOnPayment: true,
      canCreditOnReceipt: false,
      isSeeded: true 
    },

    // LIABILITY ACCOUNTS
    {
      code: '2000',
      name: 'Liabilities',
      type: 'LIABILITY',
      description: 'Main liability category',
      parentId: null,
      openingBalance: 0.0,
      canDebitOnPayment: false,
      canCreditOnReceipt: false,
      isSeeded: true 
    },
    {
      code: '2100',
      name: 'Current Liabilities',
      type: 'LIABILITY',
      description: 'Debts due within one year',
      parentCode: '2000',
      openingBalance: 0.0,
      canDebitOnPayment: false,
      canCreditOnReceipt: false,
      isSeeded: true 
    },
    {
      code: '2110',
      name: 'Accounts Payable',
      type: 'LIABILITY',
      description: 'Money owed to suppliers',
      parentCode: '2100',
      openingBalance: 0.0,
      canDebitOnPayment: true,
      canCreditOnReceipt: false,
      isSeeded: true 
    },
    {
      code: '2111',
      name: 'Trade Payables',
      type: 'LIABILITY',
      description: 'Outstanding supplier invoices',
      parentCode: '2110',
      openingBalance: 0.0,
      canDebitOnPayment: true,
      canCreditOnReceipt: false,
      isSeeded: true 
    },
    {
      code: '2120',
      name: 'Accrued Expenses',
      type: 'LIABILITY',
      description: 'Expenses incurred but not yet paid',
      parentCode: '2100',
      openingBalance: 0.0,
      canDebitOnPayment: true,
      canCreditOnReceipt: false,
      isSeeded: true 
    },
    {
      code: '2130',
      name: 'Short-term Loans',
      type: 'LIABILITY',
      description: 'Loans due within one year',
      parentCode: '2100',
      openingBalance: 0.0,
      canDebitOnPayment: true,
      canCreditOnReceipt: false,
      isSeeded: true 
    },
    {
      code: '2200',
      name: 'Long-term Liabilities',
      type: 'LIABILITY',
      description: 'Debts due after one year',
      parentCode: '2000',
      openingBalance: 0.0,
      canDebitOnPayment: false,
      canCreditOnReceipt: false,
      isSeeded: true 
    },
    {
      code: '2210',
      name: 'Long-term Loans',
      type: 'LIABILITY',
      description: 'Loans with terms over one year',
      parentCode: '2200',
      openingBalance: 0.0,
      canDebitOnPayment: true,
      canCreditOnReceipt: false,
      isSeeded: true 
    },

    // EQUITY ACCOUNTS
    {
      code: '3000',
      name: 'Equity',
      type: 'EQUITY',
      description: 'Owner\'s equity and retained earnings',
      parentId: null,
      openingBalance: 0.0,
      canDebitOnPayment: false,
      canCreditOnReceipt: false,
      isSeeded: true 
    },
    {
      code: '3100',
      name: 'Owner\'s Capital',
      type: 'EQUITY',
      description: 'Initial and additional capital contributions',
      parentCode: '3000',
      openingBalance: 0.0,
      canDebitOnPayment: false,
      canCreditOnReceipt: false,
      isSeeded: true 
    },
    {
      code: '3200',
      name: 'Retained Earnings',
      type: 'EQUITY',
      description: 'Accumulated profits retained in business',
      parentCode: '3000',
      openingBalance: 0.0,
      canDebitOnPayment: false,
      canCreditOnReceipt: false,
      isSeeded: true 
    },
    {
      code: '3300',
      name: 'Owner\'s Drawings',
      type: 'EQUITY',
      description: 'Money withdrawn by owner',
      parentCode: '3000',
      openingBalance: 0.0,
      canDebitOnPayment: true,
      canCreditOnReceipt: false,
      isSeeded: true 
    },

    // INCOME ACCOUNTS
    {
      code: '4000',
      name: 'Income',
      type: 'INCOME',
      description: 'Main revenue category',
      parentId: null,
      openingBalance: 0.0,
      canDebitOnPayment: false,
      canCreditOnReceipt: false,
      isSeeded: true 
    },
    {
      code: '4100',
      name: 'Direct Income',
      type: 'INCOME',
      description: 'Income from banana sales',
      parentCode: '4000',
      openingBalance: 0.0,
      canDebitOnPayment: false,
      canCreditOnReceipt: false,
      isSeeded: true 
    },
    {
      code: '4110',
      name: 'Banana Sales - Retail',
      type: 'INCOME',
      description: 'Direct sales to consumers',
      parentCode: '4100',
      openingBalance: 0.0,
      canDebitOnPayment: false,
      canCreditOnReceipt: false,
      isSeeded: true 
    },
    {
      code: '4120',
      name: 'Banana Sales - Wholesale',
      type: 'INCOME',
      description: 'Bulk sales to retailers',
      parentCode: '4100',
      openingBalance: 0.0,
      canDebitOnPayment: false,
      canCreditOnReceipt: false,
      isSeeded: true 
    },
    {
      code: '4200',
      name: 'Other Income',
      type: 'INCOME',
      description: 'Non-trading income',
      parentCode: '4000',
      openingBalance: 0.0,
      canDebitOnPayment: false,
      canCreditOnReceipt: false,
      isSeeded: true 
    },
    {
      code: '4210',
      name: 'Interest Income',
      type: 'INCOME',
      description: 'Interest earned on bank deposits',
      parentCode: '4200',
      openingBalance: 0.0,
      canDebitOnPayment: false,
      canCreditOnReceipt: false,
      isSeeded: true 
    },

    // EXPENSE ACCOUNTS
    {
      code: '5000',
      name: 'Expenses',
      type: 'EXPENSE',
      description: 'Main expense category',
      parentId: null,
      openingBalance: 0.0,
      canDebitOnPayment: false,
      canCreditOnReceipt: false,
      isSeeded: true 
    },
    {
      code: '5100',
      name: 'Cost of Goods Sold',
      type: 'EXPENSE',
      description: 'Direct costs of banana purchases',
      parentCode: '5000',
      openingBalance: 0.0,
      canDebitOnPayment: false,
      canCreditOnReceipt: false,
      isSeeded: true 
    },
    {
      code: '5110',
      name: 'Banana Purchases',
      type: 'EXPENSE',
      description: 'Cost of bananas bought for resale',
      parentCode: '5100',
      openingBalance: 0.0,
      canDebitOnPayment: false,
      canCreditOnReceipt: false,
      isSeeded: true 
    },
    {
      code: '5120',
      name: 'Freight In',
      type: 'EXPENSE',
      description: 'Transportation costs for incoming goods',
      parentCode: '5100',
      openingBalance: 0.0,
      canDebitOnPayment: false,
      canCreditOnReceipt: false,
      isSeeded: true 
    },
    {
      code: '5200',
      name: 'Operating Expenses',
      type: 'EXPENSE',
      description: 'Regular business operating costs',
      parentCode: '5000',
      openingBalance: 0.0,
      canDebitOnPayment: false,
      canCreditOnReceipt: false,
      isSeeded: true 
    },
    {
      code: '5210',
      name: 'Rent Expense',
      type: 'EXPENSE',
      description: 'Warehouse and office rent',
      parentCode: '5200',
      openingBalance: 0.0,
      canDebitOnPayment: false,
      canCreditOnReceipt: false,
      isSeeded: true 
    },
    {
      code: '5220',
      name: 'Utilities Expense',
      type: 'EXPENSE',
      description: 'Electricity, water, gas bills',
      parentCode: '5200',
      openingBalance: 0.0,
      canDebitOnPayment: false,
      canCreditOnReceipt: false,
      isSeeded: true 
    },
    {
      code: '5230',
      name: 'Transportation Expense',
      type: 'EXPENSE',
      description: 'Delivery and vehicle costs',
      parentCode: '5200',
      openingBalance: 0.0,
      canDebitOnPayment: false,
      canCreditOnReceipt: false,
      isSeeded: true 
    },
    {
      code: '5240',
      name: 'Marketing & Advertising',
      type: 'EXPENSE',
      description: 'Promotional and marketing costs',
      parentCode: '5200',
      openingBalance: 0.0,
      canDebitOnPayment: false,
      canCreditOnReceipt: false,
      isSeeded: true 
    },
    {
      code: '5250',
      name: 'Insurance Expense',
      type: 'EXPENSE',
      description: 'Business insurance premiums',
      parentCode: '5200',
      openingBalance: 0.0,
      canDebitOnPayment: false,
      canCreditOnReceipt: false,
      isSeeded: true 
    },
    {
      code: '5260',
      name: 'Professional Services',
      type: 'EXPENSE',
      description: 'Legal, accounting, consulting fees',
      parentCode: '5200',
      openingBalance: 0.0,
      canDebitOnPayment: false,
      canCreditOnReceipt: false,
      isSeeded: true 
    },
    {
      code: '5270',
      name: 'Bank Charges',
      type: 'EXPENSE',
      description: 'Banking fees and charges',
      parentCode: '5200',
      openingBalance: 0.0,
      canDebitOnPayment: false,
      canCreditOnReceipt: false,
      isSeeded: true 
    },
    {
      code: '5280',
      name: 'Office Supplies',
      type: 'EXPENSE',
      description: 'Stationery and office materials',
      parentCode: '5200',
      openingBalance: 0.0,
      canDebitOnPayment: false,
      canCreditOnReceipt: false,
      isSeeded: true 
    },
    {
      code: '5290',
      name: 'Repairs & Maintenance',
      type: 'EXPENSE',
      description: 'Equipment and facility maintenance',
      parentCode: '5200',
      openingBalance: 0.0,
      canDebitOnPayment: false,
      canCreditOnReceipt: false,
      isSeeded: true 
    },
    {
      code: '5300',
      name: 'Employee Expenses',
      type: 'EXPENSE',
      description: 'Staff-related costs',
      parentCode: '5000',
      openingBalance: 0.0,
      canDebitOnPayment: false,
      canCreditOnReceipt: false,
      isSeeded: true 
    },
    {
      code: '5310',
      name: 'Salaries & Wages',
      type: 'EXPENSE',
      description: 'Employee compensation',
      parentCode: '5300',
      openingBalance: 0.0,
      canDebitOnPayment: false,
      canCreditOnReceipt: false,
      isSeeded: true 
    },
    {
      code: '5320',
      name: 'Employee Benefits',
      type: 'EXPENSE',
      description: 'Health insurance, retirement contributions',
      parentCode: '5300',
      openingBalance: 0.0,
      canDebitOnPayment: false,
      canCreditOnReceipt: false,
      isSeeded: true 
    }
  ];

  // First pass: Create all accounts without parent relationships
  const createdAccounts = new Map();

  for (const account of accounts) {
    const { parentCode, ...accountData } = account;
    const created = await prisma.account.create({
      data: accountData
    });
    createdAccounts.set(account.code, created);
    console.log(`✅ Created account: ${account.code} - ${account.name}`);
  }

  // Second pass: Update parent relationships
  for (const account of accounts) {
    if (account.parentCode) {
      const parentAccount = createdAccounts.get(account.parentCode);
      const childAccount = createdAccounts.get(account.code);

      if (parentAccount && childAccount) {
        await prisma.account.update({
          where: { id: childAccount.id },
          data: { parentId: parentAccount.id }
        });
        console.log(`🔗 Linked ${account.code} to parent ${account.parentCode}`);
      }
    }
  }

  console.log(`🎉 Successfully seeded ${accounts.length} accounts!`);
}

async function main() {
  try {
    await seedAccounts();
  } catch (error) {
    console.error('❌ Error seeding accounts:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

// Export for use in other scripts
module.exports = { seedAccounts };