'use client'
import Image from "next/image";
import { useState, useEffect } from "react";
import { firestore } from "../../firebase";
// import { firestore } from "@/firebase";
import { Box, Button, Modal, Stack, TextField, Typography } from "@mui/material";
import { collection, deleteDoc, doc, getDoc, getDocs, query, setDoc } from "firebase/firestore";


export default function Home() {
  const [inventory, setInventory] = useState([])
  const [open, setOpen] = useState(false)
  const [itemName, setItemName] = useState([''])

  const updateInventory = async () => {
    const snapshot = query(collection(firestore, 'inventory'))
    const docs = await getDocs(snapshot)
    const inventoryList = []
    docs.forEach((doc)=>{
      inventoryList.push({
        name: doc.id,
        ...doc.data(), 
    })
    })
    setInventory(inventoryList)
  }

  const addItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item)
    const docSnap = await getDoc(docRef)

    if(docSnap.exists()){
      const {quantity} = docSnap.data()
      await setDoc(docRef, {quantity: quantity + 1})
      } else {
      await setDoc(docRef, {quantity: 1})
    }

    await updateInventory()
  }
  
  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item)
    const docSnap = await getDoc(docRef)

    if(docSnap.exists()){
      const {quantity} = docSnap.data()
      if (quantity == 1){
        await deleteDoc(docRef)
      } else {
        await setDoc(docRef, {quantity: quantity - 1})
      }
    }

    await updateInventory()
  }

  useEffect(() => {
    updateInventory()
  }, [])

  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)


  return (
    <Box 
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      bgcolor="white"
      justifyContent="center"
      alignItems="center"
      gap={2}
    sx={{
      backgroundImage: "url('/image2_copy.jpg')", // Replace with your image path
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }}
    >
      <Modal open={open} onClose={handleClose}>
        <Box 
          position="absolute" 
          top="50%" 
          left="50%"
          width={400}
          bgcolor="white"
          // border="2px solid #fff"
          border="8px groove #fff" // A 3D groove border effect
          boxShadow={24}
          p={4}
          display="flex"
          flexDirection="column"
          gap={3}
          sx={{
            transform: 'translate(-50%, -50%)',
            background: 'linear-gradient(135deg, #d44ef5 0%, #7dbbfa 100%)', // Blue gradient
          }}
        >
          <Typography 
            variant="h6" 
            color="#fff" // Set the text color
            sx={{ 
              fontWeight: 'bold', // Make the text bold
              // textShadow: '2px 2px 0px #000, -2px -2px 0px #000, 2px -2px 0px #000, -2px 2px 0px #000', // Outline effect
            }}
          >
            Add Item
          </Typography>
          <Stack width="100%" direction="row" spacing={2}>
            <TextField 
            variant='outlined'
            fullWidth
            value={itemName}
            onChange={(e) => {
                setItemName(e.target.value)
              }}
            sx={{
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: '#062952', // Set the outline color
                  borderWidth: '2px', // Set the border width (bolder outline)
                },
                '&:hover fieldset': {
                  borderColor: '#3a5a8a', // Change outline color on hover
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#3a5a8a', // Change outline color when focused
                },
              },
            }}
            />
            <Button 
              variant="outlined" 
              onClick={() => {
              addItem(itemName)
              setItemName('')
              handleClose()
            }}
            sx={{
              bgcolor: '#d44ef5', // A dark blue color
              color: '#fff', // Set text color to white for better contrast
              '&:hover': {
                bgcolor: '#63a2eb', // Lighter shade for hover effect
              },
            }}
            >
              Add
            </Button>
          </Stack>
        </Box>
      </Modal>
      <Button 
        variant="contained" 
        onClick={() => {
          handleOpen()
        }}
        sx={{
          bgcolor: '#0c3769', // A dark blue color
          color: '#fff', // White text for contrast
          '&:hover': {
            bgcolor: '#63a2eb', // Lighter shade for hover effect
          },
        }}
      >
        Add New Item
      </Button>
      <Box border="1px solid #333">
        <Box
          width="800px"
          height="100px"
          display="flex"
          bgcolor="#dc7af5"
          alignItems="center"
          justifyContent="center"
          // sx={{
          //   background: 'linear-gradient(90deg, #ead8ed 0%, #d44ef5 100%)', // Blue gradient
          // }}
        >
          <Typography 
            variant = "h2" 
            color="#080808" 
            sx={{ 
              fontFamily: 'Indie Flower, cursive' // Optional: makes the font bold
            }}>
            Inventory Items
          </Typography>
        </Box>
      <Stack
        width="800px"
        height="500px"
        spacing={2}
        overflow="auto"
      >
        {inventory.map(({name, quantity}) => (
            <Box 
              key={name}
              width="100%"
              minHeight="150px"
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              bgcolor="#f0f0f0"
              padding={5}
              sx={{
                background: 'linear-gradient(90deg, #a4c2fc 0%, #ead8ed 100%)', // Blue gradient
              }}
            >
              <Typography variant='h3' color="#333" textAlign="center" sx={{ 
              fontFamily: 'Indie Flower, cursive' // Optional: makes the font bold
            }}>
                {name.charAt(0).toUpperCase() + name.slice(1)}
              </Typography>
              <Typography variant='h3' color="#333" textAlign="center" sx={{ 
              fontFamily: 'Indie Flower, cursive' // Optional: makes the font bold
            }}>
                {quantity}
              </Typography>
              <Stack direction="row" spacing={2}>
              <Button
                variant="contained"
                onClick={() => {
                  addItem(name)
                }}
                sx={{
                  bgcolor: '#d44ef5', // A dark blue color
                  color: '#fff', // White text for contrast
                  '&:hover': {
                    bgcolor: '#63a2eb', // Lighter shade for hover effect
                  },
                }}
              >
                Add
                </Button>
              <Button
                variant="contained"
                onClick={() => {
                  removeItem(name)
                }}
                sx={{
                  bgcolor: '#0E55E7', // A dark blue color
                  color: '#fff', // White text for contrast
                  '&:hover': {
                    bgcolor: '#63a2eb', // Lighter shade for hover effect
                  },
                }}
              >
                Remove
                </Button>
                </Stack>
            </Box>
          ))}
      </Stack>
      </Box>
    </Box>
  )
}
