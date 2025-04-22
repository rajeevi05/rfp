import React, { useEffect, useState } from 'react';
import { usePlaidLink } from 'react-plaid-link';
import { Button, Box, Typography, Alert, CircularProgress } from '@mui/material';
import styled from 'styled-components';

const StyledButton = styled(Button)`
  && {
    background: linear-gradient(45deg, #9c27b0, #2196f3);
    color: white;
    padding: 10px 20px;
    border-radius: 8px;
    text-transform: none;
    font-weight: 600;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
    }
  }
`;

interface PlaidLinkProps {
  onSuccess: (publicToken: string) => void;
  onExit?: () => void;
}

const PlaidLink: React.FC<PlaidLinkProps> = ({ onSuccess, onExit }) => {
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const createLinkToken = async () => {
      try {
        console.log('Creating link token...');
        setLoading(true);
        const response = await fetch('http://localhost:3001/api/create_link_token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Link token created:', data);
        setLinkToken(data.link_token);
      } catch (error) {
        console.error('Error creating link token:', error);
        setError(error instanceof Error ? error.message : 'Failed to connect to the server. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    createLinkToken();
  }, []);

  const { open, ready, error: plaidError } = usePlaidLink({
    token: linkToken,
    onSuccess: (publicToken) => {
      console.log('Plaid link success:', publicToken);
      onSuccess(publicToken);
    },
    onExit: () => {
      console.log('Plaid link exited');
      if (onExit) onExit();
    },
  });

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 2 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ mt: 2 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ textAlign: 'center', mt: 2 }}>
      <StyledButton
        onClick={() => open()}
        disabled={!ready}
        variant="contained"
        fullWidth
      >
        Connect Bank Account
      </StyledButton>
      {!ready && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Loading...
        </Typography>
      )}
      {plaidError && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {plaidError.message}
        </Alert>
      )}
    </Box>
  );
};

export default PlaidLink; 