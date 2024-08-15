// INVENTORY_MANAGEMENT/app/landing.js
'use client'
import { Box, Button, Typography } from "@mui/material";
import { useRouter } from "next/navigation";

export default function LandingPage() {
  const router = useRouter();

  const navigateToMainPage = () => {
    router.push("/inventory"); // Navigates to the main page in invetory
  };

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      sx={{ 
        background: "linear-gradient(135deg, #4bb3b7 0%, #5b4bb7 100%)",
      }}
      gap={2}
    >
      <Typography variant="h2" color="#fff" gutterBottom>
        Welcome to My Pantry Tracker
      </Typography>
      <Button 
        variant="contained" 
        color="primary" 
        onClick={navigateToMainPage}
        sx={{
          bgcolor: '#0c3769', 
          color: '#fff',
          '&:hover': {
            bgcolor: '#63a2eb',
          },
        }}
      >
        Enter
      </Button>
    </Box>
  );
}
