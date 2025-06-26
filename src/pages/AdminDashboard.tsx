
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, DollarSign, TrendingUp, AlertCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface User {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  created_at: string;
  balance: number;
  total_earned: number;
  registration_fee_paid: boolean;
}

interface Transaction {
  id: string;
  user_id: string;
  type: string;
  amount: number;
  created_at: string;
  status: string;
  user_name: string;
}

interface Withdrawal {
  id: string;
  user_id: string;
  amount: number;
  status: string;
  created_at: string;
  user_name: string;
  bank_details: any;
}

const AdminDashboard = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBalance: 0,
    totalEarnings: 0,
    pendingWithdrawals: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdminAndFetchData = async () => {
      // Check admin access
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/admin-auth');
        return;
      }

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
        navigate('/admin-auth');
        return;
      }

      await fetchDashboardData();
    };

    checkAdminAndFetchData();
  }, [navigate]);

  const fetchDashboardData = async () => {
    try {
      // Fetch users
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (usersError) throw usersError;
      setUsers(usersData || []);

      // Fetch recent transactions
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (transactionsError) throw transactionsError;

      // Fetch user profiles to get names for transactions
      const userIds = [...new Set(transactionsData?.map(t => t.user_id) || [])];
      const { data: userProfiles } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', userIds);

      // Create a map of user_id to full_name
      const userNameMap = (userProfiles || []).reduce((acc, user) => {
        acc[user.id] = user.full_name || 'Unknown User';
        return acc;
      }, {} as Record<string, string>);

      const formattedTransactions = (transactionsData || []).map(transaction => ({
        id: transaction.id,
        user_id: transaction.user_id,
        type: transaction.type,
        amount: transaction.amount,
        created_at: transaction.created_at,
        status: transaction.status,
        user_name: userNameMap[transaction.user_id] || 'Unknown User'
      }));
      
      setTransactions(formattedTransactions);

      // Fetch pending withdrawals
      const { data: withdrawalsData, error: withdrawalsError } = await supabase
        .from('withdrawals')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (withdrawalsError) throw withdrawalsError;

      // Fetch bank account details for withdrawals
      const bankAccountIds = [...new Set(withdrawalsData?.map(w => w.bank_account_id) || [])];
      const { data: bankAccounts } = await supabase
        .from('bank_accounts')
        .select('*')
        .in('id', bankAccountIds);

      // Create a map of bank_account_id to bank details
      const bankAccountMap = (bankAccounts || []).reduce((acc, account) => {
        acc[account.id] = {
          bank_name: account.bank_name,
          account_number: account.account_number,
          account_name: account.account_name
        };
        return acc;
      }, {} as Record<string, any>);

      // Get user names for withdrawals
      const withdrawalUserIds = [...new Set(withdrawalsData?.map(w => w.user_id) || [])];
      const { data: withdrawalUserProfiles } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', withdrawalUserIds);

      const withdrawalUserNameMap = (withdrawalUserProfiles || []).reduce((acc, user) => {
        acc[user.id] = user.full_name || 'Unknown User';
        return acc;
      }, {} as Record<string, string>);

      const formattedWithdrawals = (withdrawalsData || []).map(withdrawal => ({
        id: withdrawal.id,
        user_id: withdrawal.user_id,
        amount: withdrawal.amount,
        status: withdrawal.status,
        created_at: withdrawal.created_at,
        user_name: withdrawalUserNameMap[withdrawal.user_id] || 'Unknown User',
        bank_details: bankAccountMap[withdrawal.bank_account_id] || {}
      }));
      
      setWithdrawals(formattedWithdrawals);

      // Calculate stats
      const totalUsers = usersData?.length || 0;
      const totalBalance = usersData?.reduce((sum, user) => sum + (Number(user.balance) || 0), 0) || 0;
      const totalEarnings = usersData?.reduce((sum, user) => sum + (Number(user.total_earned) || 0), 0) || 0;
      const pendingWithdrawals = formattedWithdrawals.length;

      setStats({
        totalUsers,
        totalBalance,
        totalEarnings,
        pendingWithdrawals
      });

    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load dashboard data: ' + error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveWithdrawal = async (withdrawalId: string) => {
    try {
      const { error } = await supabase
        .from('withdrawals')
        .update({ status: 'approved' })
        .eq('id', withdrawalId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Withdrawal approved successfully',
      });

      // Refresh data
      await fetchDashboardData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to approve withdrawal: ' + error.message,
        variant: 'destructive',
      });
    }
  };

  const handleRejectWithdrawal = async (withdrawalId: string) => {
    try {
      const { error } = await supabase
        .from('withdrawals')
        .update({ status: 'rejected' })
        .eq('id', withdrawalId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Withdrawal rejected successfully',
      });

      // Refresh data
      await fetchDashboardData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to reject withdrawal: ' + error.message,
        variant: 'destructive',
      });
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin-auth');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-700">Loading admin dashboard...</h2>
          <p className="text-gray-500 mt-2">Please wait</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-xl font-semibold text-gray-900">Admin Dashboard</h1>
            <Button onClick={handleLogout} variant="outline">
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₦{stats.totalBalance.toLocaleString()}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₦{stats.totalEarnings.toLocaleString()}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Withdrawals</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingWithdrawals}</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="users" className="space-y-4">
          <TabsList>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
          </TabsList>
          
          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>All Users</CardTitle>
                <CardDescription>
                  Manage user accounts and view their details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <div className="grid grid-cols-6 border-b bg-gray-50 p-3 font-medium">
                    <div>Name</div>
                    <div>Email</div>
                    <div>Phone</div>
                    <div>Balance</div>
                    <div>Status</div>
                    <div>Actions</div>
                  </div>
                  <div className="divide-y">
                    {users.map((user) => (
                      <div key={user.id} className="grid grid-cols-6 p-3">
                        <div>{user.full_name || 'No name'}</div>
                        <div>{user.email}</div>
                        <div>{user.phone || 'No phone'}</div>
                        <div>₦{Number(user.balance || 0).toLocaleString()}</div>
                        <div>
                          <Badge variant={user.registration_fee_paid ? "default" : "destructive"}>
                            {user.registration_fee_paid ? 'Active' : 'Pending'}
                          </Badge>
                        </div>
                        <div>
                          <Link to={`/admin/users/${user.id}`}>
                            <Button variant="outline" size="sm">
                              View Details
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="transactions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>
                  Latest financial activities across all users
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <div className="grid grid-cols-5 border-b bg-gray-50 p-3 font-medium">
                    <div>User</div>
                    <div>Type</div>
                    <div>Amount</div>
                    <div>Status</div>
                    <div>Date</div>
                  </div>
                  <div className="divide-y">
                    {transactions.map((transaction) => (
                      <div key={transaction.id} className="grid grid-cols-5 p-3">
                        <div>{transaction.user_name}</div>
                        <div className="capitalize">{transaction.type.replace('_', ' ')}</div>
                        <div className={`${
                          transaction.type.includes('withdraw') || transaction.type.includes('debit')
                            ? 'text-red-600' 
                            : 'text-green-600'
                        }`}>
                          ₦{Number(transaction.amount).toLocaleString()}
                        </div>
                        <div>
                          <Badge variant={transaction.status === 'completed' ? "default" : "secondary"}>
                            {transaction.status}
                          </Badge>
                        </div>
                        <div>{new Date(transaction.created_at).toLocaleDateString()}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="withdrawals" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Pending Withdrawals</CardTitle>
                <CardDescription>
                  Review and approve withdrawal requests
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {withdrawals.map((withdrawal) => (
                    <div key={withdrawal.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{withdrawal.user_name}</h3>
                          <p className="text-sm text-gray-600">
                            Amount: ₦{Number(withdrawal.amount).toLocaleString()}
                          </p>
                          <p className="text-sm text-gray-600">
                            Bank: {withdrawal.bank_details?.bank_name} - {withdrawal.bank_details?.account_number}
                          </p>
                          <p className="text-sm text-gray-600">
                            Account Name: {withdrawal.bank_details?.account_name}
                          </p>
                          <p className="text-sm text-gray-500">
                            Requested: {new Date(withdrawal.created_at).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            onClick={() => handleApproveWithdrawal(withdrawal.id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            Approve
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => handleRejectWithdrawal(withdrawal.id)}
                          >
                            Reject
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {withdrawals.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No pending withdrawals
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
