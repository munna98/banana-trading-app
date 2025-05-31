// lib/payments.js

import {
  DollarSign,
  Banknote,
  FileText,
  Smartphone,
  CreditCard,
} from "lucide-react";

export const paymentMethods = [
  {
    value: "CASH",
    label: "Cash",
    icon: DollarSign,
    requiresReference: false,
  },
  {
    value: "BANK_TRANSFER",
    label: "Bank Transfer",
    icon: Banknote,
    requiresReference: true,
  },
  {
    value: "CHEQUE",
    label: "Cheque",
    icon: FileText,
    requiresReference: true,
  },
  {
    value: "UPI",
    label: "UPI",
    icon: Smartphone,
    requiresReference: true,
  },
  {
    value: "CARD",
    label: "Card",
    icon: CreditCard,
    requiresReference: true,
  },
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
  const method = paymentMethods.find((m) => m.value === currentPaymentMethod);
  return method?.requiresReference || false;
}
