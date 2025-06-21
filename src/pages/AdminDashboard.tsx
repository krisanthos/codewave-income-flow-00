
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Menu, X, BarChart, Users, LogOut, Search } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface User {
  id: string;
  full_name: string;
  email: string;
  balance: number;
  created_at: string;
  phone: string;
}

interface Transaction {
  id: string;
  user_id: string;
  type: string;
  amount: number;
  created_at: string;
  status: string;
  profiles?: {
    full_name: string;
  };
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
    const checkAdminAccess = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/admin-auth');
        return;
      }

      // Verify admin access
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      if (!profile || profile.email !== 'admin@codewave.com') {
        toast({
          title: "Access Denied",
          description: "Admin privileges required",
          variant: "destructive",
        });
        await supabase.auth.signOut();
        navigate('/admin-auth');
        return;
      }

      fetchAdminData();
    };

    checkAdminAccess();
  }, [navigate]);

  const fetchAdminData = async () => {
    try {
      // Fetch users
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('id, full_name, email, balance, created_at, phone')
        .order('created_at', { ascending: false });

      if (usersError) throw usersError;
      
      setUsers(usersData || []);
      
      // Fetch transactions with user info
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('transactions')
        .select(`
          id,
          user_id,
          type,
          amount,
          created_at,
          status,
          profiles!inner(full_name)
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (transactionsError) throw transactionsError;
      
      setTransactions(transactionsData || []);
      
      // Calculate stats
      const totalUsers = usersData?.length || 0;
      const totalTransactions = transactionsData?.length || 0;
      const totalBalance = usersData?.reduce((sum, user) => sum + (Number(user.balance) || 0), 0) || 0;
      
      // Simple calculation for average daily earnings
      const avgDailyEarnings = Math.round(totalBalance * 0.05);
      
      setStats({
        totalUsers,
        totalTransactions,
        totalBalance,
        avgDailyEarnings,
      });
    } catch (error: any) {
      console.error("Error fetching admin data:", error);
      toast({
        title: "Error",
        description: "Failed to load admin dashboard data: " + error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin-auth');
  };
  
  // Filter users based on search term
  const filteredUsers = users.filter(user => 
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
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
              <span className="text-xl font-bold">CodeWave Admin</span>
            </div>
            <div className="hidden md:ml-6 md:flex md:items-center md:space-x-4">
              <span className="px-3 py-2 rounded-md text-sm font-medium">
                System Administration
              </span>
              <Button variant="ghost" onClick={handleLogout} className="text-white hover:bg-gray-700">
                <LogOut className="mr-2" size={16} />
                Logout
              </Button>
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
          <div className="md:hidden bg-gray-800 shadow-lg">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <div className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-gray-700">
                Dashboard
              </div>
              <button onClick={handleLogout} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-white hover:bg-gray-700">
                Logout
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Main content */}
      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-semibold text-gray-900 mb-6">Admin Dashboard</h1>
          
          {/* Overview stats */}
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
                <CardTitle className="text-sm font-medium text-gray-500">Platform Health</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">Active</div>
              </CardContent>
            </Card>
          </div>

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
                  <CardContent className="overflow-auto">
                    {filteredUsers.length > 0 ? (
                      <div className="rounded-md border">
                        <div className="hidden md:grid md:grid-cols-5 border-b bg-gray-50 p-3 font-medium">
                          <div>Name</div>
                          <div>Email</div>
                          <div>Phone</div>
                          <div className="text-right">Balance</div>
                          <div className="text-right">Actions</div>
                        </div>
                        <div className="divide-y">
                          {filteredUsers.map((user) => (
                            <div key={user.id} className="p-3">
                              {/* Mobile view (card style) */}
                              <div className="md:hidden space-y-2">
                                <div className="flex justify-between">
                                  <span className="font-medium">{user.full_name || 'No name'}</span>
                                  <span className="text-green-600 font-medium">₦{Number(user.balance || 0).toLocaleString()}</span>
                                </div>
                                <div className="text-gray-500 text-sm">{user.email}</div>
                                <div className="text-gray-500 text-sm">{user.phone || 'No phone'}</div>
                                <Link to={`/admin-user/${user.id}`}>
                                  <Button size="sm" className="w-full mt-2">View Details</Button>
                                </Link>
                              </div>
                              
                              {/* Desktop view (table style) */}
                              <div className="hidden md:grid md:grid-cols-5 items-center">
                                <div className="font-medium">{user.full_name || 'No name'}</div>
                                <div className="text-gray-500">{user.email}</div>
                                <div className="text-gray-500">{user.phone || 'No phone'}</div>
                                <div className="text-right">₦{Number(user.balance || 0).toLocaleString()}</div>
                                <div className="text-right">
                                  <Link to={`/admin-user/${user.id}`}>
                                    <Button size="sm">View Details</Button>
                                  </Link>
                                </div>
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
                  <CardContent className="overflow-auto">
                    {transactions.length > 0 ? (
                      <div className="rounded-md border">
                        <div className="hidden md:grid md:grid-cols-5 border-b bg-gray-50 p-3 font-medium">
                          <div>User</div>
                          <div>Type</div>
                          <div>Amount</div>
                          <div>Date</div>
                          <div>Status</div>
                        </div>
                        <div className="divide-y">
                          {transactions.map((transaction) => (
                            <div key={transaction.id} className="p-3">
                              {/* Mobile view (card style) */}
                              <div className="md:hidden space-y-2">
                                <div className="flex justify-between">
                                  <span className="font-medium">{transaction.profiles?.full_name || 'Unknown User'}</span>
                                  <span className={`${
                                    transaction.type === 'withdraw' ? 'text-red-600' : 'text-green-600'
                                  } font-medium`}>
                                    ₦{Number(transaction.amount || 0).toLocaleString()}
                                  </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span>{transaction.type.replace('_', ' ').toUpperCase()}</span>
                                  <span>{new Date(transaction.created_at).toLocaleDateString()}</span>
                                </div>
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
                              
                              {/* Desktop view (table style) */}
                              <div className="hidden md:grid md:grid-cols-5 items-center">
                                <div className="font-medium">{transaction.profiles?.full_name || 'Unknown User'}</div>
                                <div>{transaction.type.replace('_', ' ').toUpperCase()}</div>
                                <div className={`${
                                  transaction.type === 'withdraw' ? 'text-red-600' : 'text-green-600'
                                }`}>
                                  ₦{Number(transaction.amount || 0).toLocaleString()}
                                </div>
                                <div>{new Date(transaction.created_at).toLocaleDateString()}</div>
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
  );
};

export default AdminDashboard;
