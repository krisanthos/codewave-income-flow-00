
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Menu, X, BarChart, Users, LogOut, Search } from 'lucide-react';

const AdminDashboard = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  
  // Mock data - in a real app this would come from an API
  const stats = {
    totalUsers: 156,
    totalTransactions: 2489,
    totalBalance: 5628000, // in Naira
    avgDailyEarnings: 85000,
  };
  
  // Mock users data
  const users = [
    { id: 1, username: 'john_doe', fullName: 'John Doe', email: 'john@example.com', balance: 25000, joined: '2023-01-15' },
    { id: 2, username: 'jane_smith', fullName: 'Jane Smith', email: 'jane@example.com', balance: 42000, joined: '2023-02-20' },
    { id: 3, username: 'michael_b', fullName: 'Michael Brown', email: 'michael@example.com', balance: 18500, joined: '2023-03-05' },
    { id: 4, username: 'sarah_j', fullName: 'Sarah Johnson', email: 'sarah@example.com', balance: 63000, joined: '2023-01-28' },
    { id: 5, username: 'david_w', fullName: 'David Wilson', email: 'david@example.com', balance: 9500, joined: '2023-04-10' },
  ];
  
  // Mock transactions data
  const transactions = [
    { id: 1, userId: 1, username: 'john_doe', type: 'deposit', amount: 10000, date: '2023-05-01', status: 'completed' },
    { id: 2, userId: 2, username: 'jane_smith', type: 'withdraw', amount: 25000, date: '2023-05-02', status: 'pending' },
    { id: 3, userId: 3, username: 'michael_b', type: 'task_reward', amount: 1500, date: '2023-05-03', status: 'completed' },
    { id: 4, userId: 4, username: 'sarah_j', type: 'daily_bonus', amount: 3150, date: '2023-05-04', status: 'completed' },
    { id: 5, userId: 5, username: 'david_w', type: 'deposit', amount: 5000, date: '2023-05-05', status: 'completed' },
    { id: 6, userId: 1, username: 'john_doe', type: 'daily_bonus', amount: 1250, date: '2023-05-05', status: 'completed' },
    { id: 7, userId: 2, username: 'jane_smith', type: 'task_reward', amount: 2000, date: '2023-05-06', status: 'completed' },
  ];
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  
  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/');
  };
  
  // Filter users based on search term
  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* Navigation */}
      <nav className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="text-xl font-bold">Admin Panel</span>
            </div>
            <div className="hidden md:ml-6 md:flex md:items-center md:space-x-4">
              <span className="px-3 py-2 rounded-md text-sm font-medium">
                System Administration
              </span>
            </div>
            <div className="flex items-center md:hidden">
              <button
                onClick={toggleMenu}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <button onClick={handleLogout} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-white hover:bg-gray-700">
                Logout
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Admin Dashboard Content */}
      <div className="flex flex-col md:flex-row flex-grow">
        {/* Sidebar (desktop only) */}
        <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 md:pt-16">
          <div className="flex-1 flex flex-col min-h-0 bg-gray-900">
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
              <div className="flex-1 px-3 space-y-1">
                <Link to="/admin-dashboard" className="bg-gray-800 text-white group flex items-center px-3 py-2 text-sm font-medium rounded-md">
                  <BarChart className="mr-3" size={20} />
                  Dashboard
                </Link>
                <Link to="/admin-users" className="text-gray-300 hover:bg-gray-800 hover:text-white group flex items-center px-3 py-2 text-sm font-medium rounded-md">
                  <Users className="mr-3" size={20} />
                  Users
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-gray-300 hover:bg-gray-800 hover:text-white group flex items-center px-3 py-2 text-sm font-medium rounded-md mt-6"
                >
                  <LogOut className="mr-3" size={20} />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <main className="flex-1 md:ml-64 px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl font-semibold text-gray-900">Admin Dashboard</h1>
            
            {/* Overview stats */}
            <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">Total Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalUsers}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">Total Transactions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalTransactions}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">Total Balance (All Users)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">₦{stats.totalBalance.toLocaleString()}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">Avg. Daily Earnings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">₦{stats.avgDailyEarnings.toLocaleString()}</div>
                </CardContent>
              </Card>
            </div>

            {/* Growth graph (placeholder) */}
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>Platform Growth</CardTitle>
                <CardDescription>User acquisition and revenue trends</CardDescription>
              </CardHeader>
              <CardContent className="h-80 flex items-center justify-center bg-gray-50">
                <div className="text-center text-gray-500">
                  <p>Interactive growth chart would be displayed here</p>
                  <p className="text-sm">(Using recharts library with actual data)</p>
                </div>
              </CardContent>
            </Card>

            {/* Tabs for users and transactions */}
            <div className="mt-8">
              <Tabs defaultValue="users" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="users">Users</TabsTrigger>
                  <TabsTrigger value="transactions">Recent Transactions</TabsTrigger>
                </TabsList>
                
                <TabsContent value="users" className="mt-6">
                  <Card>
                    <CardHeader className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                      <div>
                        <CardTitle>All Users</CardTitle>
                        <CardDescription>
                          Manage and view user details
                        </CardDescription>
                      </div>
                      <div className="relative w-full sm:w-64">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                        <Input
                          placeholder="Search users..."
                          className="pl-8"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="rounded-md border">
                        <div className="grid grid-cols-5 border-b bg-gray-50 p-3 font-medium">
                          <div>Username</div>
                          <div>Full Name</div>
                          <div>Email</div>
                          <div className="text-right">Balance</div>
                          <div className="text-right">Actions</div>
                        </div>
                        <div className="divide-y">
                          {filteredUsers.map((user) => (
                            <div key={user.id} className="grid grid-cols-5 p-3">
                              <div className="font-medium">{user.username}</div>
                              <div>{user.fullName}</div>
                              <div className="text-gray-500">{user.email}</div>
                              <div className="text-right">₦{user.balance.toLocaleString()}</div>
                              <div className="text-right">
                                <Link to={`/admin-user/${user.id}`}>
                                  <Button size="sm">View Details</Button>
                                </Link>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="transactions" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Transactions</CardTitle>
                      <CardDescription>
                        All financial activities across the platform
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="rounded-md border">
                        <div className="grid grid-cols-5 border-b bg-gray-50 p-3 font-medium">
                          <div>User</div>
                          <div>Type</div>
                          <div>Amount</div>
                          <div>Date</div>
                          <div>Status</div>
                        </div>
                        <div className="divide-y">
                          {transactions.map((transaction) => (
                            <div key={transaction.id} className="grid grid-cols-5 p-3">
                              <div className="font-medium">{transaction.username}</div>
                              <div>
                                {transaction.type === 'deposit' && 'Deposit'}
                                {transaction.type === 'withdraw' && 'Withdrawal'}
                                {transaction.type === 'daily_bonus' && 'Daily Bonus'}
                                {transaction.type === 'task_reward' && 'Task Reward'}
                              </div>
                              <div className={`${
                                transaction.type === 'withdraw' ? 'text-red-600' : 'text-green-600'
                              }`}>
                                ₦{transaction.amount.toLocaleString()}
                              </div>
                              <div>{transaction.date}</div>
                              <div>
                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                  transaction.status === 'completed' 
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {transaction.status}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
