
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Menu, X, ArrowRight, User, BarChart, LogOut, ListTodo, CreditCard, TrendingUp, Wallet, Clock, Gift } from "lucide-react";
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

interface DailyEarning {
  id: string;
  amount: number;
  date: string;
  created_at: string;
}

const Dashboard = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [dailyEarnings, setDailyEarnings] = useState<DailyEarning[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isClaimingEarnings, setIsClaimingEarnings] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [lastEarningsCheck, setLastEarningsCheck] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const fetchDashboardData = async () => {
      try {
        // Get user profile using the security definer function
        const [profileResult, transactionsResult, dailyEarningsResult] = await Promise.all([
          supabase.rpc('get_current_user_profile'),
          
          // Get recent transactions
          supabase
            .from('transactions')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(10),
          
          // Get daily earnings
          supabase
            .from('daily_earnings')
            .select('*')
            .eq('user_id', user.id)
            .order('date', { ascending: false })
            .limit(7)
        ]);

        console.log("Profile result:", profileResult);
        console.log("Transactions result:", transactionsResult);
        console.log("Daily earnings result:", dailyEarningsResult);

        if (profileResult.error) {
          console.error("Profile fetch error:", profileResult.error);
          // If no profile exists, create one
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
        } else if (profileResult.data && profileResult.data.length > 0) {
          setUserProfile(profileResult.data[0]);
        }

        if (transactionsResult.error) {
          console.error("Transactions fetch error:", transactionsResult.error);
        } else {
          setTransactions(transactionsResult.data || []);
        }

        if (dailyEarningsResult.error) {
          console.error("Daily earnings fetch error:", dailyEarningsResult.error);
        } else {
          setDailyEarnings(dailyEarningsResult.data || []);
        }

        // Check if user can claim daily earnings
        const today = new Date().toISOString().split('T')[0];
        const todayEarning = dailyEarningsResult.data?.find(earning => 
          earning.date === today
        );
        
        if (!todayEarning) {
          setLastEarningsCheck(today);
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

  const handleClaimDailyEarnings = async () => {
    if (!user || !userProfile) return;

    setIsClaimingEarnings(true);
    try {
      // Call the daily earnings calculation function
      const { error } = await supabase.rpc('calculate_daily_earnings');

      if (error) throw error;

      // Refresh user profile and transactions
      const [profileResult, transactionsResult, dailyEarningsResult] = await Promise.all([
        supabase.rpc('get_current_user_profile'),
        supabase
          .from('transactions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10),
        supabase
          .from('daily_earnings')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: false })
          .limit(7)
      ]);

      if (profileResult.data && profileResult.data.length > 0) {
        setUserProfile(profileResult.data[0]);
      }
      if (transactionsResult.data) {
        setTransactions(transactionsResult.data);
      }
      if (dailyEarningsResult.data) {
        setDailyEarnings(dailyEarningsResult.data);
      }

      toast({
        title: "Daily earnings claimed!",
        description: "Your daily earnings have been added to your wallet",
      });

    } catch (error: any) {
      console.error("Error claiming daily earnings:", error);
      toast({
        title: "Error",
        description: "Failed to claim daily earnings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsClaimingEarnings(false);
    }
  };

  const handleSocialMediaTask = async () => {
    if (!user || !userProfile) return;

    try {
      const taskReward = 100; // ₦100 for social media tasks

      // Update user balance
      const { error: balanceError } = await supabase
        .from('profiles')
        .update({
          balance: (userProfile.balance || 0) + taskReward,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (balanceError) throw balanceError;

      // Create transaction record
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          type: 'task_reward',
          amount: taskReward,
          status: 'completed',
          description: 'Social Media Task Completion',
          currency: 'NGN'
        });

      if (transactionError) throw transactionError;

      // Update local state
      setUserProfile(prev => ({
        ...prev,
        balance: (prev.balance || 0) + taskReward
      }));

      // Refresh transactions
      const { data: newTransactions } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (newTransactions) {
        setTransactions(newTransactions);
      }

      toast({
        title: "Task completed!",
        description: `₦${taskReward} has been added to your wallet`,
      });

    } catch (error: any) {
      console.error("Error completing social media task:", error);
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

  // Calculate daily bonus based on balance (2.5% daily for every 10,000)
  const calculateDailyBonus = (balance: number) => {
    return Math.floor(balance / 10000) * 0.025 * 10000;
  };

  // Check if user can claim daily earnings
  const canClaimDailyEarnings = () => {
    const today = new Date().toISOString().split('T')[0];
    const todayEarning = dailyEarnings.find(earning => earning.date === today);
    return !todayEarning && userProfile?.balance > 0;
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
              <Link 
                to="/profile"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                onClick={() => setIsMenuOpen(false)}
              >
                <User className="inline mr-2" size={16} />
                Profile
              </Link>
              <Link 
                to="/deposit"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                onClick={() => setIsMenuOpen(false)}
              >
                <TrendingUp className="inline mr-2" size={16} />
                Deposit
              </Link>
              <Link 
                to="/withdrawal"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                onClick={() => setIsMenuOpen(false)}
              >
                <Wallet className="inline mr-2" size={16} />
                Withdrawal
              </Link>
              <button 
                onClick={handleLogout}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
              >
                <LogOut className="inline mr-2" size={16} />
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
                <Link to="/deposit" className="text-gray-300 hover:bg-gray-700 hover:text-white group flex items-center px-3 py-2 text-sm font-medium rounded-md">
                  <TrendingUp className="mr-3" size={20} />
                  Deposit
                </Link>
                <Link to="/withdrawal" className="text-gray-300 hover:bg-gray-700 hover:text-white group flex items-center px-3 py-2 text-sm font-medium rounded-md">
                  <Wallet className="mr-3" size={20} />
                  Withdrawal
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
                  <div className="text-2xl font-bold">2.5%</div>
                  <p className="text-xs text-gray-600 mt-1">Per ₦10,000 deposited daily</p>
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

            {/* Daily Earnings Claim Section */}
            {canClaimDailyEarnings() && (
              <Card className="mt-6 border-yellow-200 bg-yellow-50">
                <CardHeader>
                  <CardTitle className="flex items-center text-yellow-800">
                    <Gift className="mr-2" size={20} />
                    Daily Earnings Available
                  </CardTitle>
                  <CardDescription className="text-yellow-700">
                    You can claim your daily earnings of ₦{calculateDailyBonus(userProfile.balance || 0).toLocaleString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={handleClaimDailyEarnings}
                    disabled={isClaimingEarnings}
                    className="bg-yellow-600 hover:bg-yellow-700"
                  >
                    {isClaimingEarnings ? "Claiming..." : "Claim Daily Earnings"}
                  </Button>
                </CardContent>
              </Card>
            )}

            <div className="mt-8">
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="tasks">Tasks</TabsTrigger>
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
                          Complete tasks and make deposits to increase your daily earnings!
                        </p>
                      </div>
                      
                      <div className="mt-6">
                        <h3 className="font-medium text-gray-900">Quick Actions</h3>
                        <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                            <h4 className="font-medium text-blue-800">Social Media Task</h4>
                            <p className="text-sm text-blue-600 mb-2">Earn ₦100 for completing social media tasks</p>
                            <Button onClick={handleSocialMediaTask} size="sm" className="bg-blue-600 hover:bg-blue-700">
                              Complete Task (₦100)
                            </Button>
                          </div>
                          <Link to="/deposit" className="bg-green-50 border border-green-200 rounded-md p-3 hover:bg-green-100 transition-colors">
                            <h4 className="font-medium text-green-800">Make Deposit</h4>
                            <p className="text-sm text-green-600">Earn 2.5% daily returns</p>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="tasks" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Clock className="mr-2" size={20} />
                        Tasks
                      </CardTitle>
                      <CardDescription>
                        More tasks coming soon!
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8">
                        <Clock className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">More Tasks Coming Soon!</h3>
                        <p className="text-gray-500 mb-4">We're working on bringing you more exciting tasks to earn rewards.</p>
                        <div className="bg-blue-50 border border-blue-200 rounded-md p-4 max-w-md mx-auto">
                          <h4 className="font-medium text-blue-800 mb-2">Available Now: Social Media Task</h4>
                          <p className="text-sm text-blue-600 mb-3">Complete social media engagement tasks to earn ₦100</p>
                          <Button onClick={handleSocialMediaTask} className="bg-blue-600 hover:bg-blue-700">
                            Complete Social Media Task
                          </Button>
                        </div>
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
                                  {transaction.type === 'withdrawal' && 'Withdrawal'}
                                  {transaction.type === 'registration_bonus' && 'Welcome Bonus'}
                                  {transaction.type === 'task_reward' && 'Task Reward'}
                                  {transaction.type === 'daily_earning' && 'Daily Earnings'}
                                </h4>
                                <p className="text-sm text-gray-500">{new Date(transaction.created_at).toLocaleDateString()}</p>
                                {transaction.description && (
                                  <p className="text-xs text-gray-400 mt-1">{transaction.description}</p>
                                )}
                              </div>
                              <div className="text-right">
                                <span className={`block font-medium ${
                                  transaction.type === 'withdrawal' ? 'text-red-600' : 'text-green-600'
                                }`}>
                                  {transaction.type === 'withdrawal' ? '-' : '+'} ₦{transaction.amount.toLocaleString()}
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
