// // components/transactions/useReceiptFormLogic.js
 
// import { useState, useEffect, useCallback } from "react";

// export const useReceiptFormLogic = (
//   initialCustomerId, // Changed from initialSupplierId
//   initialSaleId, // Changed from initialPurchaseId
//   setGlobalError
// ) => {
//   const [creditAccounts, setCreditAccounts] = useState([]); // Changed from debitAccounts
//   const [sales, setSales] = useState([]); // Changed from purchases
//   const [formData, setFormData] = useState({
//     saleId: initialSaleId ? parseInt(initialSaleId) : null, // Changed from purchaseId
//     paymentMethod: "CASH",
//     amount: "",
//     reference: "",
//     notes: "",
//     date: new Date().toISOString().split("T")[0],
//     creditAccountId: "", // Changed from debitAccountId
//   });
//   const [selectedCreditAccountDetails, setSelectedCreditAccountDetails] =
//     useState(null); // Changed from selectedDebitAccountDetails
//   const [selectedSaleBalance, setSelectedSaleBalance] = useState(0); // Changed from selectedPurchaseBalance
//   const [accountsLoading, setAccountsLoading] = useState(true);
//   const [salesLoading, setSalesLoading] = useState(false); // Changed from purchasesLoading

//   // Helper to find customer linked to an account
//   const getCustomerIdFromAccount = useCallback(
//     (accountId) => {
//       const account = creditAccounts.find((acc) => acc.id === accountId);
//       return account?.customer?.id || null; // Changed from supplier
//     },
//     [creditAccounts]
//   );

//   // Shared function to fetch and set the selected credit account's balance
//   const fetchAndSetCreditAccountBalance = useCallback(
//     async (accountId) => {
//       if (!accountId) {
//         setSelectedCreditAccountDetails(null);
//         return;
//       }
//       try {
//         const response = await fetch(
//           `/api/accounts/${accountId}/balance?context=receipt` // Changed context
//         );
//         if (!response.ok) {
//           const errorData = await response.json();
//           throw new Error(
//             errorData.message || "Failed to fetch account balance"
//           );
//         }
//         const data = await response.json();
//         setSelectedCreditAccountDetails(data); // Store the full data object
//       } catch (error) {
//         console.error("Error fetching credit account balance:", error);
//         setSelectedCreditAccountDetails(null);
//         setGlobalError(`Error fetching account balance: ${error.message}`);
//       }
//     },
//     [setGlobalError]
//   );

//   // Fetch initial data: Credit Accounts (e.g., Accounts Receivable, Revenue Accounts)
//   useEffect(() => {
//     async function fetchInitialAccounts() {
//       setAccountsLoading(true);
//       try {
//         const accountsResponse = await fetch(
//           "/api/accounts?canBeCreditedForReceipts=true&limit=500" // Changed filter param
//         );
//         if (!accountsResponse.ok) {
//           const errorData = await accountsResponse.json();
//           throw new Error(errorData.message || "Failed to fetch accounts");
//         }
//         const accountsData = await accountsResponse.json();
//         setCreditAccounts(accountsData.data || []); // Changed from setDebitAccounts

//         if (
//           initialCustomerId &&
//           accountsData.data &&
//           accountsData.data.length > 0
//         ) {
//           const customerAccount = accountsData.data.find(
//             (acc) => acc.customer?.id === parseInt(initialCustomerId) // Changed from supplier
//           );
//           if (customerAccount) {
//             setFormData((prev) => ({
//               ...prev,
//               creditAccountId: customerAccount.id, // Changed from debitAccountId
//             }));
//             fetchAndSetCreditAccountBalance(customerAccount.id);
//           }
//         }
//       } catch (error) {
//         console.error("Error fetching initial accounts:", error);
//         setGlobalError(`Error fetching accounts: ${error.message}`);
//       } finally {
//         setAccountsLoading(false);
//       }
//     }

//     fetchInitialAccounts();
//   }, [initialCustomerId, fetchAndSetCreditAccountBalance, setGlobalError]);

//   // Fetch sales when the selected credit account (and thus customer) changes
//   useEffect(() => {
//     async function fetchSales() {
//       const currentCustomerId = getCustomerIdFromAccount(
//         formData.creditAccountId // Changed from debitAccountId
//       );

//       if (currentCustomerId) {
//         setSalesLoading(true); // Changed from purchasesLoading
//         try {
//           const response = await fetch(
//             `/api/sales?customerId=${currentCustomerId}&unpaidOnly=true` // Changed endpoint and param
//           );
//           if (!response.ok) {
//             const errorData = await response.json();
//             throw new Error(errorData.message || "Failed to fetch sales"); // Changed from purchases
//           }
//           const data = await response.json();

