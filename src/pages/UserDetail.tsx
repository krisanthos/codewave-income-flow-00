
import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface UserDetails {
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
  type: string;
  amount: number;
  created_at: string;
  status: string;
  description: string;
}

const UserDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<UserDetails | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
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

      await fetchUserDetails();
    };

    checkAdminAndFetchData();
  }, [id, navigate]);

  const fetchUserDetails = async () => {
    if (!id) return;

    try {
      // Fetch user data
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (userError) throw userError;
      
      setUser(userData);
      
      // Fetch user transactions
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', id)
        .order('created_at', { ascending: false });

      if (transactionsError) throw transactionsError;
      
      setTransactions(transactionsData || []);
    } catch (error: any) {
      console.error('Error fetching user details:', error);
      toast({
        title: 'Error',
        description: 'Failed to load user details: ' + error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateBalance = async (amount: number, operation: 'add' | 'deduct') => {
    if (!user || !id) return;

    try {
      const newBalance = operation === 'add' 
        ? Number(user.balance) + amount 
        : Number(user.balance) - amount;

      if (newBalance < 0) {
        toast({
          title: 'Error',
          description: 'Cannot deduct more than current balance',
          variant: 'destructive',
        });
        return;
      }

      // Update user balance
      const { error: balanceError } = await supabase
        .from('profiles')
        .update({ balance: newBalance })
        .eq('id', id);

      if (balanceError) throw balanceError;

      // Create transaction record
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: id,
          type: operation === 'add' ? 'admin_credit' : 'admin_debit',
          amount: amount,
          status: 'completed',
          description: `Admin ${operation === 'add' ? 'added' : 'deducted'} ₦${amount.toLocaleString()}`,
          currency: 'NGN'
        });

      if (transactionError) throw transactionError;

      // Refresh data
      await fetchUserDetails();

      toast({
        title: 'Success',
        description: `₦${amount.toLocaleString()} ${operation === 'add' ? 'added to' : 'deducted from'} user's account`,
      });
    } catch (error: any) {
      console.error('Error updating balance:', error);
      toast({
        title: 'Error',
        description: 'Failed to update balance: ' + error.message,
        variant: 'destructive',
      });
    }
  };

  const handleAddFunds = () => {
    const amount = window.prompt('Enter amount to add:');
    if (amount && !isNaN(Number(amount)) && Number(amount) > 0) {
      handleUpdateBalance(Number(amount), 'add');
    }
  };

  const handleDeductFunds = () => {
    const amount = window.prompt('Enter amount to deduct:');
    if (amount && !isNaN(Number(amount)) && Number(amount) > 0) {
      handleUpdateBalance(Number(amount), 'deduct');
    }
  };

  // Show loading state
  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-700">Loading user details...</h2>
          <p className="text-gray-500 mt-2">Please wait</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <Link to="/admin-dashboard" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6">
          <ArrowLeft className="mr-2" size={16} />
          Back to Dashboard
        </Link>
        
        <div className="flex flex-col md:flex-row gap-6">
          {/* User Profile Card */}
          <Card className="md:w-1/3">
            <CardHeader>
              <CardTitle>User Profile</CardTitle>
              <CardDescription>User ID: {id}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-500">Full Name</span>
                <span className="text-lg">{user.full_name || 'No name provided'}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-500">Email</span>
                <span className="text-lg">{user.email}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-500">Phone Number</span>
                <span className="text-lg">{user.phone || 'No phone provided'}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-500">Joined Date</span>
                <span className="text-lg">{new Date(user.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-500">Current Balance</span>
                <span className="text-lg font-bold">₦{Number(user.balance || 0).toLocaleString()}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-500">Total Earned</span>
                <span className="text-lg font-bold">₦{Number(user.total_earned || 0).toLocaleString()}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-500">Registration Fee</span>
                <span className={`text-lg font-medium ${user.registration_fee_paid ? 'text-green-600' : 'text-red-600'}`}>
                  {user.registration_fee_paid ? 'Paid' : 'Unpaid'}
                </span>
              </div>
            </CardContent>
          </Card>
          
          {/* Transaction History and Actions */}
          <div className="flex-1">
            <Tabs defaultValue="transactions">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="transactions">Transactions</TabsTrigger>
                <TabsTrigger value="actions">Actions</TabsTrigger>
              </TabsList>
              
              <TabsContent value="transactions" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Transaction History</CardTitle>
                    <CardDescription>All financial activities for this user</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {transactions.length > 0 ? (
                      <div className="rounded-md border">
                        <div className="grid grid-cols-4 border-b bg-gray-50 p-3 font-medium">
                          <div>Type</div>
                          <div>Amount</div>
                          <div>Date</div>
                          <div>Status</div>
                        </div>
                        <div className="divide-y">
                          {transactions.map((transaction) => (
                            <div key={transaction.id} className="grid grid-cols-4 p-3">
                              <div>
                                {transaction.type.replace('_', ' ').toUpperCase()}
                              </div>
                              <div className={`${
                                transaction.type === 'withdraw' || transaction.type === 'admin_debit' 
                                  ? 'text-red-600' 
                                  : 'text-green-600'
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
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="py-8 text-center text-gray-500">
                        No transactions found for this user
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="actions" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>User Management</CardTitle>
                    <CardDescription>Administrative actions for this user</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <h4 className="font-medium">Balance Adjustment</h4>
                      <div className="flex space-x-2">
                        <Button variant="outline" onClick={handleAddFunds}>Add Funds</Button>
                        <Button variant="outline" onClick={handleDeductFunds}>Deduct Funds</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetail;
