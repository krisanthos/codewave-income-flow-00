
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Menu, X, ArrowRight, User, BarChart, LogOut } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface Transaction {
  id: string;
  type: string;
  amount: number;
  created_at: string;
  status: string;
  description: string;
}

interface Task {
  id: string;
  title: string;
  points: number;
  estimated_time_minutes: number;
  platform: string;
  difficulty: string;
}

const Dashboard = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const fetchDashboardData = async () => {
      try {
        // Fetch all data in parallel for better performance
        const [profileResult, transactionsResult, tasksResult] = await Promise.all([
          // Get user profile
          supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single(),
          
          // Get recent transactions
          supabase
            .from('transactions')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(10),
          
          // Get available tasks
          supabase
            .from('tasks')
            .select('*')
            .eq('is_active', true)
            .limit(10)
        ]);

        if (profileResult.error) {
          console.error("Profile fetch error:", profileResult.error);
          // Create profile if it doesn't exist
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              email: user.email,
              full_name: user.user_metadata?.full_name || 'New User',
              phone: user.user_metadata?.phone,
              balance: 2500,
              total_earned: 0,
              registration_fee_paid: true
            })
            .select()
            .single();

          if (createError) {
            throw createError;
          }
          setUserProfile(newProfile);
        } else {
          setUserProfile(profileResult.data);
        }

        if (transactionsResult.error) {
          console.error("Transactions fetch error:", transactionsResult.error);
        } else {
          setTransactions(transactionsResult.data || []);
        }

        if (tasksResult.error) {
          console.error("Tasks fetch error:", tasksResult.error);
        } else {
          setTasks(tasksResult.data || []);
        }

      } catch (error: any) {
        console.error("Error fetching dashboard data:", error);
        toast({
          title: "Error",
          description: "Failed to load dashboard data. Please refresh the page.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [user, navigate]);

  const handleTaskCompletion = async (taskId: string) => {
    if (!user || !userProfile) return;

    try {
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;

      // Check if user has already started this task
      const { data: existingTask } = await supabase
        .from('user_tasks')
        .select('*')
        .eq('user_id', user.id)
        .eq('task_id', taskId)
        .single();

      if (existingTask) {
        toast({
          title: "Task already started",
          description: "You have already started this task",
          variant: "destructive",
        });
        return;
      }

      // Create user task entry and complete it
      const { error: taskError } = await supabase
        .from('user_tasks')
        .insert({
          user_id: user.id,
          task_id: taskId,
          status: 'completed',
          started_at: new Date().toISOString(),
          completed_at: new Date().toISOString(),
          points_earned: task.points
        });

      if (taskError) throw taskError;

      // Update user balance
      const newBalance = (userProfile.balance || 0) + task.points;
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          balance: newBalance,
          total_earned: (userProfile.total_earned || 0) + task.points
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // Create transaction record
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          type: 'task_reward',
          amount: task.points,
          status: 'completed',
          description: `Reward for completing: ${task.title}`,
          currency: 'NGN'
        });

      if (transactionError) throw transactionError;

      // Update local state
      setUserProfile(prev => ({
        ...prev,
        balance: newBalance,
        total_earned: (prev.total_earned || 0) + task.points
      }));

      toast({
        title: "Task completed!",
        description: `₦${task.points} has been added to your wallet`,
      });

    } catch (error: any) {
      console.error("Error completing task:", error);
      toast({
        title: "Error",
        description: "Failed to complete task. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Calculate daily bonus based on balance (5% daily)
  const calculateDailyBonus = (balance: number) => {
    return Math.round(balance * 0.05);
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700">Loading your dashboard...</h2>
          <p className="text-gray-500 mt-2">Please wait while we fetch your data</p>
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-700">Unable to load profile</h2>
          <p className="text-gray-500 mt-2">Please try refreshing the page</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Refresh Page
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/dashboard" className="flex-shrink-0 flex items-center">
                <span className="text-2xl font-bold text-green-600">CodeWave</span>
              </Link>
            </div>
            <div className="hidden md:ml-6 md:flex md:items-center md:space-x-4">
              <span className="text-gray-700 px-3 py-2 rounded-md text-sm font-medium">
                Welcome, {userProfile.full_name || 'User'}!
              </span>
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                ₦{(userProfile.balance || 0).toLocaleString()}
              </span>
            </div>
            <div className="flex items-center md:hidden">
              <button
                onClick={toggleMenu}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="pt-2 pb-3 space-y-1">
              <div className="block px-3 py-2 rounded-md text-base font-medium text-gray-700">
                Welcome, {userProfile.full_name || 'User'}!
              </div>
              <div className="block px-3 py-2 rounded-md text-base font-medium bg-green-100 text-green-800 mx-3">
                ₦{(userProfile.balance || 0).toLocaleString()}
              </div>
              <button 
                onClick={handleLogout}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Dashboard Content */}
      <div className="flex flex-col md:flex-row flex-grow">
        {/* Sidebar (desktop only) */}
        <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 md:pt-16">
          <div className="flex-1 flex flex-col min-h-0 bg-gray-800">
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
              <div className="flex-1 px-3 space-y-1">
                <Link to="/dashboard" className="bg-gray-900 text-white group flex items-center px-3 py-2 text-sm font-medium rounded-md">
                  <BarChart className="mr-3" size={20} />
                  Dashboard
                </Link>
                <Link to="/profile" className="text-gray-300 hover:bg-gray-700 hover:text-white group flex items-center px-3 py-2 text-sm font-medium rounded-md">
                  <User className="mr-3" size={20} />
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-gray-300 hover:bg-gray-700 hover:text-white group flex items-center px-3 py-2 text-sm font-medium rounded-md mt-6 w-full text-left"
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
            <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
            
            <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">Current Balance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">₦{(userProfile.balance || 0).toLocaleString()}</div>
                  <p className="text-xs text-green-600 mt-1">+₦{calculateDailyBonus(userProfile.balance || 0)} daily bonus</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">Daily Earning Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">5%</div>
                  <p className="text-xs text-gray-600 mt-1">Based on your current balance</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">Total Earned</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">₦{(userProfile.total_earned || 0).toLocaleString()}</div>
                  <p className="text-xs text-gray-600 mt-1">Lifetime earnings</p>
                </CardContent>
              </Card>
            </div>

            <div className="mt-8">
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="tasks">Available Tasks</TabsTrigger>
                  <TabsTrigger value="transactions">Transactions</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Account Summary</CardTitle>
                      <CardDescription>
                        Your current status and next steps
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="bg-green-50 border border-green-200 rounded-md p-4">
                        <p className="text-sm text-green-800">
                          Complete more tasks to increase your balance and earn higher daily bonuses!
                        </p>
                      </div>
                      
                      <div className="mt-6">
                        <h3 className="font-medium text-gray-900">Available Task Types</h3>
                        <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                            <h4 className="font-medium text-blue-800">Watch Ads</h4>
                            <p className="text-sm text-blue-600">Earn 45-100 points per ad</p>
                          </div>
                          <div className="bg-purple-50 border border-purple-200 rounded-md p-3">
                            <h4 className="font-medium text-purple-800">Social Media</h4>
                            <p className="text-sm text-purple-600">Like, share, and follow</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="tasks" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Available Tasks</CardTitle>
                      <CardDescription>
                        Complete these tasks to earn money
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="divide-y divide-gray-200">
                        {tasks.length > 0 ? (
                          tasks.map((task) => (
                            <div key={task.id} className="py-4">
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <h4 className="font-medium text-gray-900">{task.title}</h4>
                                  <p className="text-sm text-gray-500 mt-1">
                                    Platform: {task.platform} • Duration: {task.estimated_time_minutes || 1} min • Difficulty: {task.difficulty}
                                  </p>
                                </div>
                                <div className="text-right ml-4">
                                  <span className="block text-green-600 font-medium text-lg">₦{task.points}</span>
                                  <Button
                                    size="sm"
                                    className="mt-2 bg-green-600 hover:bg-green-700"
                                    onClick={() => handleTaskCompletion(task.id)}
                                  >
                                    Complete Task
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="py-8 text-center text-gray-500">No tasks available at the moment. Check back soon!</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="transactions" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Transaction History</CardTitle>
                      <CardDescription>
                        Your recent financial activity
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="divide-y divide-gray-200">
                        {transactions.length > 0 ? (
                          transactions.map((transaction) => (
                            <div key={transaction.id} className="py-4 flex justify-between">
                              <div>
                                <h4 className="font-medium text-gray-900">
                                  {transaction.type === 'deposit' && 'Deposit'}
                                  {transaction.type === 'withdraw' && 'Withdrawal'}
                                  {transaction.type === 'registration_bonus' && 'Welcome Bonus'}
                                  {transaction.type === 'task_reward' && 'Task Reward'}
                                  {transaction.type === 'daily_bonus' && 'Daily Bonus'}
                                </h4>
                                <p className="text-sm text-gray-500">{new Date(transaction.created_at).toLocaleDateString()}</p>
                                {transaction.description && (
                                  <p className="text-xs text-gray-400 mt-1">{transaction.description}</p>
                                )}
                              </div>
                              <div className="text-right">
                                <span className={`block font-medium ${
                                  transaction.type === 'withdraw' ? 'text-red-600' : 'text-green-600'
                                }`}>
                                  {transaction.type === 'withdraw' ? '-' : '+'} ₦{transaction.amount.toLocaleString()}
                                </span>
                                <span className={`text-xs ${
                                  transaction.status === 'completed' ? 'text-green-500' : 'text-yellow-500'
                                }`}>
                                  {transaction.status}
                                </span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="py-8 text-center text-gray-500">No transactions yet. Your activity will appear here.</p>
                        )}
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

export default Dashboard;
