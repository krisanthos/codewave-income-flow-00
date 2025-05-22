
import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const UserDetail = () => {
  const { id } = useParams<{ id: string }>();
  
  // Mock user data - in a real app this would come from an API
  const user = {
    id: Number(id),
    username: 'john_doe',
    fullName: 'John Doe',
    email: 'john@example.com',
    phoneNumber: '+2341234567890',
    joinDate: '2023-01-15',
    balance: 25000,
    transactions: [
      { id: 1, type: 'deposit', amount: 10000, date: '2023-05-01', status: 'completed' },
      { id: 2, type: 'daily_bonus', amount: 500, date: '2023-05-02', status: 'completed' },
      { id: 3, type: 'task_reward', amount: 2000, date: '2023-05-03', status: 'completed' },
      { id: 4, type: 'withdraw', amount: 5000, date: '2023-05-04', status: 'pending' },
    ]
  };
  
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
                    <div className="rounded-md border">
                      <div className="grid grid-cols-4 border-b bg-gray-50 p-3 font-medium">
                        <div>Type</div>
                        <div>Amount</div>
                        <div>Date</div>
                        <div>Status</div>
                      </div>
                      <div className="divide-y">
                        {user.transactions.map((transaction) => (
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
                        <Button variant="outline">Suspend User</Button>
                        <Button variant="destructive">Delete Account</Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="font-medium">Balance Adjustment</h4>
                      <div className="flex space-x-2">
                        <Button variant="outline">Add Funds</Button>
                        <Button variant="outline">Deduct Funds</Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="font-medium">Pending Transactions</h4>
                      <div className="flex space-x-2">
                        <Button variant="outline">Approve All</Button>
                        <Button variant="outline">Reject All</Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="font-medium">Send Notification</h4>
                      <Button variant="outline">Send Message</Button>
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
