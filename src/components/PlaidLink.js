import React, { useEffect, useState } from 'react';
import { usePlaidLink } from 'react-plaid-link';
import { Box, Button, CircularProgress, Alert } from '@mui/material';

const PlaidLink = ({ onSuccess }) => {
  const [linkToken, setLinkToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const createLinkToken = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('Creating link token...');
        
        const response = await fetch('http://localhost:3001/api/create_link_token', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to create link token');
        }

        const data = await response.json();
        console.log('Link token created:', data);
        setLinkToken(data.link_token);
      } catch (err) {
        console.error('Error creating link token:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    createLinkToken();
  }, []);

  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess: (publicToken, metadata) => {
      console.log('Plaid connection successful:', { publicToken, metadata });
      onSuccess(publicToken, metadata);
    },
    onExit: (err, metadata) => {
      console.log('Plaid connection exited:', { err, metadata });
      if (err) {
        setError(err.message);
      }
    },
  });

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" p={2}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Button
      variant="contained"
      color="primary"
      onClick={() => open()}
      disabled={!ready || !linkToken}
      fullWidth
    >
      Connect Bank Account
    </Button>
  );
};

export default PlaidLink; 