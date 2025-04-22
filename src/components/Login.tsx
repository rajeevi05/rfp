import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  Paper,
  IconButton,
  useTheme,
} from '@mui/material';
import { motion } from 'framer-motion';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import styled from 'styled-components';

const GlowBox = styled(Box)`
  position: relative;
  &::before {
    content: '';
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    background: linear-gradient(45deg, #ff00ff, #00ffff, #ff00ff, #00ffff);
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
`;

interface LoginProps {
  darkMode: boolean;
  setDarkMode: (darkMode: boolean) => void;
}

const Login: React.FC<LoginProps> = ({ darkMode, setDarkMode }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const theme = useTheme();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically handle authentication
    navigate('/dashboard');
  };

  const handleBankConnect = () => {
    // Here you would integrate with Plaid or similar service
    console.log('Connecting to bank...');
  };

  return (
    <Container maxWidth="sm">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <IconButton
            onClick={() => setDarkMode(!darkMode)}
            sx={{ position: 'absolute', top: 16, right: 16 }}
          >
            {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>

          <GlowBox>
            <Paper
              elevation={3}
              sx={{
                p: 4,
                borderRadius: 2,
                background: theme.palette.background.paper,
              }}
            >
              <Typography
                variant="h4"
                component="h1"
                gutterBottom
                sx={{
                  textAlign: 'center',
                  fontWeight: 'bold',
                  background: 'linear-gradient(45deg, #9c27b0, #2196f3)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Modern Banking
              </Typography>

              <form onSubmit={handleLogin}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField
                    label="Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    fullWidth
                    required
                  />
                  <TextField
                    label="Password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    fullWidth
                    required
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    sx={{ mt: 2 }}
                  >
                    Sign In
                  </Button>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={handleBankConnect}
                    sx={{
                      borderColor: 'primary.main',
                      '&:hover': {
                        borderColor: 'primary.main',
                        backgroundColor: 'rgba(147, 112, 219, 0.1)',
                      },
                    }}
                  >
                    Connect Bank Account
                  </Button>
                </Box>
              </form>
            </Paper>
          </GlowBox>
        </Box>
      </motion.div>
    </Container>
  );
};

export default Login; 