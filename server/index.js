const express = require('express');
const cors = require('cors');
const { Configuration, PlaidApi, PlaidEnvironments } = require('plaid');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');

dotenv.config();

const app = express();
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(bodyParser.json());

// Add a root route for testing
app.get('/', (req, res) => {
  res.json({ message: 'Server is running!' });
});

const configuration = new Configuration({
  basePath: PlaidEnvironments[process.env.PLAID_ENV],
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
      'PLAID-SECRET': process.env.PLAID_SECRET,
    },
  },
});

const plaidClient = new PlaidApi(configuration);

// Store access tokens in memory (in production, use a database)
const accessTokens = new Map();

app.post('/api/create_link_token', async (req, res) => {
  try {
    console.log('Creating link token...');
    console.log('Using Plaid credentials:', { 
      clientId: process.env.PLAID_CLIENT_ID,
      env: process.env.PLAID_ENV 
    });

    const configs = {
      user: {
        client_user_id: 'user-id',
      },
      client_name: 'Plaid Test App',
      products: ['transactions'],
      country_codes: ['US'],
      language: 'en',
    };

    const createTokenResponse = await plaidClient.linkTokenCreate(configs);
    console.log('Link token created successfully:', createTokenResponse.data);
    res.json(createTokenResponse.data);
  } catch (error) {
    console.error('Error creating link token:', error.response?.data || error.message);
    res.status(500).json({ error: error.response?.data || error.message });
  }
});

app.post('/api/exchange_public_token', async (req, res) => {
  try {
    const { public_token } = req.body;
    const exchangeResponse = await plaidClient.itemPublicTokenExchange({
      public_token: public_token,
    });

    const access_token = exchangeResponse.data.access_token;
    const item_id = exchangeResponse.data.item_id;

    // Store the access token (in production, store in a database)
    accessTokens.set(item_id, access_token);

    res.json({ access_token, item_id });
  } catch (error) {
    console.error('Error exchanging public token:', error.response?.data || error.message);
    res.status(500).json({ error: error.response?.data || error.message });
  }
});

app.get('/api/transactions', async (req, res) => {
  try {
    // In production, you would get the access token from your database
    // For this example, we'll use the first stored access token
    const access_token = Array.from(accessTokens.values())[0];

    if (!access_token) {
      return res.status(400).json({ error: 'No access token found' });
    }

    // Get transactions for the last 30 days
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));

    const transactionsResponse = await plaidClient.transactionsGet({
      access_token,
      start_date: thirtyDaysAgo.toISOString().split('T')[0],
      end_date: now.toISOString().split('T')[0],
      options: {
        include_personal_finance_category: true
      }
    });

    // Get account balances
    const balanceResponse = await plaidClient.accountsBalanceGet({
      access_token
    });

    // Combine transactions and account data
    const response = {
      transactions: transactionsResponse.data.transactions.map(t => ({
        id: t.transaction_id,
        name: t.name,
        amount: t.amount,
        date: t.date,
        category: t.personal_finance_category?.primary || 'Uncategorized'
      })),
      accounts: balanceResponse.data.accounts.map(a => ({
        account_id: a.account_id,
        name: a.name,
        balance: a.balances.current,
        type: a.type
      }))
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching transactions:', error.response?.data || error.message);
    res.status(500).json({ error: error.response?.data || error.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Plaid environment: ${process.env.PLAID_ENV}`);
}); 