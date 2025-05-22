'use client';

import { useState, useEffect } from "react";
import { firestore, auth } from "../../firebase";
import { collection, getDocs, query, where, doc, getDoc } from "firebase/firestore";
import { useRouter } from 'next/navigation';
import { useTheme } from '../theme/ThemeContext';
import { onAuthStateChanged } from 'firebase/auth';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  Box,
  Paper,
  Typography,
  Grid,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip as RechartsTooltip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import InventoryIcon from '@mui/icons-material/Inventory';
import BarChartIcon from '@mui/icons-material/BarChart';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import LogoutIcon from '@mui/icons-material/Logout';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { 
  Category as CategoryIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
  AttachMoney as MoneyIcon,
  Timeline as TimelineIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';

export default function Analytics() {
  const router = useRouter();
  const { darkMode, toggleDarkMode } = useTheme();
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [timeRange, setTimeRange] = useState('all');
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  const fetchInventory = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const savedInventory = localStorage.getItem('inventory');
      if (savedInventory) {
        const parsedInventory = JSON.parse(savedInventory);
        setInventory(parsedInventory);
      }
      
      let inventoryQuery;
      
      if (isAdmin) {
        inventoryQuery = query(collection(firestore, 'inventory'));
      } else if (currentUser && currentUser.uid) {
        inventoryQuery = query(
          collection(firestore, 'inventory'),
          where('userId', '==', currentUser.uid)
        );
      } else {
        setInventory([]);
        setLoading(false);
        return;
      }
      
      const docs = await getDocs(inventoryQuery);
      const inventoryList = [];
      docs.forEach((doc) => {
        const data = doc.data();
        inventoryList.push({
          id: doc.id,
          name: data.name,
          quantity: data.quantity || 0,
          category: data.category || 'Other',
          price: data.price || 0,
          createdAt: data.createdAt,
          description: data.description || ''
        });
      });
      
      setInventory(inventoryList);
      localStorage.setItem('inventory', JSON.stringify(inventoryList));
      setLastUpdated(new Date());
    } catch (err) {
      setError('Failed to fetch inventory data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const savedInventory = localStorage.getItem('inventory');
    if (savedInventory) {
      const parsedInventory = JSON.parse(savedInventory);
      setInventory(parsedInventory);
    }

    const handleStorageChange = (e) => {
      if (e.key === 'inventory') {
        const newInventory = JSON.parse(e.newValue);
        setInventory(newInventory);
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const savedInventory = localStorage.getItem('inventory');
      if (savedInventory) {
        const parsedInventory = JSON.parse(savedInventory);
        setInventory(parsedInventory);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        const userDoc = await getDoc(doc(firestore, 'users', user.uid));
        setIsAdmin(userDoc.exists() && userDoc.data().role === 'admin');
        fetchInventory();
      } else {
        router.push('/login');
      }
    });

    return () => unsubscribe();
  }, []);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleTimeRangeChange = (event) => {
    setTimeRange(event.target.value);
  };

  const getCategoryData = () => {
    const categoryCount = {};
    inventory.forEach(item => {
      const category = item.category || 'Other';
      categoryCount[category] = (categoryCount[category] || 0) + 1;
    });

    return Object.entries(categoryCount).map(([name, value]) => ({
      name,
      value
    }));
  };

  const getLowStockItems = () => {
    return inventory
      .filter(item => item.quantity < 5)
      .sort((a, b) => a.quantity - b.quantity)
      .slice(0, 5);
  };

  const getInventoryValue = () => {
    return inventory.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCategoryValue = () => {
    const categoryValue = {};
    inventory.forEach(item => {
      const category = item.category || 'Other';
      categoryValue[category] = (categoryValue[category] || 0) + (item.price * item.quantity);
    });
    return Object.entries(categoryValue).map(([name, value]) => ({ name, value }));
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading) {
    return (
      <Box className={`min-h-screen ${darkMode ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50'}`}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box className={`min-h-screen ${darkMode ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50'}`}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50'}`}>
      {/* App Bar */}
      <Box className={`${darkMode ? 'bg-gray-900/30 backdrop-blur-xl' : 'bg-white/30 backdrop-blur-xl'} shadow-2xl sticky top-0 z-50 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <Box className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Box className="flex justify-between items-center py-4">
            <Box className="flex items-center space-x-4">
              <Tooltip title="Home">
                <IconButton 
                  onClick={() => router.push('/')} 
                  className={`${darkMode ? 'text-white hover:bg-gray-800/50' : 'text-gray-800 hover:bg-gray-100/50'} transition-all duration-300 hover:scale-110`}
                >
                  <HomeIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Inventory">
                <IconButton 
                  onClick={() => router.push('/inventory')} 
                  className={`${darkMode ? 'text-blue-400 hover:bg-gray-800/50' : 'text-blue-600 hover:bg-gray-100/50'} transition-all duration-300 hover:scale-110`}
                >
                  <InventoryIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Analytics">
                <IconButton 
                  className={`${darkMode ? 'text-white hover:bg-gray-800/50' : 'text-gray-800 hover:bg-gray-100/50'} transition-all duration-300 hover:scale-110`}
                >
                  <BarChartIcon />
                </IconButton>
              </Tooltip>
            </Box>
            <Box className="flex items-center space-x-4">
              <Tooltip title={darkMode ? 'Light Mode' : 'Dark Mode'}>
                <IconButton 
                  onClick={toggleDarkMode} 
                  className={`${darkMode ? 'text-white hover:bg-gray-800/50' : 'text-gray-800 hover:bg-gray-100/50'} transition-all duration-300 hover:scale-110`}
                >
                  {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
                </IconButton>
              </Tooltip>
              <Tooltip title="Logout">
                <IconButton 
                  onClick={handleLogout} 
                  className={`${darkMode ? 'text-white hover:bg-gray-800/50' : 'text-gray-800 hover:bg-gray-100/50'} transition-all duration-300 hover:scale-110`}
                >
                  <LogoutIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Main Content */}
      <Box className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Box className="mb-8 flex items-center space-x-4">
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => router.push('/inventory')}
            className={`${darkMode ? 'text-white border-gray-600 hover:bg-gray-800/50' : 'text-gray-700 border-gray-300 hover:bg-gray-100/50'} transition-all duration-300 hover:scale-105`}
          >
            Back to Inventory
          </Button>
          <Box>
            <Typography variant="h4" className={`${darkMode ? 'text-white' : 'text-gray-900'} font-bold tracking-tight`}>
              Analytics Dashboard
            </Typography>
            <Typography variant="subtitle1" className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
              Last updated: {lastUpdated.toLocaleTimeString()}
            </Typography>
          </Box>
        </Box>

        {/* Filters */}
        <Box className="mb-8 flex space-x-4">
          <FormControl className="w-48">
            <InputLabel className={darkMode ? 'text-white' : 'text-gray-900'}>Time Range</InputLabel>
            <Select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className={`${darkMode ? 'text-white bg-gray-800/50' : 'text-gray-900 bg-white/50'} backdrop-blur-sm`}
            >
              <MenuItem value="all">All Time</MenuItem>
              <MenuItem value="week">Last Week</MenuItem>
              <MenuItem value="month">Last Month</MenuItem>
              <MenuItem value="year">Last Year</MenuItem>
            </Select>
          </FormControl>
          <FormControl className="w-48">
            <InputLabel className={darkMode ? 'text-white' : 'text-gray-900'}>Category</InputLabel>
            <Select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className={`${darkMode ? 'text-white bg-gray-800/50' : 'text-gray-900 bg-white/50'} backdrop-blur-sm`}
            >
              <MenuItem value="all">All Categories</MenuItem>
              {Array.from(new Set(inventory.map(item => item.category))).map(category => (
                <MenuItem key={category} value={category}>{category}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <Tooltip title="Refresh Data">
            <IconButton 
              onClick={fetchInventory} 
              className={`${darkMode ? 'text-white hover:bg-gray-800/50' : 'text-gray-800 hover:bg-gray-100/50'} transition-all duration-300 hover:scale-110`}
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Stats Grid */}
        <Grid container spacing={4} className="mb-8">
          <Grid item xs={12} sm={6} md={3}>
            <Paper className={`p-6 ${darkMode ? 'bg-gray-800/30' : 'bg-white/30'} backdrop-blur-xl transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <Box className="flex items-center justify-between">
                <Box>
                  <Typography variant="h6" className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
                    Total Items
                  </Typography>
                  <Typography variant="h4" className={`${darkMode ? 'text-white' : 'text-gray-900'} font-bold`}>
                    {inventory.length}
                  </Typography>
                </Box>
                <Box className={`${darkMode ? 'bg-blue-900/30' : 'bg-blue-100'} p-3 rounded-full`}>
                  <InventoryIcon className={darkMode ? 'text-blue-400' : 'text-blue-600'} />
                </Box>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper className={`p-6 ${darkMode ? 'bg-gray-800/30' : 'bg-white/30'} backdrop-blur-xl transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <Box className="flex items-center justify-between">
                <Box>
                  <Typography variant="h6" className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
                    Low Stock Items
                  </Typography>
                  <Typography variant="h4" className="text-red-500 font-bold">
                    {getLowStockItems().length}
                  </Typography>
                </Box>
                <Box className="bg-red-900/30 p-3 rounded-full">
                  <WarningIcon className="text-red-500" />
                </Box>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper className={`p-6 ${darkMode ? 'bg-gray-800/30' : 'bg-white/30'} backdrop-blur-xl transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <Box className="flex items-center justify-between">
                <Box>
                  <Typography variant="h6" className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
                    Categories
                  </Typography>
                  <Typography variant="h4" className={`${darkMode ? 'text-white' : 'text-gray-900'} font-bold`}>
                    {new Set(inventory.map(item => item.category)).size}
                  </Typography>
                </Box>
                <Box className={`${darkMode ? 'bg-green-900/30' : 'bg-green-100'} p-3 rounded-full`}>
                  <CategoryIcon className={darkMode ? 'text-green-400' : 'text-green-600'} />
                </Box>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper className={`p-6 ${darkMode ? 'bg-gray-800/30' : 'bg-white/30'} backdrop-blur-xl transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <Box className="flex items-center justify-between">
                <Box>
                  <Typography variant="h6" className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
                    Total Value
                  </Typography>
                  <Typography variant="h4" className={`${darkMode ? 'text-white' : 'text-gray-900'} font-bold`}>
                    ${getInventoryValue().toFixed(2)}
                  </Typography>
                </Box>
                <Box className={`${darkMode ? 'bg-yellow-900/30' : 'bg-yellow-100'} p-3 rounded-full`}>
                  <MoneyIcon className={darkMode ? 'text-yellow-400' : 'text-yellow-600'} />
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {/* Charts */}
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Paper className={`p-6 ${darkMode ? 'bg-gray-800/30' : 'bg-white/30'} backdrop-blur-xl transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <Box className="flex items-center justify-between mb-4">
                <Typography variant="h6" className={`${darkMode ? 'text-white' : 'text-gray-900'} font-bold`}>
                  Items by Category
                </Typography>
                <Box className={`${darkMode ? 'bg-blue-900/30' : 'bg-blue-100'} p-2 rounded-full`}>
                  <CategoryIcon className={darkMode ? 'text-blue-400' : 'text-blue-600'} />
                </Box>
              </Box>
              <div style={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={getCategoryData()}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {getCategoryData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      contentStyle={{
                        backgroundColor: darkMode ? '#1f2937' : '#ffffff',
                        border: darkMode ? '1px solid #374151' : '1px solid #e5e7eb',
                        color: darkMode ? '#ffffff' : '#111827',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper className={`p-6 ${darkMode ? 'bg-gray-800/30' : 'bg-white/30'} backdrop-blur-xl transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <Box className="flex items-center justify-between mb-4">
                <Typography variant="h6" className={`${darkMode ? 'text-white' : 'text-gray-900'} font-bold`}>
                  Low Stock Items
                </Typography>
                <Box className="bg-red-900/30 p-2 rounded-full">
                  <WarningIcon className="text-red-500" />
                </Box>
              </Box>
              <div style={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={getLowStockItems()}>
                    <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#e5e7eb'} />
                    <XAxis dataKey="name" stroke={darkMode ? '#9ca3af' : '#6b7280'} />
                    <YAxis stroke={darkMode ? '#9ca3af' : '#6b7280'} />
                    <RechartsTooltip 
                      contentStyle={{
                        backgroundColor: darkMode ? '#1f2937' : '#ffffff',
                        border: darkMode ? '1px solid #374151' : '1px solid #e5e7eb',
                        color: darkMode ? '#ffffff' : '#111827',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                      }}
                    />
                    <Bar dataKey="quantity" fill="#ff6b6b" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Paper>
          </Grid>
          <Grid item xs={12}>
            <Paper className={`p-6 ${darkMode ? 'bg-gray-800/30' : 'bg-white/30'} backdrop-blur-xl transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <Box className="flex items-center justify-between mb-4">
                <Typography variant="h6" className={`${darkMode ? 'text-white' : 'text-gray-900'} font-bold`}>
                  Inventory Value by Category
                </Typography>
                <Box className={`${darkMode ? 'bg-yellow-900/30' : 'bg-yellow-100'} p-2 rounded-full`}>
                  <MoneyIcon className={darkMode ? 'text-yellow-400' : 'text-yellow-600'} />
                </Box>
              </Box>
              <div style={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={getCategoryValue()}>
                    <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#e5e7eb'} />
                    <XAxis dataKey="name" stroke={darkMode ? '#9ca3af' : '#6b7280'} />
                    <YAxis stroke={darkMode ? '#9ca3af' : '#6b7280'} />
                    <RechartsTooltip 
                      contentStyle={{
                        backgroundColor: darkMode ? '#1f2937' : '#ffffff',
                        border: darkMode ? '1px solid #374151' : '1px solid #e5e7eb',
                        color: darkMode ? '#ffffff' : '#111827',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                      }}
                    />
                    <Bar dataKey="value" fill="#82ca9d" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </div>
  );
} 