//           setSales(data.data || []); // Changed from setPurchases

//           if (initialSaleId && data.data && data.data.length > 0) {
//             const sale = data.data.find(
//               (s) => s.id === parseInt(initialSaleId) // Changed from p
//             );
//             if (sale) {
//               setSelectedSaleBalance(
//                 sale.totalAmount - sale.paidAmount
//               ); // Changed from purchase
//               setFormData((prev) => ({ ...prev, saleId: sale.id })); // Changed from purchaseId
//             }
//           }
//         } catch (error) {
//           console.error("Error fetching sales:", error); // Changed from purchases
//           setGlobalError(`Error fetching sales: ${error.message}`); // Changed from purchases
//         } finally {
//           setSalesLoading(false); // Changed from purchasesLoading
//         }
//       } else {
//         setSales([]); // Changed from purchases
//         setSelectedSaleBalance(0); // Changed from selectedPurchaseBalance
//         setFormData((prev) => ({ ...prev, saleId: null })); // Changed from purchaseId
//       }
//     }

//     fetchSales();
//   }, [
//     formData.creditAccountId, // Changed from debitAccountId
//     initialSaleId, // Changed from initialPurchaseId
//     getCustomerIdFromAccount, // Changed from getSupplierIdFromAccount
//     setGlobalError,
//   ]);

//   // Handle credit account selection
//   const handleCreditAccountChange = async (e) => { // Changed from handleDebitAccountChange
//     const selectedAccountId = e.target.value ? parseInt(e.target.value) : "";

//     setFormData((prev) => ({
//       ...prev,
//       creditAccountId: selectedAccountId, // Changed from debitAccountId
//       saleId: null, // Reset sale when credit account changes (changed from purchaseId)
//     }));
//     setSelectedSaleBalance(0); // Reset sale balance (changed from purchase balance)

//     fetchAndSetCreditAccountBalance(selectedAccountId);
//   };

//   // Handle sale selection
//   const handleSaleChange = (e) => { // Changed from handlePurchaseChange
//     const selectedId = e.target.value ? parseInt(e.target.value) : null;
//     setFormData((prev) => ({ ...prev, saleId: selectedId })); // Changed from purchaseId

