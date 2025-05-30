// lib/payments.js

export const paymentMethods = [
  { value: "CASH", label: "Cash", icon: "💵", requiresReference: false },
  {
    value: "BANK_TRANSFER",
    label: "Bank Transfer",
    icon: "🏦",
    requiresReference: false,
  },
  { value: "CHEQUE", label: "Cheque", icon: "📄", requiresReference: false },
  { value: "UPI", label: "UPI", icon: "📱", requiresReference: false },
  { value: "CARD", label: "Card", icon: "💳", requiresReference: false },
];

export function getReferencePlaceholder(method) {
  switch (method) {
    case "CHEQUE":
      return "Cheque number"; 
    case "UPI":
      return "Transaction ID";
    case "BANK_TRANSFER":
      return "Reference number";
    case "CARD":
      return "Last 4 digits";
    default:
      return "Reference";
  }
}

export function isReferenceRequired(currentPaymentMethod) {
  const method = paymentMethods.find(
    (m) => m.value === currentPaymentMethod
  );
  return method?.requiresReference || false;
}