//components/accounts/AccountTreeNode.js
import Link from 'next/link';
import { getAccountTypeDisplay, getAccountTypeColor } from '../../utils/accountUtils';
import BalanceDisplay from './BalanceDisplay';

const AccountTreeNode = ({ 
  account, 
  level = 0, 
  expandedAccounts, 
  toggleAccountExpansion, 
  accountBalances, 
  loadAccountBalance 
}) => {
  if (!account) return null;
  
  const hasChildren = account.children && account.children.length > 0;
  const isExpanded = expandedAccounts.has(account.id);
  const balanceInfo = accountBalances.