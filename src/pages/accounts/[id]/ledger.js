// pages/accounts/[id]/ledger.jsx

import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";

// Helper function to determine Dr/Cr suffix
const getBalanceSuffix = (balance, accountType) => {
  const isDebitBalance = balance >= 0;

  switch (accountType) {
    case "ASSET":
    case "EXPENSE":
      return isDebitBalance ? " Dr" : " Cr";
    case "LIABILITY":
    case "INCOME":
    case "EQUITY":
      return isDebitBalance ? " Cr" : " Dr";
    default:
      return ""; // Or handle unknown types as needed
  }
};

// Component for empty state
function EmptyLedgerState({ accountName }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-6">
      <div className="text-center py-12">
        <svg
          className="mx-auto h-12 w-12 text-slate-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-slate-900">
          No transactions found
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          There are no entries recorded for {accountName}.
        </p>
        <div className="inline-flex items-center  mt-6">
          <div className="mx-2">
            <Link
              href="/transactions/payments"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors duration-150"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Record New Payment
            </Link>
          </div>
          <div className="mx-2">
            <Link
              href="/transactions/receipts"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors duration-150"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Record New Receipt
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AccountLedgerPage({ initialData, error }) {
  const router = useRouter();
  const { id } = router.query;
  const [ledgerData, setLedgerData] = useState(initialData);
  const [loading, setLoading] = useState(!initialData && !error);
  const [fetchError, setFetchError] = useState(error);

  useEffect(() => {
    if (!initialData && !error && id) {
      const fetchLedger = async () => {
        setLoading(true);
        try {
          const res = await fetch(
            `http://localhost:3000/api/accounts/${id}/ledger`
          );
          const data = await res.json();
          if (!res.ok) {
            throw new Error(data.message || "Failed to fetch ledger data");
          }
          setLedgerData(data);
          setFetchError(null);
        } catch (err) {
          setFetchError(err.message);
          setLedgerData(null);
        } finally {
          setLoading(false);
        }
      };
      fetchLedger();
    }
  }, [id, initialData, error]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-600 text-lg">Loading ledger...</p>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-2xl shadow-md max-w-md w-full text-center border border-red-200">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Error Loading Ledger
          </h1>
          <p className="text-slate-700 mb-4">{fetchError}</p>
          <Link
            href="/accounts"
            className="text-blue-600 hover:underline font-medium"
          >
            Go back to Accounts
          </Link>
        </div>
      </div>
    );
  }

  if (!ledgerData) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-2xl shadow-md max-w-md w-full text-center border border-slate-200">
          <h1 className="text-2xl font-bold text-slate-800 mb-4">
            Ledger Not Found
          </h1>
          <p className="text-slate-700 mb-4">
            The ledger for account ID "{id}" could not be found.
          </p>
          <Link
            href="/accounts"
            className="text-blue-600 hover:underline font-medium"
          >
            Go back to Accounts
          </Link>
        </div>
      </div>
    );
  }

  const {
    accountName,
    accountType,
    openingBalance,
    ledgerEntries,
    accountCode,
  } = ledgerData;

  // Calculate the closing balance
  const closingBalance =
    ledgerEntries.length > 0
      ? ledgerEntries[ledgerEntries.length - 1].runningBalance
      : openingBalance;

  const handleExportPdf = () => {
    // TODO: Implement PDF export functionality here
    alert("Export to PDF functionality will be implemented here!");
  };

  const handleExportExcel = () => {
    // TODO: Implement Excel export functionality here
    alert("Export to Excel functionality will be implemented here!");
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <Head>
        <title>{accountName} Ledger - Accounts</title>
        <meta name="description" content={`Ledger view for ${accountName}`} />
      </Head>

      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">
                Ledger for {accountName}
              </h1>
              <p className="text-slate-600">
                Detailed transaction history for this account
              </p>
            </div>
            <Link
              href="/accounts"
              className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-xl hover:from-blue-500 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 17l-5-5m0 0l5-5m-5 5h12"
                />
              </svg>
              Back to Accounts
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-5 bg-white rounded-2xl shadow-sm border border-slate-200">
            <p className="text-sm font-medium text-slate-600">Account Code</p>
            <p className="text-xl font-semibold text-slate-800 mt-1">
              #{accountCode || id}
            </p>
          </div>
          <div className="p-5 bg-white rounded-2xl shadow-sm border border-slate-200">
            <p className="text-sm font-medium text-slate-600">Account Type</p>
            <p className="text-xl font-semibold text-slate-800 mt-1">
              {accountType}
            </p>
          </div>
          <div className="p-5 bg-white rounded-2xl shadow-sm border border-slate-200">
            <p className="text-sm font-medium text-slate-600">
              Opening Balance
            </p>
            <p className="text-xl font-semibold text-slate-800 mt-1">
              ₹{openingBalance?.toFixed(2)}{" "}
              <span className="text-slate-500 text-base">
                {getBalanceSuffix(openingBalance, accountType)}
              </span>
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3 mb-6">
          <button
            onClick={handleExportPdf}
            className="inline-flex items-center px-4 py-2 bg-slate-200 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-300 transition-colors duration-150"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Export as PDF
          </button>
          <button
            onClick={handleExportExcel}
            className="inline-flex items-center px-4 py-2 bg-slate-200 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-300 transition-colors duration-150"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            Export as Excel
          </button>
        </div>

        {ledgerEntries.length === 0 ? (
          <EmptyLedgerState accountName={accountName} />
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-6">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-gradient-to-r from-slate-50 to-slate-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Transaction ID
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Debit (₹)
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Credit (₹)
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Balance (₹)
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {/* Opening Balance Row */}
                  <tr className="bg-slate-50 font-bold">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700">
                      Opening Balance
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-slate-900">
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-slate-900">
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-slate-900 font-semibold">
                      {Math.abs(openingBalance).toFixed(2)}{" "}
                      <span className="text-slate-500 text-xs">
                        {getBalanceSuffix(openingBalance, accountType)}
                      </span>
                    </td>
                  </tr>
                  {/* Ledger Entries */}
                  {ledgerEntries.map((entry, index) => (
                    <tr
                      key={entry.id}
                      className={`hover:bg-slate-50 transition-colors duration-150 ${
                        index % 2 === 0 ? "bg-white" : "bg-slate-25"
                      }`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                        {new Date(entry.date).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                          #{entry.transactionId}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700 max-w-sm truncate">
                        {entry.description || (
                          <span className="italic text-slate-400">
                            No description
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {entry.transactionType}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-slate-900 font-medium">
                        {entry.debitAmount > 0
                          ? entry.debitAmount.toFixed(2)
                          : "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-slate-900 font-medium">
                        {entry.creditAmount > 0
                          ? entry.creditAmount.toFixed(2)
                          : "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-slate-900 font-semibold">
                        {Math.abs(entry.runningBalance).toFixed(2)}{" "}
                        <span className="text-slate-500 text-xs">
                          {getBalanceSuffix(entry.runningBalance, accountType)}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {/* Closing Balance Row */}
                  <tr className="bg-blue-50 font-bold text-blue-800">
                    <td className="px-6 py-4 whitespace-nowrap text-sm"></td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm"></td>
                    <td className="px-6 py-4 text-sm">Closing Balance</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm"></td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm"></td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm"></td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      {Math.abs(closingBalance).toFixed(2)}{" "}
                      <span className="text-blue-600 text-xs">
                        {getBalanceSuffix(closingBalance, accountType)}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export async function getServerSideProps(context) {
  const { id } = context.params;

  try {
    const res = await fetch(`http://localhost:3000/api/accounts/${id}/ledger`);
    const data = await res.json();

    if (!res.ok) {
      return {
        props: {
          initialData: null,
          error:
            data.message || `Failed to fetch ledger data for account ID: ${id}`,
        },
      };
    }

    return {
      props: {
        initialData: data,
        error: null,
      },
    };
  } catch (err) {
    console.error("Error fetching ledger in getServerSideProps:", err);
    return {
      props: {
        initialData: null,
        error: `Failed to load ledger: ${err.message}. Please try again.`,
      },
    };
  }
}
