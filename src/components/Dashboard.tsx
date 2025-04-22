import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  IconButton,
  useTheme,
  CircularProgress,
} from '@mui/material';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SavingsIcon from '@mui/icons-material/Savings';
import styled from 'styled-components';

const GlowCard = styled(Card)`
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;

  &::before {
    content: '';
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    background: linear-gradient(45deg, #9c27b0, #2196f3);
    background-size: 400%;
    border-radius: 16px;
    z-index: -1;
    animation: glow 8s linear infinite;
    opacity: 0.5;
  }

  @keyframes glow {
    0% {
      background-position: 0 0;
    }
    50% {
      background-position: 400% 0;
    }
    100% {
      background-position: 0 0;
    }
  }

  &:hover {
    transform: translateY(-5px);
  }
`;

interface DashboardProps {
  darkMode: boolean;
  setDarkMode: (darkMode: boolean) => void;
}

interface Transaction {
  date: string;
  amount: number;
  name: string;
}

interface Balance {
  current: number;
  available: number;
  limit: number;
}

const Dashboard: React.FC<DashboardProps> = ({ darkMode, setDarkMode }) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState<Balance>({ current: 0, available: 0, limit: 0 });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const accessToken = localStorage.getItem('plaid_access_token');
        if (!accessToken) {
          setError('No bank account connected');
          setLoading(false);
          return;
        }

        // Fetch balances
        const balanceResponse = await fetch('http://localhost:3001/api/balances', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ access_token: accessToken }),
        });
        const balanceData = await balanceResponse.json();
        
        if (balanceData.accounts && balanceData.accounts.length > 0) {
          const account = balanceData.accounts[0];
          setBalance({
            current: account.balances.current || 0,
            available: account.balances.available || 0,
            limit: account.balances.limit || 0,
          });
        }

        // Fetch transactions
        const transactionsResponse = await fetch('http://localhost:3001/api/transactions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ access_token: accessToken }),
        });
        const transactionsData = await transactionsResponse.json();
        
        if (transactionsData.transactions) {
          const formattedTransactions = transactionsData.transactions.map((t: any) => ({
            date: t.date,
            amount: t.amount,
            name: t.name,
          }));
          setTransactions(formattedTransactions);
        }

        setLoading(false);
      } catch (error) {
        setError('Error fetching bank data');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const calculateSavings = () => {
    if (transactions.length === 0) return 0;
    const income = transactions
      .filter(t => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0);
    const expenses = transactions
      .filter(t => t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    return income - expenses;
  };

  const calculateMonthlySpending = () => {
    if (transactions.length === 0) return 0;
    const currentMonth = new Date().getMonth();
    const monthlyExpenses = transactions
      .filter(t => {
        const transactionMonth = new Date(t.date).getMonth();
        return transactionMonth === currentMonth && t.amount < 0;
      })
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    return monthlyExpenses;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
        <IconButton onClick={() => setDarkMode(!darkMode)}>
          {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
        </IconButton>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <GlowCard>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <AccountBalanceIcon sx={{ mr: 1 }} />
                  <Typography variant="h6">Total Balance</Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  ${balance.current.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Available: ${balance.available.toLocaleString()}
                </Typography>
              </CardContent>
            </GlowCard>
          </motion.div>
        </Grid>

        <Grid item xs={12} md={4}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <GlowCard>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <SavingsIcon sx={{ mr: 1 }} />
                  <Typography variant="h6">Savings</Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  ${calculateSavings().toLocaleString()}
                </Typography>
              </CardContent>
            </GlowCard>
          </motion.div>
        </Grid>

        <Grid item xs={12} md={4}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <GlowCard>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <TrendingUpIcon sx={{ mr: 1 }} />
                  <Typography variant="h6">Monthly Spending</Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  ${calculateMonthlySpending().toLocaleString()}
                </Typography>
              </CardContent>
            </GlowCard>
          </motion.div>
        </Grid>

        <Grid item xs={12}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <GlowCard>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Financial Overview
                </Typography>
                <Box sx={{ height: 400 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={transactions}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="amount"
                        stroke={theme.palette.primary.main}
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 8 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </GlowCard>
          </motion.div>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard; 