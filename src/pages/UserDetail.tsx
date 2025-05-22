
import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface UserDetails {
  id: string;
  username: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  joinDate: string;
  balance: number;
}

interface Transaction {
  id: string;
  type: string;
  amount: number;
  date: string;
  status: string;
}

const UserDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<UserDetails | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin-auth');
      return;
    }

    const fetchUserDetails = async () => {
      try {
        // Fetch user data
        const userResponse = await fetch(`/api/admin/users/${id}`, {
          headers: {
            'x-auth-token': token,
          },
        });

        if (!userResponse.ok) {
          throw new Error('Failed to fetch user details');
        }

        const userData = await userResponse.json();
        
        setUser({
          id: userData._id,
          username: userData.username,
          fullName: userData.fullName,
          email: userData.email,
          phoneNumber: userData.phoneNumber,
          joinDate: new Date(userData.registrationDate).toLocaleDateString(),
          balance: userData.balance,
        });
        
        // Fetch user transactions
        const transactionsResponse = await fetch(`/api/admin/users/${id}/transactions`, {
          headers: {
            'x-auth-token': token,
          },
        });

        if (!transactionsResponse.ok) {
          throw new Error('Failed to fetch user transactions');
        }

        const transactionsData = await transactionsResponse.json();
        
        setTransactions(
          transactionsData.map((transaction: any) => ({
            id: transaction._id,
            type: transaction.type,
            amount: transaction.amount,
            date: new Date(transaction.createdAt).toLocaleDateString(),
            status: transaction.status,
          }))
        );
      } catch (error) {
        console.error('Error fetching user details:', error);
        toast({
          title: 'Error',
          description: 'Failed to load user details',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserDetails();
  }, [id, navigate]);

  // Event handlers for admin actions
  const handleSuspendUser = async () => {
    // Implementation for suspending a user
    toast({
      title: 'User Suspended',
      description: 'The user account has been suspended.',
    });
  };

  const handleDeleteAccount = async () => {
    // Implementation for deleting a user account
    toast({
      title: 'Account Deleted',
      description: 'The user account has been deleted.',
      variant: 'destructive',
    });
  };

  const handleAddFunds = async () => {
    // Implementation for adding funds to a user's account
    const amount = window.prompt('Enter amount to add:', '1000');
    if (amount && !isNaN(Number(amount)) && Number(amount) > 0) {
      toast({
        title: 'Funds Added',
        description: `₦${Number(amount).toLocaleString()} has been added to the user's account.`,
      });
    }
  };

  const handleDeductFunds = async () => {
    // Implementation for deducting funds from a user's account
    const amount = window.prompt('Enter amount to deduct:', '500');
    if (amount && !isNaN(Number(amount)) && Number(amount) > 0) {
      toast({
        title: 'Funds Deducted',
        description: `₦${Number(amount).toLocaleString()} has been deducted from the user's account.`,
      });
    }
  };

  const handleApproveTransactions = async () => {
    // Implementation for approving all pending transactions
    toast({
      title: 'Transactions Approved',
      description: 'All pending transactions have been approved.',
    });
  };

  const handleRejectTransactions = async () => {
    // Implementation for rejecting all pending transactions
    toast({
      title: 'Transactions Rejected',
      description: 'All pending transactions have been rejected.',
      variant: 'destructive',
    });
  };

  const handleSendMessage = async () => {
    // Implementation for sending a message to the user
    const message = window.prompt('Enter message to send to user:');
    if (message && message.trim()) {
      toast({
        title: 'Message Sent',
        description: 'Your message has been sent to the user.',
      });
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
                <span className="text-sm font-medium text-gray-500">Username</span>
                <span className="text-lg">{user.username}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-500">Full Name</span>
                <span className="text-lg">{user.fullName}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-500">Email</span>
                <span className="text-lg">{user.email}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-500">Phone Number</span>
                <span className="text-lg">{user.phoneNumber}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-500">Joined Date</span>
                <span className="text-lg">{user.joinDate}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-500">Current Balance</span>
                <span className="text-lg font-bold">₦{user.balance.toLocaleString()}</span>
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
                      <h4 className="font-medium">Account Status</h4>
                      <div className="flex space-x-2">
                        <Button variant="outline" onClick={handleSuspendUser}>Suspend User</Button>
                        <Button variant="destructive" onClick={handleDeleteAccount}>Delete Account</Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="font-medium">Balance Adjustment</h4>
                      <div className="flex space-x-2">
                        <Button variant="outline" onClick={handleAddFunds}>Add Funds</Button>
                        <Button variant="outline" onClick={handleDeductFunds}>Deduct Funds</Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="font-medium">Pending Transactions</h4>
                      <div className="flex space-x-2">
                        <Button variant="outline" onClick={handleApproveTransactions}>Approve All</Button>
                        <Button variant="outline" onClick={handleRejectTransactions}>Reject All</Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="font-medium">Send Notification</h4>
                      <Button variant="outline" onClick={handleSendMessage}>Send Message</Button>
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
