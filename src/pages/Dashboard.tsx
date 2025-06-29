
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Wallet, 
  TrendingUp, 
  Clock, 
  ArrowUpRight, 
  ArrowDownLeft, 
  CheckCircle,
  Menu,
  X,
  LogOut
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const Dashboard = () => {
  const [userProfile, setUserProfile] = useState<any>(null);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const fetchUserData = async () => {
      try {
        // Get user profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileData) {
          setUserProfile(profileData);
        }

        // Get recent transactions
        const { data: transactionsData } = await supabase
          .from('transactions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5);

        if (transactionsData) {
          setRecentTransactions(transactionsData);
        }
      } catch (error: any) {
        console.error("Error fetching user data:", error);
        toast({
          title: "Error",
          description: "Failed to load dashboard data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [user, navigate]);

  const handleLogout = async () => {
    try {
      await signOut();
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700">Loading dashboard...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="bg-white shadow-sm border-b lg:hidden">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
          <div className="flex items-center gap-3">
            {userProfile && (
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                ₦{(userProfile.balance || 0).toLocaleString()}
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="border-t bg-white p-4 space-y-2">
            <Link to="/tasks" className="block">
              <Button variant="ghost" className="w-full justify-start">
                <CheckCircle className="mr-2 h-4 w-4" />
                Tasks & Rewards
              </Button>
            </Link>
            <Link to="/profile" className="block">
              <Button variant="ghost" className="w-full justify-start">
                <User className="mr-2 h-4 w-4" />
                Profile
              </Button>
            </Link>
            <Link to="/withdrawal" className="block">
              <Button variant="ghost" className="w-full justify-start">
                <Wallet className="mr-2 h-4 w-4" />
                Withdraw
              </Button>
            </Link>
            <Button 
              variant="ghost" 
              className="w-full justify-start text-red-600 hover:text-red-700"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        )}
      </div>

      {/* Desktop Header */}
      <div className="hidden lg:block bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <div className="flex items-center space-x-4">
              {userProfile && (
                <>
                  <span className="text-sm text-gray-600">Welcome, {userProfile.full_name}</span>
                  <Badge className="bg-green-100 text-green-800">
                    ₦{(userProfile.balance || 0).toLocaleString()}
                  </Badge>
                </>
              )}
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6 mb-6 lg:mb-8">
          <Card className="p-3 lg:p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Wallet className="h-4 w-4 lg:h-6 lg:w-6 text-green-600" />
              </div>
              <div className="ml-3 lg:ml-4">
                <p className="text-xs lg:text-sm font-medium text-gray-600">Balance</p>
                <p className="text-lg lg:text-2xl font-bold text-gray-900">
                  ₦{(userProfile?.balance || 0).toLocaleString()}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-3 lg:p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <TrendingUp className="h-4 w-4 lg:h-6 lg:w-6 text-blue-600" />
              </div>
              <div className="ml-3 lg:ml-4">
                <p className="text-xs lg:text-sm font-medium text-gray-600">Total Earned</p>
                <p className="text-lg lg:text-2xl font-bold text-gray-900">
                  ₦{(userProfile?.total_earned || 0).toLocaleString()}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-3 lg:p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <CheckCircle className="h-4 w-4 lg:h-6 lg:w-6 text-yellow-600" />
              </div>
              <div className="ml-3 lg:ml-4">
                <p className="text-xs lg:text-sm font-medium text-gray-600">Tasks Done</p>
                <p className="text-lg lg:text-2xl font-bold text-gray-900">
                  {recentTransactions.filter(t => t.type === 'task_reward').length}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-3 lg:p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Clock className="h-4 w-4 lg:h-6 lg:w-6 text-purple-600" />
              </div>
              <div className="ml-3 lg:ml-4">
                <p className="text-xs lg:text-sm font-medium text-gray-600">Status</p>
                <p className="text-sm lg:text-base font-semibold text-green-600">
                  {userProfile?.registration_fee_paid ? 'Active' : 'Inactive'}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 mb-6 lg:mb-8">
          <Link to="/tasks">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader className="pb-3">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 lg:h-8 lg:w-8 text-green-600 mr-3" />
                  <div>
                    <CardTitle className="text-base lg:text-lg">Complete Tasks</CardTitle>
                    <CardDescription className="text-xs lg:text-sm">
                      Earn money by completing simple tasks
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button className="w-full bg-green-600 hover:bg-green-700 text-sm lg:text-base">
                  Start Earning <ArrowUpRight className="ml-2 h-3 w-3 lg:h-4 lg:w-4" />
                </Button>
              </CardContent>
            </Card>
          </Link>

          <Link to="/withdrawal">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader className="pb-3">
                <div className="flex items-center">
                  <ArrowDownLeft className="h-5 w-5 lg:h-8 lg:w-8 text-blue-600 mr-3" />
                  <div>
                    <CardTitle className="text-base lg:text-lg">Withdraw Funds</CardTitle>
                    <CardDescription className="text-xs lg:text-sm">
                      Cash out your earnings to your bank
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full text-sm lg:text-base">
                  Withdraw Now
                </Button>
              </CardContent>
            </Card>
          </Link>

          <Link to="/profile">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader className="pb-3">
                <div className="flex items-center">
                  <User className="h-5 w-5 lg:h-8 lg:w-8 text-purple-600 mr-3" />
                  <div>
                    <CardTitle className="text-base lg:text-lg">Profile Settings</CardTitle>
                    <CardDescription className="text-xs lg:text-sm">
                      Update your account information
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full text-sm lg:text-base">
                  View Profile
                </Button>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg lg:text-xl">Recent Transactions</CardTitle>
            <CardDescription className="text-sm lg:text-base">
              Your latest earnings and activities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 lg:space-y-4">
              {recentTransactions.length > 0 ? (
                recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between py-2 lg:py-3 border-b last:border-b-0">
                    <div className="flex items-center">
                      <div className={`p-2 rounded-lg mr-3 ${
                        transaction.type === 'task_reward' ? 'bg-green-100' : 
                        transaction.type === 'withdrawal' ? 'bg-red-100' : 'bg-blue-100'
                      }`}>
                        {transaction.type === 'task_reward' ? (
                          <ArrowUpRight className="h-3 w-3 lg:h-4 lg:w-4 text-green-600" />
                        ) : transaction.type === 'withdrawal' ? (
                          <ArrowDownLeft className="h-3 w-3 lg:h-4 lg:w-4 text-red-600" />
                        ) : (
                          <Wallet className="h-3 w-3 lg:h-4 lg:w-4 text-blue-600" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm lg:text-base font-medium text-gray-900">
                          {transaction.description || transaction.type}
                        </p>
                        <p className="text-xs lg:text-sm text-gray-500">
                          {new Date(transaction.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm lg:text-base font-semibold ${
                        transaction.type === 'withdrawal' ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {transaction.type === 'withdrawal' ? '-' : '+'}₦{transaction.amount.toLocaleString()}
                      </p>
                      <Badge variant={transaction.status === 'completed' ? 'default' : 'secondary'} className="text-xs">
                        {transaction.status}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm lg:text-base text-gray-500 text-center py-6 lg:py-8">
                  No transactions yet. Complete some tasks to get started!
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
