'use client'
import { useState, useEffect, useRef } from "react";
import { firestore, auth } from "../../firebase";
// import { firestore } from "@/firebase";
import { 
  Box, 
  Button, 
  Modal, 
  Stack, 
  TextField, 
  Typography,
  AppBar,
  Toolbar,
  IconButton,
  InputAdornment,
  CircularProgress,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Fade,
  Tooltip,
  Badge,
  Chip,
  Paper,
  Grid,
  Skeleton,
  Grow,
  Slide
} from "@mui/material";
import { collection, deleteDoc, doc, getDoc, getDocs, query, setDoc, where } from "firebase/firestore";
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import HomeIcon from '@mui/icons-material/Home';
import BarChartIcon from '@mui/icons-material/BarChart';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import LogoutIcon from '@mui/icons-material/Logout';
import DescriptionIcon from '@mui/icons-material/Description';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import InventoryIcon from '@mui/icons-material/Inventory';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { useRouter } from 'next/navigation';
import { useTheme } from '../theme/ThemeContext';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { motion, AnimatePresence } from 'framer-motion';
import CategoryIcon from '@mui/icons-material/Category';
import WarningIcon from '@mui/icons-material/Warning';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import { Suspense } from 'react';
import FilterListIcon from '@mui/icons-material/FilterList';

const MotionGrid = motion(Grid);
const MotionPaper = motion(Paper);

// Add prefetching for common routes
const prefetchRoutes = () => {
  const router = useRouter();
  useEffect(() => {
    // Prefetch common routes
    router.prefetch('/analytics');
    router.prefetch('/admin');
    router.prefetch('/login');
  }, [router]);
};

