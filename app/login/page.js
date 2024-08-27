'use client';

import { useState } from "react";
import { Box, Button, TextField, Typography, Alert } from "@mui/material";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";
import { auth } from "../../firebase";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState(""); // State for error messages
  const router = useRouter();

  const handleAuth = async () => {
    setError(""); // Clear any existing errors
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      router.push("/inventory");
    } catch (error) {
      setError(error.message); // Set the error message to be displayed
    }
  };

  return (
    <Box 
      display="flex" 
      flexDirection="column" 
      alignItems="center" 
      justifyContent="center"
      height="100vh"
      sx={{
        backgroundImage: "url('/image.jpg')", // Same background image
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        // Ensure no blur filter on the background
      }}
    >
      <Box 
        display="flex" 
        flexDirection="column" 
        alignItems="center" 
        justifyContent="center"
        padding={4}
        bgcolor="#ffffff" // Solid white background
        borderRadius="8px"
        boxShadow="0px 4px 6px rgba(0, 0, 0, 0.1)"
        sx={{
          position: 'relative',
          zIndex: 1, // Ensure it is on top of the background
        }}
      >
        <Typography variant="h4" mb={2} color="#0c3769">
          {isSignUp ? "Sign Up" : "Login"}
        </Typography>
        
        {/* Display error message if present */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <TextField 
          label="Email" 
          variant="outlined" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          fullWidth 
          sx={{ mb: 2 }}
        />
        <TextField 
          label="Password" 
          variant="outlined" 
          type="password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          fullWidth 
          sx={{ mb: 2 }}
        />
        <Button 
          variant="contained" 
          onClick={handleAuth}
          fullWidth
          sx={{
            mb: 2,
            bgcolor: '#0c3769',
            color: '#fff',
            '&:hover': {
              bgcolor: '#63a2eb',
            },
          }}
        >
          {isSignUp ? "Sign Up" : "Login"}
        </Button>
        <Button 
          onClick={() => setIsSignUp(!isSignUp)} 
          sx={{
            textDecoration: 'underline',
            color: '#0c3769',
          }}
        >
          {isSignUp ? "Already have an account? Login" : "Don't have an account? Sign Up"}
        </Button>
      </Box>
    </Box>
  );
}

