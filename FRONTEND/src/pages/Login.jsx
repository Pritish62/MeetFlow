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
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { AuthContext } from '../contexts/AuthContext.jsx';
import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const location = useLocation();

  const { handleLogin } = React.useContext(AuthContext);
  const navigate = useNavigate();
  const [error, setError] = useState('');

  useEffect(() => {
    if (location?.state) {
      if (location.state.email) setEmail(location.state.email);
      if (location.state.password) setPassword(location.state.password);
    }
  }, [location]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    try {
      await handleLogin(email, password);
      navigate("/home");
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to sign in");
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
        {/* You can change the bgcolor to match your app's theme */}
        <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Sign in
        </Typography>

        {error && (
          <Typography color="error" variant="body2" align="center" sx={{ mt: 1 }}>
            {error}
          </Typography>
        )}

        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
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
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Sign In
          </Button>

          {/* Grid layout for standard auth links */}
          <Grid container>
            <Grid item xs>
              <Link href="#" variant="body2">
                Forgot password?
              </Link>
            </Grid>
            <Grid item>
              <Link href="#" variant="body2">
                {"Don't have an account? Sign Up"}
              </Link>
            </Grid>
          </Grid>

        </Box>
      </Box>
    </Container>
  );
};

export default Login;