export default function Home() {
  const router = useRouter();
  const { darkMode, toggleDarkMode } = useTheme();
  const [inventory, setInventory] = useState([]);
  const [filteredInventory, setFilteredInventory] = useState([]);
  const [open, setOpen] = useState(false);
  const [itemName, setItemName] = useState('');
  const [itemCategory, setItemCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchHistory, setSearchHistory] = useState([]);
  const [showSearchHistory, setShowSearchHistory] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [sortBy, setSortBy] = useState({ field: 'quantity', direction: 'desc' });
  const [advancedFilters, setAdvancedFilters] = useState({
    minQuantity: '',
    maxQuantity: '',
    minPrice: '',
    maxPrice: '',
    expiryDate: '',
    prescriptionRequired: null,
    storageConditions: '',
    batchNumber: '',
    category: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [itemDescription, setItemDescription] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [editItemName, setEditItemName] = useState('');
  const [editItemCategory, setEditItemCategory] = useState('');
  const [editItemDescription, setEditItemDescription] = useState('');
  const [editItemPrice, setEditItemPrice] = useState('');
  const fileInputRef = useRef(null);
  const editFileInputRef = useRef(null);
  const [itemQuantity, setItemQuantity] = useState('1');
  const [isNavigating, setIsNavigating] = useState(false);

  const categories = [
    // Médicaments sur ordonnance
    'Médicaments sur ordonnance',
    'Antibiotiques',
    'Cardiovasculaire',
    'Diabète',
    'Respiratoire',
    'Gestion de la douleur',
    'Santé mentale',
    
    // Médicaments en vente libre
    'Médicaments en vente libre',
    'Antidouleurs',
    'Rhume et grippe',
    'Allergies',
    'Santé digestive',
    'Premiers soins',
    'Vitamines et suppléments',
    
    // Fournitures médicales
    'Fournitures médicales',
    'Bandages et pansements',
    'Dispositifs médicaux',
    'Kits de test',
    'Aides à la mobilité',
    
    // Soins personnels
    'Soins personnels',
    'Soins de la peau',
    'Soins bucco-dentaires',
    'Soins oculaires',
    'Soins féminins',
    'Soins pour bébé',
    
    // Santé et bien-être
    'Santé et bien-être',
    'Suppléments nutritionnels',
    'Produits à base de plantes',
    'Nutrition sportive',
    'Gestion du poids',
    
    // Autre
    'Autre'
  ];

  // Add new state variables for pharmacy-specific fields
  const [itemExpiryDate, setItemExpiryDate] = useState('');
  const [itemBatchNumber, setItemBatchNumber] = useState('');
  const [itemPrescriptionRequired, setItemPrescriptionRequired] = useState(false);
  const [itemStorageConditions, setItemStorageConditions] = useState('');
  const [itemDosageForm, setItemDosageForm] = useState('');
  const [itemStrength, setItemStrength] = useState('');

  // Add these to the edit state variables as well
  const [editItemExpiryDate, setEditItemExpiryDate] = useState('');
  const [editItemBatchNumber, setEditItemBatchNumber] = useState('');
  const [editItemPrescriptionRequired, setEditItemPrescriptionRequired] = useState(false);
  const [editItemStorageConditions, setEditItemStorageConditions] = useState('');
  const [editItemDosageForm, setEditItemDosageForm] = useState('');
  const [editItemStrength, setEditItemStrength] = useState('');

  // Add prefetching
  prefetchRoutes();

  // Optimize navigation
  const handleNavigation = (path) => {
    setIsNavigating(true);
    router.push(path);
  };

  // Add loading state for navigation
  useEffect(() => {
    const handleStart = () => setIsNavigating(true);
    const handleComplete = () => setIsNavigating(false);

    router.events?.on('routeChangeStart', handleStart);
    router.events?.on('routeChangeComplete', handleComplete);
    router.events?.on('routeChangeError', handleComplete);

    return () => {
      router.events?.off('routeChangeStart', handleStart);
      router.events?.off('routeChangeComplete', handleComplete);
      router.events?.off('routeChangeError', handleComplete);
    };
  }, [router]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        // Check if user is admin
        const userDoc = await getDoc(doc(firestore, 'users', user.uid));
        setIsAdmin(userDoc.exists() && userDoc.data().role === 'admin');
        // Only fetch inventory after we have the user data
        updateInventory();
      } else {
        router.push('/login');
      }
    });

    return () => unsubscribe();
  }, []);

  const updateInventory = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Check if we have a valid user
      if (!currentUser?.uid) {
        console.log('No user found, skipping Firestore fetch');
        setLoading(false);
        return;
      }

      let inventoryQuery;
      
      if (isAdmin) {
        // Admins can see all items
        inventoryQuery = query(collection(firestore, 'inventory'));
      } else {
        // Regular users can only see their items
        inventoryQuery = query(
          collection(firestore, 'inventory'),
          where('userId', '==', currentUser.uid)
        );
      }

      const docs = await getDocs(inventoryQuery);
      const inventoryList = [];
      
      docs.forEach((doc) => {
        const data = doc.data();
        inventoryList.push({
          id: doc.id,
          name: data.name?.trim() || doc.id, // Properly handle empty strings
          quantity: data.quantity || 1,
          category: data.category || 'Other',
          userId: data.userId,
          userEmail: data.userEmail,
          createdAt: data.createdAt,
          description: data.description || '',
          price: data.price || 0
        });
      });

      console.log('Fetched inventory:', inventoryList); // Debug log
      
      // Update both state and localStorage
      setInventory(inventoryList);
      setFilteredInventory(inventoryList);
      localStorage.setItem('inventory', JSON.stringify(inventoryList));
    } catch (err) {
      console.error('Error fetching inventory:', err);
      setError('Failed to fetch inventory: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Add a useEffect to fetch inventory when the component mounts
  useEffect(() => {
    if (currentUser?.uid) {
      updateInventory();
    }
  }, [currentUser?.uid, isAdmin]); // Add dependencies to refetch when user or admin status changes

  // Load inventory from localStorage on component mount
  useEffect(() => {
    const savedInventory = localStorage.getItem('inventory');
    if (savedInventory) {
      const parsedInventory = JSON.parse(savedInventory);
      setInventory(parsedInventory);
      setFilteredInventory(parsedInventory);
    }
  }, []);

  // Add this useEffect to handle search filtering
  useEffect(() => {
    const normalizedQuery = searchQuery?.trim().toLowerCase() || '';
    if (normalizedQuery === '') {
      setFilteredInventory(inventory);
    } else {
      const filtered = inventory.filter(item => 
        (item.name?.toLowerCase() || '').includes(normalizedQuery) ||
        (item.description?.toLowerCase() || '').includes(normalizedQuery)
      );
      setFilteredInventory(filtered);
    }
  }, [searchQuery, inventory]);

  const updateItemQuantity = async (itemId, newQuantity) => {
    try {
      setLoading(true);
      setError(null);
      
      if (newQuantity < 0) {
        setError('Quantity cannot be negative');
        return;
      }

      const itemRef = doc(firestore, 'inventory', itemId);
      await setDoc(itemRef, { quantity: newQuantity }, { merge: true });

      // Update local state
      const updatedInventory = inventory.map(item => 
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      );
      
      setInventory(updatedInventory);
      setFilteredInventory(updatedInventory);
      localStorage.setItem('inventory', JSON.stringify(updatedInventory));
    } catch (err) {
      setError('Failed to update quantity: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const addItem = async () => {
    if (!currentUser?.uid) {
      setError('You must be logged in to add items');
      return;
    }
    
    const trimmedName = itemName?.trim();
    if (!trimmedName) {
      setError('Item name is required');
      return;
    }

    if (trimmedName.length > 100) {
      setError('Item name must be less than 100 characters');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const itemRef = doc(collection(firestore, 'inventory'));
      const itemId = itemRef.id;

      const itemData = {
        id: itemId,
        name: trimmedName,
        category: itemCategory?.trim() || 'Other',
        description: itemDescription?.trim() || '',
        price: parseFloat(itemPrice) || 0,
        quantity: parseInt(itemQuantity) || 1,
        userId: currentUser.uid,
        userEmail: currentUser.email,
        createdAt: new Date().toISOString(),
        expiryDate: itemExpiryDate?.trim() || '',
        batchNumber: itemBatchNumber?.trim() || '',
        prescriptionRequired: itemPrescriptionRequired,
        storageConditions: itemStorageConditions?.trim() || '',
        dosageForm: itemDosageForm?.trim() || '',
        strength: itemStrength?.trim() || ''
      };

      await setDoc(itemRef, itemData);

      const newItem = { ...itemData };
      setInventory(prev => [...prev, newItem]);
      setFilteredInventory(prev => [...prev, newItem]);

      // Reset all form fields
      setItemName('');
      setItemCategory('');
      setItemDescription('');
      setItemPrice('');
      setItemQuantity('1');
      setItemExpiryDate('');
      setItemBatchNumber('');
      setItemPrescriptionRequired(false);
      setItemStorageConditions('');
      setItemDosageForm('');
      setItemStrength('');

      setSuccessMessage('Item added successfully!');
      setOpen(false);
    } catch (error) {
      console.error('Error adding item:', error);
      setError('Failed to add item: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async (itemId) => {
    try {
      setLoading(true);
      setError(null);
      const itemRef = doc(firestore, 'inventory', itemId);
      const itemDoc = await getDoc(itemRef);

      if (!itemDoc.exists()) {
        setError('Item not found');
        return;
      }

      // Check if user has permission to remove the item
      if (!isAdmin && itemDoc.data().userId !== currentUser.uid) {
        setError('You do not have permission to remove this item');
        return;
      }

      await deleteDoc(itemRef);

      // Update local state and localStorage
      const updatedInventory = inventory.filter(item => item.id !== itemId);
      setInventory(updatedInventory);
      setFilteredInventory(updatedInventory);
      localStorage.setItem('inventory', JSON.stringify(updatedInventory));

      setSuccessMessage('Item removed successfully');
    } catch (err) {
      setError('Failed to remove item: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setItemName('');
    setItemCategory('');
    setItemDescription('');
    setItemPrice('');
    setItemQuantity('1');
    setItemExpiryDate('');
    setItemBatchNumber('');
    setItemPrescriptionRequired(false);
    setItemStorageConditions('');
    setItemDosageForm('');
    setItemStrength('');
  };

  // Calculate total items for badge
  const totalItems = inventory.reduce((sum, item) => sum + item.quantity, 0);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem('user');
      localStorage.removeItem('inventory');
      router.push('/login');
    } catch (error) {
      console.error('Error logging out:', error);
      setError('Failed to logout: ' + error.message);
    }
  };

  const handleEditOpen = (item) => {
    setEditingItem(item);
    setEditItemName(item.name);
    setEditItemCategory(item.category || '');
    setEditItemDescription(item.description || '');
    setEditItemPrice(item.price || '');
    setEditItemExpiryDate(item.expiryDate || '');
    setEditItemBatchNumber(item.batchNumber || '');
    setEditItemPrescriptionRequired(item.prescriptionRequired || false);
    setEditItemStorageConditions(item.storageConditions || '');
    setEditItemDosageForm(item.dosageForm || '');
    setEditItemStrength(item.strength || '');
    setEditModalOpen(true);
  };

  const handleEditClose = () => {
    setEditModalOpen(false);
    setEditingItem(null);
    setEditItemName('');
    setEditItemCategory('');
    setEditItemDescription('');
    setEditItemPrice('');
    setEditItemExpiryDate('');
    setEditItemBatchNumber('');
    setEditItemPrescriptionRequired(false);
    setEditItemStorageConditions('');
    setEditItemDosageForm('');
    setEditItemStrength('');
  };

  const handleEditSave = async () => {
    try {
      setLoading(true);
      setError(null);

      const trimmedName = editItemName?.trim();
      if (!trimmedName) {
        setError('Item name cannot be empty');
        return;
      }

      if (trimmedName.length > 100) {
        setError('Item name must be less than 100 characters');
        return;
      }

      const itemRef = doc(firestore, 'inventory', editingItem.id);
      await setDoc(itemRef, {
        name: trimmedName,
        category: editItemCategory?.trim() || 'Other',
        description: editItemDescription?.trim() || '',
        price: parseFloat(editItemPrice) || 0,
        updatedAt: new Date().toISOString(),
        expiryDate: editItemExpiryDate?.trim() || '',
        batchNumber: editItemBatchNumber?.trim() || '',
        prescriptionRequired: editItemPrescriptionRequired,
        storageConditions: editItemStorageConditions?.trim() || '',
        dosageForm: editItemDosageForm?.trim() || '',
        strength: editItemStrength?.trim() || ''
      }, { merge: true });

      const updatedInventory = inventory.map(item => 
        item.id === editingItem.id 
          ? { 
              ...item, 
              name: trimmedName,
              category: editItemCategory?.trim() || 'Other',
              description: editItemDescription?.trim() || '',
              price: parseFloat(editItemPrice) || 0,
              expiryDate: editItemExpiryDate?.trim() || '',
              batchNumber: editItemBatchNumber?.trim() || '',
              prescriptionRequired: editItemPrescriptionRequired,
              storageConditions: editItemStorageConditions?.trim() || '',
              dosageForm: editItemDosageForm?.trim() || '',
              strength: editItemStrength?.trim() || ''
            } 
          : item
      );
      
      setInventory(updatedInventory);
      setFilteredInventory(updatedInventory);
      localStorage.setItem('inventory', JSON.stringify(updatedInventory));
      
      setSuccessMessage('Item updated successfully!');
      handleEditClose();
    } catch (err) {
      setError('Failed to update item: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const createUserDocument = async (user) => {
    try {
      const userRef = doc(firestore, 'users', user.uid);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        // Check if this is the first user in the system
        const usersCollection = collection(firestore, 'users');
        const usersSnapshot = await getDocs(usersCollection);
        const isFirstUser = usersSnapshot.empty;

        await setDoc(userRef, {
          email: user.email,
          role: isFirstUser ? 'admin' : 'user', // First user becomes admin
          createdAt: new Date().toISOString()
        });

        if (isFirstUser) {
          setSuccessMessage('Account created successfully! You are the first user and have been granted admin privileges.');
        } else {
          setSuccessMessage('Account created successfully!');
        }
      }
    } catch (error) {
      console.error('Error creating user document:', error);
      throw error;
    }
  };

  const handleSearch = (query) => {
    const normalizedQuery = query?.trim().toLowerCase() || '';
    setSearchQuery(normalizedQuery);
    
    // Add to search history if not empty
    if (normalizedQuery && !searchHistory.includes(normalizedQuery)) {
      setSearchHistory(prev => [normalizedQuery, ...prev].slice(0, 5));
    }

    // Apply both search query and filters
    applyFilters(normalizedQuery);
  };

  // Update the applyFilters function
  const applyFilters = (query = searchQuery) => {
    const normalizedQuery = query?.trim().toLowerCase() || '';
    
    const filtered = inventory.filter(item => {
      // Search query matching
      const matchesSearch = normalizedQuery === '' || 
        (item.name?.toLowerCase() || '').includes(normalizedQuery) ||
        (item.description?.toLowerCase() || '').includes(normalizedQuery) ||
        (item.category?.toLowerCase() || '').includes(normalizedQuery) ||
        (item.batchNumber?.toLowerCase() || '').includes(normalizedQuery) ||
        (item.storageConditions?.toLowerCase() || '').includes(normalizedQuery);

      // Advanced filters matching
      const matchesFilters = 
        (!advancedFilters.category || item.category === advancedFilters.category) &&
        (!advancedFilters.minQuantity || item.quantity >= Number(advancedFilters.minQuantity)) &&
        (!advancedFilters.maxQuantity || item.quantity <= Number(advancedFilters.maxQuantity)) &&
        (!advancedFilters.minPrice || item.price >= Number(advancedFilters.minPrice)) &&
        (!advancedFilters.maxPrice || item.price <= Number(advancedFilters.maxPrice)) &&
        (!advancedFilters.expiryDate || item.expiryDate === advancedFilters.expiryDate) &&
        (advancedFilters.prescriptionRequired === null || item.prescriptionRequired === advancedFilters.prescriptionRequired) &&
        (!advancedFilters.storageConditions || (item.storageConditions?.toLowerCase() || '').includes(advancedFilters.storageConditions.toLowerCase())) &&
        (!advancedFilters.batchNumber || (item.batchNumber?.toLowerCase() || '').includes(advancedFilters.batchNumber.toLowerCase()));

      return matchesSearch && matchesFilters;
    });

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      let valueA, valueB;

      switch (sortBy.field) {
        case 'name':
          valueA = (a.name || '').toLowerCase();
          valueB = (b.name || '').toLowerCase();
          break;
        case 'quantity':
          valueA = Number(a.quantity) || 0;
          valueB = Number(b.quantity) || 0;
          break;
        case 'price':
          valueA = Number(a.price) || 0;
          valueB = Number(b.price) || 0;
          break;
        case 'expiryDate':
          valueA = a.expiryDate ? new Date(a.expiryDate).getTime() : 0;
          valueB = b.expiryDate ? new Date(b.expiryDate).getTime() : 0;
          break;
        case 'category':
          valueA = (a.category || '').toLowerCase();
          valueB = (b.category || '').toLowerCase();
          break;
        default:
          valueA = Number(a.quantity) || 0;
          valueB = Number(b.quantity) || 0;
      }

      // Sort highest to lowest by default
      if (sortBy.direction === 'desc') {
        return valueB - valueA;
      } else {
        return valueA - valueB;
      }
    });

    setFilteredInventory(sorted);
  };

  // Add this function after the applyFilters function
  const handleSort = (field) => {
    setSortBy(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* App Bar */}
      <Box className={`${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-md sticky top-0 z-50`}>
        <Box className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Box className="flex justify-between items-center py-4">
            <Box className="flex items-center space-x-4">
              <Tooltip title="Home">
                <IconButton 
                  onClick={() => handleNavigation('/')} 
                  className={darkMode ? 'text-white' : 'text-gray-800'}
                  disabled={isNavigating}
                >
                  <HomeIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Inventory">
                <IconButton 
                  className={darkMode ? 'text-blue-400' : 'text-blue-600'}
                  disabled={isNavigating}
                >
                  <InventoryIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Analytics">
                <IconButton 
                  onClick={() => handleNavigation('/analytics')} 
                  className={darkMode ? 'text-white' : 'text-gray-800'}
                  disabled={isNavigating}
                >
                  <BarChartIcon />
                </IconButton>
              </Tooltip>
              {isAdmin && (
                <Grid item>
                  <IconButton 
                    onClick={() => handleNavigation('/admin')} 
                    color="primary"
                    disabled={isNavigating}
                  >
                    <AdminPanelSettingsIcon />
                  </IconButton>
                </Grid>
              )}
            </Box>
            <Box className="flex items-center space-x-4">
              <Tooltip title={darkMode ? 'Light Mode' : 'Dark Mode'}>
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <IconButton 
                    onClick={toggleDarkMode} 
                    className={darkMode ? 'text-white' : 'text-gray-800'}
                    disabled={isNavigating}
                  >
                    {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
                  </IconButton>
                </motion.div>
              </Tooltip>
              <Tooltip title="Logout">
                <IconButton 
                  onClick={handleLogout} 
                  className={darkMode ? 'text-white' : 'text-gray-800'}
                  disabled={isNavigating}
                >
                  <LogoutIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Main Content */}
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen">
          <CircularProgress />
        </div>
      }>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[
              {
                title: 'Total Items',
                value: inventory.reduce((sum, item) => sum + item.quantity, 0),
                icon: <InventoryIcon />,
                color: 'blue',
                subtitle: 'Across all categories',
                trend: '+12% from last month'
              },
              {
                title: 'Categories',
                value: categories.length,
                icon: <CategoryIcon />,
                color: 'green',
                subtitle: 'Unique categories',
                trend: 'Well organized'
              },
              {
                title: 'Low Stock',
                value: inventory.filter(item => item.quantity < 5).length,
                icon: <WarningIcon />,
                color: 'yellow',
                subtitle: 'Items need attention',
                trend: 'Requires immediate action'
              },
              {
                title: 'Total Value',
                value: `$${inventory.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0).toFixed(2)}`,
                icon: <AttachMoneyIcon />,
                color: 'purple',
                subtitle: 'Inventory value',
                trend: '+8% from last month'
              }
            ].map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className={`p-6 rounded-xl shadow-lg transform transition-all duration-300 hover:-translate-y-2 ${
                  darkMode ? 'bg-gradient-to-br from-gray-800 to-gray-700 hover:from-gray-700 hover:to-gray-600' : 
                  'bg-gradient-to-br from-white to-gray-50 hover:from-gray-50 hover:to-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <h3 className={`text-lg font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                    {stat.title}
                  </h3>
                  <div className={`p-2 rounded-full ${
                    darkMode ? `bg-${stat.color}-900/30` : `bg-${stat.color}-100`
                  }`}>
                    {stat.icon}
                  </div>
                </div>
                <p className={`text-3xl font-bold mt-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {stat.value}
                </p>
                <p className={`text-sm mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {stat.subtitle}
                </p>
                <p className={`text-xs mt-1 ${
                  stat.trend.includes('+') 
                    ? darkMode ? 'text-green-400' : 'text-green-600'
                    : stat.trend.includes('Requires') 
                      ? darkMode ? 'text-red-400' : 'text-red-600'
                      : darkMode ? 'text-blue-400' : 'text-blue-600'
                }`}>
                  {stat.trend}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <h2 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setOpen(true)}
                className={`p-4 rounded-lg flex items-center space-x-3 ${
                  darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'
                } shadow-md transition-colors duration-300`}
              >
                <div className={`p-2 rounded-full ${darkMode ? 'bg-blue-900/30' : 'bg-blue-100'}`}>
                  <AddIcon className={darkMode ? 'text-blue-400' : 'text-blue-600'} />
                </div>
                <div className="text-left">
                  <h3 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Add New Item
                  </h3>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Add a new item to your inventory
                  </p>
                </div>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className={`p-4 rounded-lg flex items-center space-x-3 ${
                  darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'
                } shadow-md transition-colors duration-300`}
              >
                <div className={`p-2 rounded-full ${darkMode ? 'bg-purple-900/30' : 'bg-purple-100'}`}>
                  <FilterListIcon className={darkMode ? 'text-purple-400' : 'text-purple-600'} />
                </div>
                <div className="text-left">
                  <h3 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Advanced Filters
                  </h3>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Filter and sort your inventory
                  </p>
                </div>
              </motion.button>
            </div>
          </div>

          {/* Search and Filter Section */}
          <Fade in={true} timeout={500}>
            <div className="flex flex-col md:flex-row gap-4 mb-8">
              <div className="flex-1">
                <div className="relative">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ${
                      darkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      placeholder="Search items by name, description, category, batch number..."
                      value={searchQuery}
                      onChange={(e) => handleSearch(e.target.value)}
                      onFocus={() => setShowSearchHistory(true)}
                      className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                        darkMode ? 'bg-gray-800 text-white border-gray-700' : 'bg-white text-gray-900 border-gray-300'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300`}
                    />
                    {searchQuery && (
                      <button
                        onClick={() => handleSearch('')}
                        className={`absolute inset-y-0 right-0 pr-3 flex items-center ${
                          darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                    
                    {/* Search History Dropdown */}
                    {showSearchHistory && searchHistory.length > 0 && (
                      <div className={`absolute z-10 w-full mt-1 py-1 rounded-lg shadow-lg ${
                        darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
                      }`}>
                        {searchHistory.map((term, index) => (
                          <button
                            key={index}
                            onClick={() => {
                              handleSearch(term);
                              setShowSearchHistory(false);
                            }}
                            className={`w-full px-4 py-2 text-left hover:bg-blue-500 hover:text-white ${
                              darkMode ? 'text-gray-300' : 'text-gray-700'
                            }`}
                          >
                            {term}
                          </button>
                        ))}
                      </div>
                    )}
                  </motion.div>
                </div>
              </div>
              
              {/* Add Sort Dropdown */}
              <motion.div 
                className="flex items-center space-x-2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <select
                  value={`${sortBy.field}-${sortBy.direction}`}
                  onChange={(e) => {
                    const [field, direction] = e.target.value.split('-');
                    setSortBy({ field, direction });
                    applyFilters();
                  }}
                  className={`px-3 py-2 rounded-lg border ${
                    darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300'
                  }`}
                >
                  <option value="quantity-desc">Quantity (High to Low)</option>
                  <option value="quantity-asc">Quantity (Low to High)</option>
                  <option value="price-desc">Price (High to Low)</option>
                  <option value="price-asc">Price (Low to High)</option>
                  <option value="name-asc">Name (A-Z)</option>
                  <option value="name-desc">Name (Z-A)</option>
                  <option value="expiryDate-desc">Expiry Date (Latest)</option>
                  <option value="expiryDate-asc">Expiry Date (Soonest)</option>
                  <option value="category-asc">Category (A-Z)</option>
                  <option value="category-desc">Category (Z-A)</option>
                </select>
              </motion.div>
            </div>
          </Fade>

          {/* Advanced Filters Panel */}
          <Slide direction="down" in={showAdvancedFilters} mountOnEnter unmountOnExit>
            <div className={`mb-8 p-4 rounded-lg ${
              darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
            }`}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Category Filter */}
                <div>
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Category
                  </label>
                  <select
                    value={advancedFilters.category}
                    onChange={(e) => {
                      setAdvancedFilters(prev => ({ ...prev, category: e.target.value }));
                    }}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300'
                    }`}
                  >
                    <option value="">All Categories</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                {/* Quantity Range */}
                <div>
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Quantity Range
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={advancedFilters.minQuantity}
                      onChange={(e) => {
                        setAdvancedFilters(prev => ({ ...prev, minQuantity: e.target.value }));
                      }}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300'
                      }`}
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={advancedFilters.maxQuantity}
                      onChange={(e) => {
                        setAdvancedFilters(prev => ({ ...prev, maxQuantity: e.target.value }));
                      }}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300'
                      }`}
                    />
                  </div>
                </div>
                
                {/* Price Range */}
                <div>
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Price Range
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={advancedFilters.minPrice}
                      onChange={(e) => {
                        setAdvancedFilters(prev => ({ ...prev, minPrice: e.target.value }));
                      }}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300'
                      }`}
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={advancedFilters.maxPrice}
                      onChange={(e) => {
                        setAdvancedFilters(prev => ({ ...prev, maxPrice: e.target.value }));
                      }}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300'
                      }`}
                    />
                  </div>
                </div>
                
                {/* Expiry Date */}
                <div>
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Expiry Date
                  </label>
                  <input
                    type="date"
                    value={advancedFilters.expiryDate}
                    onChange={(e) => {
                      setAdvancedFilters(prev => ({ ...prev, expiryDate: e.target.value }));
                    }}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300'
                    }`}
                  />
                </div>
                
                {/* Prescription Required */}
                <div>
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Prescription Required
                  </label>
                  <select
                    value={advancedFilters.prescriptionRequired === null ? '' : advancedFilters.prescriptionRequired}
                    onChange={(e) => {
                      const value = e.target.value === '' ? null : e.target.value === 'true';
                      setAdvancedFilters(prev => ({ ...prev, prescriptionRequired: value }));
                    }}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300'
                    }`}
                  >
                    <option value="">All</option>
                    <option value="true">Required</option>
                    <option value="false">Not Required</option>
                  </select>
                </div>
                
                {/* Storage Conditions */}
                <div>
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Storage Conditions
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Room temperature"
                    value={advancedFilters.storageConditions}
                    onChange={(e) => {
                      setAdvancedFilters(prev => ({ ...prev, storageConditions: e.target.value }));
                    }}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300'
                    }`}
                  />
                </div>
                
                {/* Batch Number */}
                <div>
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Batch Number
                  </label>
                  <input
                    type="text"
                    placeholder="Enter batch number"
                    value={advancedFilters.batchNumber}
                    onChange={(e) => {
                      setAdvancedFilters(prev => ({ ...prev, batchNumber: e.target.value }));
                    }}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300'
                    }`}
                  />
                </div>
              </div>
              
              <div className="mt-4 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setAdvancedFilters({
                      minQuantity: '',
                      maxQuantity: '',
                      minPrice: '',
                      maxPrice: '',
                      expiryDate: '',
                      prescriptionRequired: null,
                      storageConditions: '',
                      batchNumber: '',
                      category: ''
                    });
                    applyFilters();
                  }}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  } transition-colors duration-300`}
                >
                  Reset Filters
                </button>
                <button
                  onClick={() => applyFilters()}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    darkMode ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'
                  } transition-colors duration-300`}
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </Slide>

          {/* Search Results Info */}
          {searchQuery && (
            <div className={`mb-6 p-4 rounded-lg ${
              darkMode ? 'bg-gray-800' : 'bg-gray-50'
            }`}>
              <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Showing {filteredInventory.length} results for "{searchQuery}"
                {itemCategory && ` in category "${itemCategory}"`}
              </p>
            </div>
          )}

          {/* No Results Message */}
          {filteredInventory.length === 0 && (
            <div className={`text-center py-12 rounded-lg ${
              darkMode ? 'bg-gray-800' : 'bg-gray-50'
            }`}>
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className={`mt-2 text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                No items found
              </h3>
              <p className={`mt-1 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {searchQuery
                  ? 'Try adjusting your search or filter to find what you\'re looking for.'
                  : 'Add some items to get started.'}
              </p>
              {!searchQuery && (
                <button
                  onClick={() => setOpen(true)}
                  className={`mt-4 inline-flex items-center px-4 py-2 rounded-lg font-medium ${
                    darkMode ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'
                  } transition-colors duration-300`}
                >
                  <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Your First Item
                </button>
              )}
            </div>
          )}

          {/* Error and Success Messages */}
          {error && (
            <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative">
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          {successMessage && (
            <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg relative">
              <span className="block sm:inline">{successMessage}</span>
            </div>
          )}

          {/* Inventory Grid */}
          <AnimatePresence mode="wait">
            <Grid container spacing={2} direction="row" justifyContent="flex-start">
              {filteredInventory.map((item, index) => (
                <MotionGrid 
                  item 
                  xs={12} 
                  sm={6} 
                  md={4} 
                  lg={3} 
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <MotionPaper
                    elevation={2}
                    whileHover={{ 
                      scale: 1.02,
                      boxShadow: "0 8px 16px rgba(0,0,0,0.1)"
                    }}
                    transition={{ duration: 0.2 }}
                    sx={{
                      p: 2,
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      position: 'relative',
                      cursor: 'pointer',
                      '&:hover': {
                        boxShadow: 4,
                      },
                    }}
                  >
                    <Box sx={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 1 }}>
                      <IconButton
                          size="small"
                        onClick={() => handleEditOpen(item)}
                            sx={{ 
                          color: 'primary.main',
                              '&:hover': {
                        backgroundColor: 'primary.light',
                        color: 'white',
                          },
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => removeItem(item.id)}
                        sx={{ 
                          color: 'error.main',
                          '&:hover': {
                            backgroundColor: 'error.light',
                            color: 'white',
                          },
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>

                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {item.name}
                        </h3>
                        <div className="mt-1 flex flex-wrap gap-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            item.quantity < 5 
                              ? darkMode 
                                ? 'bg-red-900/30 text-red-300' 
                                : 'bg-red-100 text-red-800'
                              : darkMode 
                                ? 'bg-green-900/30 text-green-300' 
                                : 'bg-green-100 text-green-800'
                          }`}>
                            {item.quantity} in stock
                          </span>
                          {item.prescriptionRequired && (
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              darkMode 
                                ? 'bg-purple-900/30 text-purple-300' 
                                : 'bg-purple-100 text-purple-800'
                            }`}>
                              Rx Required
                            </span>
                          )}
                          {item.expiryDate && new Date(item.expiryDate) < new Date() && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              Expired
                            </span>
                          )}
                        </div>
                      </div>
                      <div className={`p-2 rounded-full ${
                        darkMode ? 'bg-blue-900/30' : 'bg-blue-100'
                      }`}>
                        <svg className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-6-6H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V7z" />
                        </svg>
                      </div>
                    </div>

                    {item.description && (
                      <p className={`mt-3 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                        {item.description}
                      </p>
                    )}

                    {/* Pharmacy-specific information */}
                    <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                      {item.batchNumber && (
                        <div>
                          <span className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            Batch:
                          </span>
                          <span className={`ml-2 font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {item.batchNumber}
                          </span>
                        </div>
                      )}
                      {item.dosageForm && (
                        <div>
                          <span className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            Form:
                          </span>
                          <span className={`ml-2 font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {item.dosageForm}
                          </span>
                        </div>
                      )}
                      {item.strength && (
                        <div>
                          <span className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            Strength:
                          </span>
                          <span className={`ml-2 font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {item.strength}
                          </span>
                        </div>
                      )}
                      {item.storageConditions && (
                        <div>
                          <span className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            Storage:
                          </span>
                          <span className={`ml-2 font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {item.storageConditions}
                          </span>
                        </div>
                      )}
                      {item.expiryDate && (
                        <div>
                          <span className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            Expires:
                          </span>
                          <span className={`ml-2 font-medium ${
                            new Date(item.expiryDate) < new Date()
                              ? 'text-red-500'
                              : darkMode
                              ? 'text-white'
                              : 'text-gray-900'
                          }`}>
                            {new Date(item.expiryDate).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <div>
                        <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          Category:
                        </span>
                        <span className={`ml-2 text-sm font-medium ${
                          darkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          {item.category || 'Uncategorized'}
                        </span>
                      </div>
                      {item.price && (
                        <div className={`text-lg font-bold ${
                          darkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          ${Number(item.price).toFixed(2)}
                        </div>
                      )}
                    </div>

                    {/* Added by information */}
                    <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            Added by:
                          </span>
                          <span className={`ml-2 text-xs font-medium ${
                            darkMode ? 'text-white' : 'text-gray-900'
                          }`}>
                            {item.userEmail || 'Unknown'}
                          </span>
                        </div>
                        {item.createdAt && (
                          <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {new Date(item.createdAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-6 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 0}
                          className={`p-2 rounded-lg ${
                            darkMode 
                              ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                          } transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                          </svg>
                        </button>
                        <span className={`text-lg font-medium ${
                          darkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                          className={`p-2 rounded-lg ${
                            darkMode 
                              ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                          } transition-colors duration-300`}
                        >
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </MotionPaper>
                </MotionGrid>
              ))}
            </Grid>
          </AnimatePresence>

          {/* Loading Skeleton */}
          {loading && (
            <Grid container spacing={2}>
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={item}>
                  <Paper
                    elevation={2}
                    sx={{
                      p: 2,
                      height: '300px',
                      display: 'flex',
                      flexDirection: 'column',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Skeleton variant="circular" width={40} height={40} />
                      <Box sx={{ ml: 2, width: '100%' }}>
                        <Skeleton variant="text" width="60%" />
                        <Skeleton variant="text" width="40%" />
                      </Box>
                    </Box>
                    <Skeleton variant="rectangular" height={100} sx={{ mb: 2 }} />
                    <Skeleton variant="text" width="80%" />
                    <Skeleton variant="text" width="60%" />
                    <Skeleton variant="text" width="40%" />
                  </Paper>
                </Grid>
              ))}
            </Grid>
          )}
        </main>
      </Suspense>

      {/* Add Item Modal */}
      {open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`max-w-md w-full p-6 rounded-xl shadow-2xl ${
            darkMode ? 'bg-gray-800' : 'bg-white'
          } max-h-[90vh] flex flex-col`}>
            <h2 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Add New Item
            </h2>
            <div className="space-y-4 overflow-y-auto" style={{maxHeight: '60vh'}}>
              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Item Name
                </label>
                <input
                  type="text"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300`}
                  placeholder="Enter item name"
                />
              </div>

              {/* Add new pharmacy-specific fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Expiry Date
                  </label>
                  <input
                    type="date"
                    value={itemExpiryDate}
                    onChange={(e) => setItemExpiryDate(e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Batch Number
                  </label>
                  <input
                    type="text"
                    value={itemBatchNumber}
                    onChange={(e) => setItemBatchNumber(e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300`}
                    placeholder="Enter batch number"
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Dosage Form
                  </label>
                  <input
                    type="text"
                    value={itemDosageForm}
                    onChange={(e) => setItemDosageForm(e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300`}
                    placeholder="e.g., Tablet, Capsule, Liquid"
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Strength
                  </label>
                  <input
                    type="text"
                    value={itemStrength}
                    onChange={(e) => setItemStrength(e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300`}
                    placeholder="e.g., 500mg, 10ml"
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Storage Conditions
                  </label>
                  <input
                    type="text"
                    value={itemStorageConditions}
                    onChange={(e) => setItemStorageConditions(e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300`}
                    placeholder="e.g., Room temperature, Refrigerated"
                  />
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="prescriptionRequired"
                  checked={itemPrescriptionRequired}
                  onChange={(e) => setItemPrescriptionRequired(e.target.checked)}
                  className={`h-4 w-4 rounded border-gray-300 ${
                    darkMode ? 'bg-gray-700 text-blue-500' : 'text-blue-500'
                  } focus:ring-blue-500`}
                />
                <label htmlFor="prescriptionRequired" className={`ml-2 block text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Requires Prescription
                </label>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Quantity
                </label>
                <input
                  type="number"
                  value={itemQuantity}
                  onChange={(e) => setItemQuantity(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300`}
                  placeholder="Enter quantity"
                  min="1"
                  step="1"
                />
              </div>

              {/* Existing fields */}
              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Category
                </label>
                <select
                  value={itemCategory}
                  onChange={(e) => setItemCategory(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300`}
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Price
                </label>
                <div className="relative">
                  <span className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                    darkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>$</span>
                  <input
                    type="number"
                    value={itemPrice}
                    onChange={(e) => setItemPrice(e.target.value)}
                    className={`w-full pl-8 pr-3 py-2 rounded-lg border ${
                      darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300`}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Description
                </label>
                <textarea
                  value={itemDescription}
                  onChange={(e) => setItemDescription(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300`}
                  placeholder="Enter item description"
                  rows="3"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={handleClose}
                className={`px-4 py-2 rounded-lg font-medium ${
                  darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                } transition-colors duration-300`}
              >
                Cancel
              </button>
              <button
                onClick={addItem}
                disabled={loading}
                className={`px-4 py-2 rounded-lg font-medium ${
                  loading
                    ? 'bg-blue-400 cursor-not-allowed'
                    : darkMode
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-blue-500 hover:bg-blue-600'
                } text-white transition-colors duration-300`}
              >
                {loading ? 'Adding...' : 'Add Item'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Item Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`max-w-md w-full p-0 rounded-xl shadow-2xl ${darkMode ? 'bg-gray-800' : 'bg-white'} max-h-[90vh] flex flex-col`}>
            <h2 className={`text-2xl font-bold mb-4 px-6 pt-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Edit Item</h2>
            <div className="space-y-4 overflow-y-auto flex-grow px-6" style={{maxHeight: '60vh'}}>
              <TextField label="Nom" value={editItemName} onChange={(e) => setEditItemName(e.target.value)} fullWidth />
              <FormControl fullWidth>
                <InputLabel>Catégorie</InputLabel>
                <Select value={editItemCategory} onChange={(e) => setEditItemCategory(e.target.value)} label="Catégorie">
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>{category}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField label="Description" value={editItemDescription} onChange={(e) => setEditItemDescription(e.target.value)} multiline rows={3} fullWidth />
              <TextField label="Prix" value={editItemPrice} onChange={(e) => setEditItemPrice(e.target.value)} type="number" fullWidth />
              <TextField label="Expiry Date" value={editItemExpiryDate} onChange={(e) => setEditItemExpiryDate(e.target.value)} type="date" fullWidth InputLabelProps={{ shrink: true }} />
              <TextField label="Batch Number" value={editItemBatchNumber} onChange={(e) => setEditItemBatchNumber(e.target.value)} fullWidth />
              <TextField label="Dosage Form" value={editItemDosageForm} onChange={(e) => setEditItemDosageForm(e.target.value)} fullWidth />
              <TextField label="Strength" value={editItemStrength} onChange={(e) => setEditItemStrength(e.target.value)} fullWidth />
              <TextField label="Storage Conditions" value={editItemStorageConditions} onChange={(e) => setEditItemStorageConditions(e.target.value)} fullWidth />
              <FormControl fullWidth>
                <InputLabel>Prescription Required</InputLabel>
                <Select value={editItemPrescriptionRequired} onChange={(e) => setEditItemPrescriptionRequired(e.target.value)} label="Prescription Required">
                  <MenuItem value={true}>Yes</MenuItem>
                  <MenuItem value={false}>No</MenuItem>
                </Select>
              </FormControl>
            </div>
            <div className="sticky bottom-0 left-0 w-full bg-white dark:bg-gray-800 px-6 py-4 border-t border-gray-200 dark:border-gray-700 z-10 flex justify-end gap-2 rounded-b-xl">
              <Button onClick={handleEditClose} variant="outlined">Annuler</Button>
              <Button onClick={handleEditSave} variant="contained" color="primary">Enregistrer</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
