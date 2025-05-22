'use client';

import { useState, useEffect } from 'react';
import { firestore, auth } from '../../firebase';
import { 
  collection, 
  getDocs, 
  doc, 
  getDoc, 
  updateDoc,
  query,
  where,
  orderBy
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Switch,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Tabs,
  Tab,
  Divider
} from '@mui/material';
import {
  Home as HomeIcon,
  Inventory as InventoryIcon,
  BarChart as BarChartIcon,
  AdminPanelSettings as AdminIcon,
  Refresh as RefreshIcon,
  Warning as WarningIcon,
  Brightness4 as Brightness4Icon,
  Brightness7 as Brightness7Icon,
  People as PeopleIcon,
  Category as CategoryIcon,
  AttachMoney as MoneyIcon,
  Timeline as TimelineIcon
} from '@mui/icons-material';
import { useTheme } from '../theme/ThemeContext';

export default function AdminPage() {
  const router = useRouter();
  const { darkMode, toggleDarkMode } = useTheme();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalItems: 0,
    totalCategories: 0,
    totalValue: 0,
    lowStockItems: 0,
    recentActivity: []
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(firestore, 'users', user.uid));
        if (!userDoc.exists() || userDoc.data().role !== 'admin') {
          router.push('/inventory');
          return;
        }
        fetchUsers();
        fetchStats();
      } else {
        router.push('/login');
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching users...');
      
      // Get all users from Firestore
      const usersQuery = query(collection(firestore, 'users'));
      const snapshot = await getDocs(usersQuery);
      
      console.log('Firestore response:', snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })));
      
      const usersList = [];
      snapshot.forEach((doc) => {
        const userData = doc.data();
        console.log('Processing user:', doc.id, userData);
        usersList.push({
          id: doc.id,
          email: userData.email,
          role: userData.role || 'user',
          createdAt: userData.createdAt || new Date().toISOString(),
          lastLogin: userData.lastLogin || 'Never'
        });
      });

      console.log('Processed users list:', usersList);
      setUsers(usersList);
      
      // Update stats with the actual number of users
      setStats(prevStats => ({
        ...prevStats,
        totalUsers: usersList.length
      }));

      // Also update other stats
      await fetchStats();
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to fetch users: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Add a refresh interval
  useEffect(() => {
    fetchUsers();
    // Refresh users every 30 seconds
    const interval = setInterval(fetchUsers, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      const inventoryQuery = query(collection(firestore, 'inventory'));
      const inventorySnapshot = await getDocs(inventoryQuery);
      
      const categories = new Set();
      let totalItems = 0;
      let totalValue = 0;
      let lowStockItems = 0;
      
      inventorySnapshot.forEach((doc) => {
        const data = doc.data();
        totalItems += data.quantity || 0;
        totalValue += (data.price || 0) * (data.quantity || 0);
        if (data.quantity < 5) lowStockItems++;
        if (data.category) {
          categories.add(data.category);
        }
      });

      // Update stats while preserving the totalUsers count
      setStats(prevStats => ({
        ...prevStats,
        totalItems,
        totalCategories: categories.size,
        totalValue,
        lowStockItems
      }));
    } catch (err) {
      setError('Failed to fetch stats: ' + err.message);
    }
  };

  const toggleUserRole = async (userId, currentRole) => {
    try {
      setLoading(true);
      const userRef = doc(firestore, 'users', userId);
      await updateDoc(userRef, {
        role: currentRole === 'admin' ? 'user' : 'admin'
      });
      await fetchUsers();
    } catch (err) {
      setError('Failed to update user role: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const navigateTo = (path) => {
    router.push(path);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Navigation Bar */}
      <Paper sx={{ mb: 3, p: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item>
            <IconButton onClick={() => navigateTo('/inventory')} color="primary">
              <HomeIcon />
            </IconButton>
          </Grid>
          <Grid item>
            <IconButton onClick={() => navigateTo('/inventory')} color="primary">
              <InventoryIcon />
            </IconButton>
          </Grid>
          <Grid item>
            <IconButton onClick={() => navigateTo('/analytics')} color="primary">
              <BarChartIcon />
            </IconButton>
          </Grid>
          <Grid item>
            <IconButton color="primary" disabled>
              <AdminIcon />
            </IconButton>
          </Grid>
          <Grid item xs />
          <Grid item>
            <IconButton onClick={toggleDarkMode} color="primary">
              {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
          </Grid>
        </Grid>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Debug Information */}
      <Paper sx={{ mb: 3, p: 2 }}>
        <Typography variant="h6" gutterBottom>Debug Information</Typography>
        <Typography variant="body2" color="textSecondary">
          Total Users: {users.length} (Stats: {stats.totalUsers})
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Last Refresh: {new Date().toLocaleTimeString()}
        </Typography>
      </Paper>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <PeopleIcon sx={{ mr: 1 }} />
                <Typography color="textSecondary">
                  Total Users
                </Typography>
              </Box>
              <Typography variant="h4">
                {users.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <InventoryIcon sx={{ mr: 1 }} />
                <Typography color="textSecondary">
                  Total Items
                </Typography>
              </Box>
              <Typography variant="h4">
                {stats.totalItems}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <CategoryIcon sx={{ mr: 1 }} />
                <Typography color="textSecondary">
                  Total Categories
                </Typography>
              </Box>
              <Typography variant="h4">
                {stats.totalCategories}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <MoneyIcon sx={{ mr: 1 }} />
                <Typography color="textSecondary">
                  Total Value
                </Typography>
              </Box>
              <Typography variant="h4">
                ${stats.totalValue.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <WarningIcon sx={{ mr: 1 }} />
                <Typography color="textSecondary">
                  Low Stock Items
                </Typography>
              </Box>
              <Typography variant="h4">
                {stats.lowStockItems}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab icon={<PeopleIcon />} label="User Management" />
          <Tab icon={<InventoryIcon />} label="Inventory Overview" />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      <Paper sx={{ p: 2 }}>
        {activeTab === 0 && (
          <>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">User Management</Typography>
              <Box>
                <Button
                  startIcon={<RefreshIcon />}
                  onClick={fetchUsers}
                  sx={{ mr: 1 }}
                >
                  Refresh Users
                </Button>
                <Button
                  startIcon={<RefreshIcon />}
                  onClick={() => {
                    fetchUsers();
                    fetchStats();
                  }}
                >
                  Refresh All
                </Button>
              </Box>
            </Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Email</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Created At</TableCell>
                    <TableCell>Last Login</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.role || 'user'}</TableCell>
                      <TableCell>
                        {new Date(user.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {user.lastLogin === 'Never' ? 'Never' : new Date(user.lastLogin).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Tooltip title={`Make ${user.role === 'admin' ? 'User' : 'Admin'}`}>
                          <Switch
                            checked={user.role === 'admin'}
                            onChange={() => toggleUserRole(user.id, user.role)}
                            color="primary"
                          />
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}

        {activeTab === 1 && (
          <Box>
            <Typography variant="h6" mb={2}>Quick Actions</Typography>
            <Grid container spacing={2}>
              <Grid item>
                <Button
                  variant="contained"
                  startIcon={<InventoryIcon />}
                  onClick={() => navigateTo('/inventory')}
                >
                  Manage Inventory
                </Button>
              </Grid>
              <Grid item>
                <Button
                  variant="contained"
                  startIcon={<BarChartIcon />}
                  onClick={() => navigateTo('/analytics')}
                >
                  View Analytics
                </Button>
              </Grid>
            </Grid>
          </Box>
        )}
      </Paper>
    </Box>
  );
} 