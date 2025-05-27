//hooks/useAccountsData.js
import { useState, useEffect } from 'react';

export const useAccountsData = () => {
  const [accounts, setAccounts] = useState([]);
  const [chartOfAccounts, setChartOfAccounts] = useState([]);
  const [accountBalances, setAccountBalances] = useState(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load accounts using direct API call
  const loadAccounts = async () => {
    const response = await fetch('/api/accounts');
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to load accounts');
    }

    if (data.success) {
      setAccounts(data.data || []);
    } else {
      throw new Error(data.message || 'Failed to load accounts');
    }
  };

  // Load chart of accounts using direct API call
  const loadChartOfAccounts = async () => {
    const response = await fetch('/api/accounts/chart');
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to load chart of accounts');
    }

    if (data.success) {
      setChartOfAccounts(data.data || []);
    } else {
      throw new Error(data.message || 'Failed to load chart of accounts');
    }
  };

  // Initial data loading
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        setError(null);
        await Promise.all([loadAccounts(), loadChartOfAccounts()]);
      } catch (error) {
        console.error('Error loading initial data:', error);
        setError('Failed to load account data');
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // Refresh functionality
  const refreshData = async () => {
    try {
      setLoading(true);
      setError(null);
      await Promise.all([loadAccounts(), loadChartOfAccounts()]);
    } catch (error) {
      console.error('Error refreshing data:', error);
      setError('Failed to refresh account data');
    } finally {
      setLoading(false);
    }
  };

  // Load account balance using direct API call
  const loadAccountBalance = async (accountId) => {
    if (accountBalances.has(accountId)) return;

    try {
      setAccountBalances(prev => new Map(prev.set(accountId, { loading: true })));

      const response = await fetch(`/api/accounts/${accountId}/balance`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to load balance');
      }

      if (data.success) {
        setAccountBalances(prev => new Map(prev.set(accountId, data.data)));
      } else {
        throw new Error(data.message || 'Failed to load balance');
      }
    } catch (error) {
      console.error('Error loading account balance:', error);
      setAccountBalances(prev => new Map(prev.set(accountId, {
        error: error.message || 'Failed to load'
      })));
    }
  };

  return {
    accounts,
    chartOfAccounts,
    accountBalances,
    loading,
    error,
    refreshData,
    loadAccountBalance
  };
};