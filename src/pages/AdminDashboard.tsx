import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Menu, X, BarChart, Users, LogOut, Search } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface User {
  id: string;
  username: string;
  fullName: string;
  email: string;
  balance: number;
  joined: string;
}

interface Transaction {
  id: string;
  userId: string;
  username: string;
  type: string;
  amount: number;
  date: string;
  status: string;
}

interface Stats {
  totalUsers: number;
  totalTransactions: number;
  totalBalance: number;
  avgDailyEarnings: number;
}

const AdminDashboard = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalTransactions: 0,
    totalBalance: 0,
    avgDailyEarnings: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin-auth');
      return;
    }

    const fetchAdminData = async () => {
      try {
        // Fetch users
        const usersResponse = await fetch('/api/admin/users', {
          headers: {
            'x-auth-token': token,
          },
        });

        if (!usersResponse.ok) {
          throw new Error('Failed to fetch users');
        }

        const usersData = await usersResponse.json();
        
        // Format users data
        const formattedUsers = usersData.map((user: any) => ({
          id: user._id,
          username: user.username,
          fullName: user.fullName,
          email: user.email,
          balance: user.balance,
          joined: new Date(user.registrationDate).toLocaleDateString(),
        }));
        
        setUsers(formattedUsers);
        
        // Fetch transactions
        const transactionsResponse = await fetch('/api/admin/transactions', {
          headers: {
            'x-auth-token': token,
          },
        });

        if (!transactionsResponse.ok) {
          throw new Error('Failed to fetch transactions');
        }

        const transactionsData = await transactionsResponse.json();
        
        // Format transactions data
        const formattedTransactions = transactionsData.map((transaction: any) => ({
          id: transaction._id,
          userId: transaction.user,
          username: transaction.username || 'Unknown', // Backend should populate this
          type: transaction.type,
          amount: transaction.amount,
          date: new Date(transaction.createdAt).toLocaleDateString(),
          status: transaction.status,
        }));
        
        setTransactions(formattedTransactions);
        
        // Calculate stats
        const totalUsers = formattedUsers.length;
        const totalTransactions = formattedTransactions.length;
        const totalBalance = formattedUsers.reduce((sum, user) => sum + user.balance, 0);
        
        // Simplified calculation for average daily earnings (5% of total balance)
        const avgDailyEarnings = Math.round(totalBalance * 0.05);
        
        setStats({
          totalUsers,
          totalTransactions,
          totalBalance,
          avgDailyEarnings,
        });
      } catch (error) {
        console.error("Error fetching admin data:", error);
        toast({
          title: "Error",
          description: "Failed to load admin dashboard data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdminData();
  }, [navigate]);
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  
  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin-auth');
  };
  
  // Filter users based on search term
  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-700">Loading admin dashboard...</h2>
          <p className="text-gray-500 mt-2">Please wait while we fetch the data</p>
        </div>
      </div>
    );
  }
  
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
                  className="text-gray-300 hover:bg-gray-800 hover:text-white group flex items-center px-3 py-2 text-sm font-medium rounded-md mt-6 w-full text-left"
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
                      {filteredUsers.length > 0 ? (
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
                      ) : (
                        <div className="py-8 text-center text-gray-500">
                          {searchTerm ? "No users match your search" : "No users registered yet"}
                        </div>
                      )}
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
                      {transactions.length > 0 ? (
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
                      ) : (
                        <div className="py-8 text-center text-gray-500">
                          No transactions recorded yet
                        </div>
                      )}
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
