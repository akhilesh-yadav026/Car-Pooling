import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  FiUsers, FiUserCheck, FiTruck, FiPieChart,
  FiLogOut, FiLogIn, FiUserX, FiUser,
  FiCheckCircle, FiXCircle, FiClock,
  FiDollarSign, FiTrendingUp
} from 'react-icons/fi';

const API_URL = 'http://localhost:3000/api/admin';

const AdminPanel = () => {
  const [token, setToken] = useState(localStorage.getItem('adminToken'));
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCaptains: 0,
    totalRides: 0,
    activeRides: 0,
    totalRevenue: 0,
    companyProfit: 0
  });
  const [users, setUsers] = useState([]);
  const [captains, setCaptains] = useState([]);
  const [rides, setRides] = useState([]);

  // API client with auth header
  const api = axios.create({
    baseURL: API_URL,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  // Login Handler
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(`${API_URL}/login`, {
        email: e.target.email.value,
        password: e.target.password.value
      });
      localStorage.setItem('adminToken', res.data.token);
      setToken(res.data.token);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  // Calculate revenue and profit from rides data
  const calculateFinancials = (ridesData) => {
    if (!ridesData || !Array.isArray(ridesData)) return { totalRevenue: 0, companyProfit: 0 };

    const totalRevenue = ridesData.reduce((sum, ride) => sum + (ride.fare || 0), 0);
    const companyProfit = totalRevenue * 0.2;
    return { totalRevenue, companyProfit };
  };

  // Enhanced fetch function with error handling
  const fetchData = async (endpoint) => {
    try {
      const response = await api.get(endpoint);
      return response.data;
    } catch (error) {
      console.error(`Error fetching ${endpoint}:`, error);
      setError(`Failed to fetch ${endpoint}`);
      return null;
    }
  };

  // Fetch data based on active tab
  useEffect(() => {
    if (!token) return;

    const loadData = async () => {
      setLoading(true);
      setError('');

      try {
        switch (activeTab) {
          case 'dashboard': {
            const [statsData, ridesData] = await Promise.all([
              fetchData('/dashboard'),
              fetchData('/rides')
            ]);

            if (statsData) {
              setStats(prev => ({
                ...prev,
                totalUsers: statsData.totalUsers || 0,
                totalCaptains: statsData.totalCaptains || 0,
                totalRides: statsData.totalRides || 0,
                activeRides: statsData.activeRides || 0
              }));
            }

            if (ridesData) {
              const { totalRevenue, companyProfit } = calculateFinancials(ridesData);
              setStats(prev => ({
                ...prev,
                totalRevenue,
                companyProfit
              }));
              setRides(ridesData);
            }
            break;
          }

          case 'users': {
            const usersData = await fetchData('/users');
            if (usersData) setUsers(usersData);
            break;
          }

          case 'captains': {
            const captainsData = await fetchData('/captains');
            if (captainsData) setCaptains(captainsData);
            break;
          }

          case 'rides': {
            const ridesData = await fetchData('/rides');
            if (ridesData) {
              setRides(ridesData);
              const { totalRevenue, companyProfit } = calculateFinancials(ridesData);
              setStats(prev => ({
                ...prev,
                totalRevenue,
                companyProfit
              }));
            }
            break;
          }

          default:
            break;
        }
      } catch (err) {
        setError(err.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [token, activeTab]);

  // Block/unblock user
  const toggleUserBlock = async (userId) => {
    try {
      await api.put(`/users/${userId}/toggle-block`);
      setUsers(users.map(u =>
        u._id === userId ? { ...u, isBlocked: !u.isBlocked } : u
      ));
    } catch (err) {
      setError('Failed to update user');
    }
  };

  // Block/unblock captain
  const toggleCaptainBlock = async (captainId) => {
    try {
      await api.put(`/captains/${captainId}/toggle-block`);
      setCaptains(captains.map(c =>
        c._id === captainId ? { ...c, isBlocked: !c.isBlocked } : c
      ));
    } catch (err) {
      setError('Failed to update captain');
    }
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setToken(null);
    setActiveTab('dashboard');
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Admin Login
          </h2>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            {error && (
              <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <FiXCircle className="h-5 w-5 text-red-500" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <form className="space-y-6" onSubmit={handleLogin}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="mt-1">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <FiLogIn className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                      Logging in...
                    </>
                  ) : (
                    <>
                      <FiLogIn className="-ml-1 mr-3 h-5 w-5 text-white" />
                      Sign in
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold text-gray-900 flex items-center">
            <FiTruck className="mr-2 text-blue-600" />
            CarPooling Admin
          </h1>
          <button
            onClick={handleLogout}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <FiLogOut className="mr-2" />
            Logout
          </button>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${activeTab === 'dashboard' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >
              <FiPieChart className="mr-2" />
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${activeTab === 'users' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >
              <FiUsers className="mr-2" />
              Users
            </button>
            <button
              onClick={() => setActiveTab('captains')}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${activeTab === 'captains' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >
              <FiUserCheck className="mr-2" />
              Captains
            </button>
            <button
              onClick={() => setActiveTab('rides')}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${activeTab === 'rides' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >
              <FiTruck className="mr-2" />
              Rides
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <FiXCircle className="h-5 w-5 text-red-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <div>
                <h2 className="text-lg leading-6 font-medium text-gray-900 mb-6">Dashboard Overview</h2>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                          <FiUsers className="h-6 w-6 text-white" />
                        </div>
                        <div className="ml-5 w-0 flex-1">
                          <dt className="text-sm font-medium text-gray-500 truncate">Total Users</dt>
                          <dd className="flex items-baseline">
                            <div className="text-2xl font-semibold text-gray-900">
                              {stats.totalUsers || 0}
                            </div>
                          </dd>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                          <FiUserCheck className="h-6 w-6 text-white" />
                        </div>
                        <div className="ml-5 w-0 flex-1">
                          <dt className="text-sm font-medium text-gray-500 truncate">Total Captains</dt>
                          <dd className="flex items-baseline">
                            <div className="text-2xl font-semibold text-gray-900">
                              {stats.totalCaptains || 0}
                            </div>
                          </dd>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
                          <FiTruck className="h-6 w-6 text-white" />
                        </div>
                        <div className="ml-5 w-0 flex-1">
                          <dt className="text-sm font-medium text-gray-500 truncate">Total Rides</dt>
                          <dd className="flex items-baseline">
                            <div className="text-2xl font-semibold text-gray-900">
                              {stats.totalRides || 0}
                            </div>
                          </dd>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                          <FiClock className="h-6 w-6 text-white" />
                        </div>
                        <div className="ml-5 w-0 flex-1">
                          <dt className="text-sm font-medium text-gray-500 truncate">Active Rides</dt>
                          <dd className="flex items-baseline">
                            <div className="text-2xl font-semibold text-gray-900">
                              {stats.activeRides || 0}
                            </div>
                          </dd>
                        </div>
                      </div>
                    </div>
                  </div> */}
                </div>

                {/* Financial Summary Section */}
                <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-lg">
                  <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Financial Summary
                    </h3>
                  </div>
                  <div className="px-4 py-5 sm:p-6">
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                      <div className="bg-gray-50 p-4 rounded-md">
                        <h4 className="text-sm font-medium text-gray-500">Total Revenue</h4>
                        <p className="mt-1 text-2xl font-semibold text-gray-900">
                          ₹{stats.totalRevenue.toLocaleString()}
                        </p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-md">
                        <h4 className="text-sm font-medium text-gray-500">Company Profit (20%)</h4>
                        <p className="mt-1 text-2xl font-semibold text-gray-900">
                          ₹{stats.companyProfit.toLocaleString()}
                        </p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-md">
                        <h4 className="text-sm font-medium text-gray-500">Captains Earnings (80%)</h4>
                        <p className="mt-1 text-2xl font-semibold text-gray-900">
                          ₹{(stats.totalRevenue - stats.companyProfit).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg leading-6 font-medium text-gray-900">User Management</h2>
                  <span className="text-sm text-gray-500">{users.length} users found</span>
                </div>
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                  <div className="overflow-x-auto" style={{ maxHeight: 'calc(100vh - 300px)', overflowY: 'auto' }}>
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            User
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Email
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {users.map((user) => (
                          <tr key={user._id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                  <FiUser className="h-5 w-5 text-gray-600" />
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">
                                    {user?.fullname ? `${user?.fullname.firstname} ${user?.fullname.lastname}` : 'Unknown'}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {user?.email}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.isBlocked ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                                {user.isBlocked ? 'Blocked' : 'Active'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button
                                onClick={() => toggleUserBlock(user._id)}
                                className={`inline-flex items-center px-3 py-1 border rounded-md text-sm font-medium ${user.isBlocked ? 'border-green-300 text-green-700 bg-green-50 hover:bg-green-100' : 'border-red-300 text-red-700 bg-red-50 hover:bg-red-100'}`}
                              >
                                {user.isBlocked ? (
                                  <>
                                    <FiCheckCircle className="mr-1" />
                                    Unblock
                                  </>
                                ) : (
                                  <>
                                    <FiUserX className="mr-1" />
                                    Block
                                  </>
                                )}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'captains' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg leading-6 font-medium text-gray-900">Captain Management</h2>
                  <span className="text-sm text-gray-500">{captains.length} captains found</span>
                </div>
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                  <div className="overflow-x-auto" style={{ maxHeight: 'calc(100vh - 300px)', overflowY: 'auto' }}>
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Captain
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Email
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Vehicle
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {captains.map((captain) => (
                          <tr key={captain._id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                  <FiUser className="h-5 w-5 text-gray-600" />
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">
                                    {captain?.fullname ? `${captain?.fullname.firstname} ${captain?.fullname.lastname}` : 'Unknown'}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {captain?.email}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {captain.vehicle?.type} ({captain.vehicle?.number})
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${captain.isBlocked ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                                {captain.isBlocked ? 'Blocked' : 'Active'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button
                                onClick={() => toggleCaptainBlock(captain._id)}
                                className={`inline-flex items-center px-3 py-1 border rounded-md text-sm font-medium ${captain.isBlocked ? 'border-green-300 text-green-700 bg-green-50 hover:bg-green-100' : 'border-red-300 text-red-700 bg-red-50 hover:bg-red-100'}`}
                              >
                                {captain.isBlocked ? (
                                  <>
                                    <FiCheckCircle className="mr-1" />
                                    Unblock
                                  </>
                                ) : (
                                  <>
                                    <FiUserX className="mr-1" />
                                    Block
                                  </>
                                )}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'rides' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg leading-6 font-medium text-gray-900">Ride History</h2>
                  <span className="text-sm text-gray-500">{rides.length} rides found</span>
                </div>
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                  <div className="overflow-x-auto" style={{ maxHeight: 'calc(100vh - 300px)', overflowY: 'auto' }}>
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            User
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Captain
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            From
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            To
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Fare
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {rides.map((ride) => (
                          <tr key={ride._id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {ride.user?.fullname ? `${ride.user?.fullname.firstname} ${ride.user?.fullname.lastname}` : 'Unknown'}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {ride.captain?.fullname ? `${ride.captain?.fullname.firstname} ${ride.captain?.fullname.lastname}` : 'Unknown'}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {ride.pickup || 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {ride.destination || 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              ₹{ride.fare}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${ride.status === 'completed' ? 'bg-green-100 text-green-800' :
                                  ride.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                    'bg-yellow-100 text-yellow-800'
                                }`}>
                                {ride.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default AdminPanel;