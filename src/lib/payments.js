// lib/payments.js

export const paymentMethods = [
  { value: "CASH", label: "Cash", icon: "💵", requiresReference: false },
  {
    value: "BANK_TRANSFER",
    label: "Bank Transfer",
    icon: "🏦",
    requiresReference: true,
  },
  { value: "CHEQUE", label: "Cheque", icon: "📄", requiresReference: true },
  { value: "UPI", label: "UPI", icon: "📱", requiresReference: true },
  { value: "CARD", label: "Card", icon: "💳", requiresReference: true },
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