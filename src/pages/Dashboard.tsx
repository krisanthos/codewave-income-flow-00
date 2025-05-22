
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Menu, X, ArrowRight, User, BarChart, LogOut } from "lucide-react";

const Dashboard = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  // Mock data - in a real app this would come from an API
  const userData = {
    username: "johndoe",
    fullName: "John Doe",
    balance: 15000,
    dailyBonus: 750,
    joinedDate: new Date().toLocaleDateString(),
    transactions: [
      { id: 1, type: "deposit", amount: 10000, date: "2023-05-01", status: "completed" },
      { id: 2, type: "daily_bonus", amount: 500, date: "2023-05-02", status: "completed" },
      { id: 3, type: "task_reward", amount: 2000, date: "2023-05-03", status: "completed" },
      { id: 4, type: "withdraw", amount: 5000, date: "2023-05-04", status: "pending" },
    ],
  };

  // Mock tasks
  const tasks = [
    { id: 1, title: "Watch promotional video", reward: 200, duration: "2 min", completed: false },
    { id: 2, title: "Complete survey about mobile phones", reward: 500, duration: "5 min", completed: false },
    { id: 3, title: "Like and follow Facebook page", reward: 300, duration: "1 min", completed: true },
    { id: 4, title: "Install and register on partner app", reward: 1000, duration: "10 min", completed: false },
  ];

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/dashboard" className="flex-shrink-0 flex items-center">
                <span className="text-2xl font-bold text-blue-600">CodeWave</span>
              </Link>
            </div>
            <div className="hidden md:ml-6 md:flex md:items-center md:space-x-4">
              <span className="text-gray-700 px-3 py-2 rounded-md text-sm font-medium">
                Welcome, {userData.username}!
              </span>
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                ₦{userData.balance.toLocaleString()}
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
                Welcome, {userData.username}!
              </div>
              <div className="block px-3 py-2 rounded-md text-base font-medium bg-blue-100 text-blue-800 mx-3">
                ₦{userData.balance.toLocaleString()}
              </div>
              <Link to="/tasks" onClick={toggleMenu} className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">
                Tasks
              </Link>
              <Link to="/withdraw" onClick={toggleMenu} className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">
                Withdraw
              </Link>
              <Link to="/deposit" onClick={toggleMenu} className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">
                Deposit
              </Link>
              <Link to="/support" onClick={toggleMenu} className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">
                Support
              </Link>
              <Link to="/" onClick={toggleMenu} className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">
                Logout
              </Link>
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
                <Link to="/tasks" className="text-gray-300 hover:bg-gray-700 hover:text-white group flex items-center px-3 py-2 text-sm font-medium rounded-md">
                  <ArrowRight className="mr-3" size={20} />
                  Tasks
                </Link>
                <Link to="/withdraw" className="text-gray-300 hover:bg-gray-700 hover:text-white group flex items-center px-3 py-2 text-sm font-medium rounded-md">
                  <ArrowRight className="mr-3" size={20} />
                  Withdraw
                </Link>
                <Link to="/deposit" className="text-gray-300 hover:bg-gray-700 hover:text-white group flex items-center px-3 py-2 text-sm font-medium rounded-md">
                  <ArrowRight className="mr-3" size={20} />
                  Deposit
                </Link>
                <Link to="/profile" className="text-gray-300 hover:bg-gray-700 hover:text-white group flex items-center px-3 py-2 text-sm font-medium rounded-md">
                  <User className="mr-3" size={20} />
                  Profile
                </Link>
                <Link to="/support" className="text-gray-300 hover:bg-gray-700 hover:text-white group flex items-center px-3 py-2 text-sm font-medium rounded-md">
                  <ArrowRight className="mr-3" size={20} />
                  Support
                </Link>
                <Link to="/" className="text-gray-300 hover:bg-gray-700 hover:text-white group flex items-center px-3 py-2 text-sm font-medium rounded-md mt-6">
                  <LogOut className="mr-3" size={20} />
                  Logout
                </Link>
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
                  <div className="text-2xl font-bold">₦{userData.balance.toLocaleString()}</div>
                  <p className="text-xs text-green-600 mt-1">+₦{userData.dailyBonus} daily bonus</p>
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
                  <CardTitle className="text-sm font-medium text-gray-500">Member Since</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{userData.joinedDate}</div>
                </CardContent>
              </Card>
            </div>

            <div className="mt-8">
              <Tabs defaultValue="overview" className="w-full" onValueChange={setActiveTab}>
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
                      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                        <p className="text-sm text-blue-800">
                          Complete more tasks to increase your balance and earn higher daily bonuses!
                        </p>
                      </div>
                      
                      <div className="mt-6">
                        <h3 className="font-medium text-gray-900">Quick Actions</h3>
                        <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <Button variant="outline" className="justify-start">
                            <ArrowRight className="mr-2" size={16} />
                            Find Tasks
                          </Button>
                          <Button variant="outline" className="justify-start">
                            <ArrowRight className="mr-2" size={16} />
                            Deposit Funds
                          </Button>
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
                        {tasks.map((task) => (
                          <div key={task.id} className="py-4">
                            <div className="flex justify-between">
                              <div>
                                <h4 className="font-medium text-gray-900">{task.title}</h4>
                                <p className="text-sm text-gray-500">Duration: {task.duration}</p>
                              </div>
                              <div className="text-right">
                                <span className="block text-green-600 font-medium">₦{task.reward}</span>
                                <Button
                                  size="sm"
                                  className="mt-2"
                                  variant={task.completed ? "secondary" : "default"}
                                  disabled={task.completed}
                                >
                                  {task.completed ? "Completed" : "Start Task"}
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
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
                        {userData.transactions.map((transaction) => (
                          <div key={transaction.id} className="py-4 flex justify-between">
                            <div>
                              <h4 className="font-medium text-gray-900">
                                {transaction.type === 'deposit' && 'Deposit'}
                                {transaction.type === 'withdraw' && 'Withdrawal'}
                                {transaction.type === 'daily_bonus' && 'Daily Bonus'}
                                {transaction.type === 'task_reward' && 'Task Reward'}
                              </h4>
                              <p className="text-sm text-gray-500">{transaction.date}</p>
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
                        ))}
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
