import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  List, 
  ListItem, 
  ListItemText, 
  Divider,
  Paper,
  CircularProgress,
  IconButton,
  Tooltip
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import PlaidLink from './PlaidLink';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ReceiptIcon from '@mui/icons-material/Receipt';
import RefreshIcon from '@mui/icons-material/Refresh';
import { Line, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip as ChartTooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  ChartTooltip,
  Legend
);

const Dashboard = () => {
  const { user } = useAuth();
  const [connectedAccounts, setConnectedAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [spendingData, setSpendingData] = useState(null);
  const [balanceData, setBalanceData] = useState(null);
  const [categoryData, setCategoryData] = useState(null);

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/api/transactions', {
        credentials: 'include'
      });
      const data = await response.json();
      setTransactions(data.transactions);
      processTransactionData(data.transactions);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (connectedAccounts.length > 0) {
      fetchTransactions();
    }
  }, [connectedAccounts, fetchTransactions]);

  const processTransactionData = (transactions) => {
    // Process data for spending trends chart
    const spendingByDate = {};
    const spendingByCategory = {};
    
    transactions.forEach(transaction => {
      const date = new Date(transaction.date).toLocaleDateString();
      if (!spendingByDate[date]) {
        spendingByDate[date] = 0;
      }
      spendingByDate[date] += Math.abs(transaction.amount);

      if (transaction.category) {
        if (!spendingByCategory[transaction.category]) {
          spendingByCategory[transaction.category] = 0;
        }
        spendingByCategory[transaction.category] += Math.abs(transaction.amount);
      }
    });

    // Set spending trends data
    setSpendingData({
      labels: Object.keys(spendingByDate),
      datasets: [{
        label: 'Daily Spending',
        data: Object.values(spendingByDate),
        borderColor: '#9c27b0',
        backgroundColor: 'rgba(156, 39, 176, 0.1)',
        tension: 0.4
      }]
    });

    // Set category data
    setCategoryData({
      labels: Object.keys(spendingByCategory),
      datasets: [{
        data: Object.values(spendingByCategory),
        backgroundColor: [
          '#9c27b0',
          '#673ab7',
          '#3f51b5',
          '#2196f3',
          '#00bcd4',
          '#009688',
          '#4caf50',
          '#8bc34a',
          '#ffc107',
          '#ff9800'
        ]
      }]
    });

    // Set balance data
    const balanceHistory = {};
    let runningBalance = 0;
    
    transactions
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .forEach(transaction => {
        const date = new Date(transaction.date).toLocaleDateString();
        runningBalance += transaction.amount;
        balanceHistory[date] = runningBalance;
      });

    setBalanceData({
      labels: Object.keys(balanceHistory),
      datasets: [{
        label: 'Account Balance',
        data: Object.values(balanceHistory),
        borderColor: '#4caf50',
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
        tension: 0.4
      }]
    });
  };

  const handlePlaidSuccess = async (publicToken, metadata) => {
    try {
      console.log('Plaid success:', { publicToken, metadata });
      setLoading(true);
      const response = await fetch('http://localhost:3001/api/exchange_public_token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ public_token: publicToken }),
        credentials: 'include'
      });
      const data = await response.json();
      setConnectedAccounts(prev => [...prev, {
        ...metadata.institution,
        access_token: data.access_token
      }]);
    } catch (error) {
      console.error('Error handling Plaid success:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <Box sx={{ 
      p: 3,
      minHeight: '100vh',
      background: 'linear-gradient(135deg, rgba(156,39,176,0.1) 0%, rgba(103,58,183,0.1) 100%)',
    }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
        Welcome, {user?.name || 'User'}!
      </Typography>
      
      {connectedAccounts.length === 0 ? (
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Card sx={{ 
              height: '100%',
              background: 'linear-gradient(145deg, rgba(30,30,30,0.8), rgba(42,42,42,0.8))',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(156, 39, 176, 0.2)',
            }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                  Connect Your Bank
                </Typography>
                <PlaidLink onSuccess={handlePlaidSuccess} />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      ) : (
        <Grid container spacing={4}>
          {/* Account Summary */}
          <Grid item xs={12}>
            <Card sx={{ 
              background: 'linear-gradient(145deg, rgba(30,30,30,0.8), rgba(42,42,42,0.8))',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(156, 39, 176, 0.2)',
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AccountBalanceIcon /> Account Summary
                  </Typography>
                  <Tooltip title="Refresh Data">
                    <IconButton color="primary" onClick={fetchTransactions}>
                      <RefreshIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                    <CircularProgress />
                  </Box>
                ) : (
                  <Grid container spacing={3}>
                    {connectedAccounts.map((account, index) => (
                      <Grid item xs={12} md={4} key={index}>
                        <Paper sx={{ p: 2, background: 'rgba(255,255,255,0.05)' }}>
                          <Typography variant="h6" gutterBottom>
                            {account.name}
                          </Typography>
                          <Typography variant="h4" color="primary">
                            {formatCurrency(account.balance || 0)}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Last updated: {new Date().toLocaleDateString()}
                          </Typography>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Charts */}
          <Grid item xs={12} md={6}>
            <Card sx={{ 
              height: '100%',
              background: 'linear-gradient(145deg, rgba(30,30,30,0.8), rgba(42,42,42,0.8))',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(156, 39, 176, 0.2)',
            }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TrendingUpIcon /> Spending Trends
                </Typography>
                {spendingData && (
                  <Line
                    data={spendingData}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: {
                          position: 'top',
                        },
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                        },
                      },
                    }}
                  />
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card sx={{ 
              height: '100%',
              background: 'linear-gradient(145deg, rgba(30,30,30,0.8), rgba(42,42,42,0.8))',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(156, 39, 176, 0.2)',
            }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TrendingUpIcon /> Balance History
                </Typography>
                {balanceData && (
                  <Line
                    data={balanceData}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: {
                          position: 'top',
                        },
                      },
                    }}
                  />
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card sx={{ 
              height: '100%',
              background: 'linear-gradient(145deg, rgba(30,30,30,0.8), rgba(42,42,42,0.8))',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(156, 39, 176, 0.2)',
            }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TrendingUpIcon /> Spending by Category
                </Typography>
                {categoryData && (
                  <Pie
                    data={categoryData}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: {
                          position: 'right',
                        },
                      },
                    }}
                  />
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Recent Transactions */}
          <Grid item xs={12} md={6}>
            <Card sx={{ 
              height: '100%',
              background: 'linear-gradient(145deg, rgba(30,30,30,0.8), rgba(42,42,42,0.8))',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(156, 39, 176, 0.2)',
            }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ReceiptIcon /> Recent Transactions
                </Typography>
                <List>
                  {transactions.slice(0, 5).map((transaction, index) => (
                    <React.Fragment key={transaction.id}>
                      <ListItem>
                        <ListItemText
                          primary={transaction.name}
                          secondary={new Date(transaction.date).toLocaleDateString()}
                        />
                        <Typography 
                          variant="body1" 
                          color={transaction.amount > 0 ? 'success.main' : 'error.main'}
                        >
                          {formatCurrency(transaction.amount)}
                        </Typography>
                      </ListItem>
                      {index < transactions.length - 1 && (
                        <Divider sx={{ my: 1, opacity: 0.2 }} />
                      )}
                    </React.Fragment>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default Dashboard;