//     if (selectedId) {
//       const sale = sales.find((s) => s.id === selectedId); // Changed from purchase and p
//       setSelectedSaleBalance(
//         sale ? sale.totalAmount - sale.paidAmount : 0
//       ); // Changed from purchase
//     } else {
//       setSelectedSaleBalance(0);
//     }
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   return {
//     formData,
//     setFormData,
//     creditAccounts, // Changed from debitAccounts
//     sales, // Changed from purchases
//     selectedCreditAccountDetails, // Changed from selectedDebitAccountDetails
//     selectedSaleBalance, // Changed from selectedPurchaseBalance
//     accountsLoading,
//     salesLoading, // Changed from purchasesLoading
//     getCustomerIdFromAccount, // Changed from getSupplierIdFromAccount
//     handleCreditAccountChange, // Changed from handleDebitAccountChange
//     handleSaleChange, // Changed from handlePurchaseChange
//     handleChange,
//   };
// };


// components/transactions/useReceiptFormLogic.js
 
import { useState, useEffect, useCallback } from "react";

export const useReceiptFormLogic = (
  initialCustomerId,
  initialSaleId,
  setGlobalError
) => {
  const [creditAccounts, setCreditAccounts] = useState([]);
  const [sales, setSales] = useState([]);
  const [formData, setFormData] = useState({
    saleId: initialSaleId ? parseInt(initialSaleId) : null,
    paymentMethod: "CASH",
    amount: "",
    reference: "",
    notes: "",
    date: new Date().toISOString().split("T")[0],
    creditAccountId: "",
  });
  const [selectedCreditAccountDetails, setSelectedCreditAccountDetails] =
    useState(null); // Stores full balance API response
  const [selectedSaleBalance, setSelectedSaleBalance] = useState(0);
  const [accountsLoading, setAccountsLoading] = useState(true);
  const [salesLoading, setSalesLoading] = useState(false);

  // Helper to find customer linked to an account
  const getCustomerIdFromAccount = useCallback(
    (accountId) => {
      const account = creditAccounts.find((acc) => acc.id === accountId);
      return account?.customer?.id || null;
    },
    [creditAccounts]
  );

  // Shared function to fetch and set the selected credit account's balance
  const fetchAndSetCreditAccountBalance = useCallback(
    async (accountId) => {
      if (!accountId) {
        setSelectedCreditAccountDetails(null);
        return;
      }
      try {
        const response = await fetch(
          `/api/accounts/${accountId}/balance?context=receipt`
        );
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.message || "Failed to fetch account balance"
          );
        }
        const data = await response.json();
        setSelectedCreditAccountDetails(data); // Store the full data object
      } catch (error) {
        console.error("Error fetching credit account balance:", error);
        setSelectedCreditAccountDetails(null);
        setGlobalError(`Error fetching account balance: ${error.message}`);
      }
    },
    [setGlobalError]
  );

  // Fetch initial data: Credit Accounts (accounts that can be credited for receipts)
  useEffect(() => {
    async function fetchInitialAccounts() {
      setAccountsLoading(true);
      try {
        const accountsResponse = await fetch(
          "/api/accounts?canBeCreditedForReceipts=true&limit=500"
        );
        if (!accountsResponse.ok) {
          const errorData = await accountsResponse.json();
          throw new Error(errorData.message || "Failed to fetch accounts");
        }
        const accountsData = await accountsResponse.json();
        setCreditAccounts(accountsData.data || []);

        if (
          initialCustomerId &&
          accountsData.data &&
          accountsData.data.length > 0
        ) {
          const customerAccount = accountsData.data.find(
            (acc) => acc.customer?.id === parseInt(initialCustomerId)
          );
          if (customerAccount) {
            setFormData((prev) => ({
              ...prev,
              creditAccountId: customerAccount.id,
            }));
            fetchAndSetCreditAccountBalance(customerAccount.id);
          }
        }
      } catch (error) {
        console.error("Error fetching initial accounts:", error);
        setGlobalError(`Error fetching accounts: ${error.message}`);
      } finally {
        setAccountsLoading(false);
      }
    }

    fetchInitialAccounts();
  }, [initialCustomerId, fetchAndSetCreditAccountBalance, setGlobalError]);

  // Fetch sales when the selected credit account (and thus customer) changes
  useEffect(() => {
    async function fetchSales() {
      const currentCustomerId = getCustomerIdFromAccount(
        formData.creditAccountId
      );

      if (currentCustomerId) {
        setSalesLoading(true);
        try {
          const response = await fetch(
            `/api/sales?customerId=${currentCustomerId}&unpaidOnly=true`
          );
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Failed to fetch sales");
          }
          const data = await response.json();

          // Use data.data instead of data
          setSales(data.data || []);

          if (initialSaleId && data.data && data.data.length > 0) {
            const sale = data.data.find(
              (s) => s.id === parseInt(initialSaleId)
            );
            if (sale) {
              setSelectedSaleBalance(
                sale.totalAmount - sale.paidAmount
              );
              setFormData((prev) => ({ ...prev, saleId: sale.id }));
            }
          }
        } catch (error) {
          console.error("Error fetching sales:", error);
          setGlobalError(`Error fetching sales: ${error.message}`);
        } finally {
          setSalesLoading(false);
        }
      } else {
        setSales([]);
        setSelectedSaleBalance(0);
        setFormData((prev) => ({ ...prev, saleId: null }));
      }
    }

    fetchSales();
  }, [
    formData.creditAccountId,
    initialSaleId,
    getCustomerIdFromAccount,
    setGlobalError,
  ]);

  // Handle credit account selection
  const handleCreditAccountChange = async (e) => {
    const selectedAccountId = e.target.value ? parseInt(e.target.value) : "";

    setFormData((prev) => ({
      ...prev,
      creditAccountId: selectedAccountId,
      saleId: null, // Reset sale when credit account changes
    }));
    setSelectedSaleBalance(0); // Reset sale balance

    fetchAndSetCreditAccountBalance(selectedAccountId);
  };

  // Handle sale selection
  const handleSaleChange = (e) => {
    const selectedId = e.target.value ? parseInt(e.target.value) : null;
    setFormData((prev) => ({ ...prev, saleId: selectedId }));

    if (selectedId) {
      const sale = sales.find((s) => s.id === selectedId);
      setSelectedSaleBalance(
        sale ? sale.totalAmount - sale.paidAmount : 0
      );
    } else {
      setSelectedSaleBalance(0);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return {
    formData,
    setFormData,
    creditAccounts,
    sales,
    selectedCreditAccountDetails,
    selectedSaleBalance,
    accountsLoading,
    salesLoading,
    getCustomerIdFromAccount,
    handleCreditAccountChange,
    handleSaleChange,
    handleChange,
  };
};