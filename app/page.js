'use client';

import { Box, Button, Typography, Paper } from "@mui/material";
import { useRouter } from "next/navigation";
import Image from 'next/image'; // For background images or logos

export default function LandingPage() {
  const router = useRouter();

  const navigateToLogin = () => {
    router.push("/login"); // Navigates to the login page
  };

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      // sx={{ 
      //   background: "linear-gradient(135deg, #4bb3b7 0%, #5b4bb7 100%)",
      //   position: 'relative',
      //   overflow: 'hidden',
      // }}
      gap={2}
    >
      {/* Background Image or Hero Image */}
      <Box
        position="absolute"
        top={0}
        left={0}
        width="100%"
        height="100%"
        sx={{
          backgroundImage: "url('/image.jpg')", // Replace with your image path
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(8px)',
          zIndex: -1,
        }}
      />
      
      <Typography 
        variant="h2" 
        color="#fff" 
        gutterBottom
        sx={{
          fontFamily: 'Roboto, sans-serif', // Use a web font of your choice
          textAlign: 'center',
          fontWeight: 'bold',
        }}
      >
        Welcome to Inventory Manager
      </Typography>
      
      <Typography 
        variant="h6" 
        color="#fff" 
        sx={{
          fontFamily: 'Roboto, sans-serif',
          textAlign: 'center',
          maxWidth: '600px',
        }}
      >
        Manage your inventory items with ease. Keep track of what you have, add new items, and never run out of your essentials.
      </Typography>

      <Button 
        variant="contained" 
        onClick={navigateToLogin}
        sx={{
          bgcolor: '#fff', 
          color: '#0c3769',
          fontWeight: 'bold',
          '&:hover': {
            bgcolor: '#d44ef5',
            transform: 'scale(1.05)',
          },
          padding: '10px 20px',
          borderRadius: '8px',
          boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
        }}
      >
        Enter
      </Button>
    </Box>
  );
}

