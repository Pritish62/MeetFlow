import React, { useState } from 'react';
import {
  TextField,
  Button,
  Container,
  Typography,
  Box,
  Link,
  CssBaseline,
  Avatar,
  Grid,
  Snackbar,
  Alert,
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { AuthContext } from '../contexts/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  // 1. Added state for username and confirmPassword
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Optional: State to handle password mismatch errors
  const [error, setError] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const { handleRegister } = React.useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();

    // 2. Added validation to check if passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    // Clear error if they match
    setError('');

    try {
      await handleRegister(username, email, password);
      setSnackbarOpen(true);
      setTimeout(() => {
        navigate('/login', { state: { email, password, username } });
      }, 1200);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to register");
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Register {/* Updated Heading */}
        </Typography>

        {/* Changed mt (margin-top) to 3 to give a bit more spacing for the larger form */}
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 3 }}>

          {/* Display error message if passwords don't match */}
          {error && (
            <Typography color="error" variant="body2" align="center">
              {error}
            </Typography>
          )}

          {/* New Username Field */}
          <TextField
            margin="normal"
            required
            fullWidth
            id="username"
            label="Username"
            name="username"
            autoComplete="username"
            autoFocus
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {/* New Confirm Password Field */}
          <TextField
            margin="normal"
            required
            fullWidth
            name="confirmPassword"
            label="Confirm Password"
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Sign Up {/* Updated Button Text */}
          </Button>

          {/* Updated Link for Registration Page */}
          <Grid container justifyContent="flex-end">
            <Grid item>
              <Link href="#" variant="body2">
                Already have an account? Sign in
              </Link>
            </Grid>
          </Grid>

        </Box>
      </Box>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity="success" sx={{ width: '100%' }}>
          User registered
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Register;