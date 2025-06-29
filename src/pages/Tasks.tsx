
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Facebook, Instagram, Twitter, Star, Download, Eye, MessageSquare, Users, Gift } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import TaskCard from "@/components/TaskCard";

interface Task {
  id: string;
  title: string;
  description: string;
  points: number;
  estimated_time_minutes: number;
  platform: string;
  difficulty: string;
  task_type: string;
  task_url?: string;
}

const Tasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const fetchData = async () => {
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

        // Get available tasks
        const { data: tasksData } = await supabase
          .from('tasks')
          .select('*')
          .eq('is_active', true)
          .limit(20);

        if (tasksData) {
          setTasks(tasksData);
        }

        // Get completed tasks for this user
        const { data: completedTasksData } = await supabase
          .from('user_tasks')
          .select('task_id')
          .eq('user_id', user.id)
          .eq('status', 'completed');

        if (completedTasksData) {
          setCompletedTasks(new Set(completedTasksData.map(task => task.task_id)));
        }

      } catch (error: any) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error",
          description: "Failed to load tasks. Please refresh the page.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user, navigate]);

  const handleSocialFollow = async (platform: string, url: string) => {
    const points = 25;
    const taskId = `social-${platform}`;
    
    // Check if already completed
    if (completedTasks.has(taskId)) {
      toast({
        title: "Already completed",
        description: "You have already followed this account",
        variant: "destructive",
      });
      return;
    }

    try {
      // Open the social media link
      window.open(url, '_blank');
      
      // Update user balance
      const newBalance = (userProfile.balance || 0) + points;
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          balance: newBalance,
          total_earned: (userProfile.total_earned || 0) + points
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // Create transaction record
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          type: 'task_reward',
          amount: points,
          status: 'completed',
          description: `Social media follow reward - ${platform}`,
          currency: 'NGN'
        });

      if (transactionError) throw transactionError;

      // Update local state
      setUserProfile(prev => ({
        ...prev,
        balance: newBalance,
        total_earned: (prev.total_earned || 0) + points
      }));

      setCompletedTasks(prev => new Set([...prev, taskId]));

      toast({
        title: "Follow completed! 🎉",
        description: `₦${points} has been added to your wallet`,
      });

    } catch (error: any) {
      console.error("Error processing follow reward:", error);
      toast({
        title: "Error",
        description: "Failed to process reward. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleQuickTask = async (taskType: string, points: number, description: string) => {
    const taskId = `quick-${taskType}`;
    
    if (completedTasks.has(taskId)) {
      toast({
        title: "Already completed",
        description: "You have already completed this task today",
        variant: "destructive",
      });
      return;
    }

    try {
      // Update user balance
      const newBalance = (userProfile.balance || 0) + points;
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          balance: newBalance,
          total_earned: (userProfile.total_earned || 0) + points
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // Create transaction record
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          type: 'task_reward',
          amount: points,
          status: 'completed',
          description: description,
          currency: 'NGN'
        });

      if (transactionError) throw transactionError;

      // Update local state
      setUserProfile(prev => ({
        ...prev,
        balance: newBalance,
        total_earned: (prev.total_earned || 0) + points
      }));

      setCompletedTasks(prev => new Set([...prev, taskId]));

      toast({
        title: "Task completed! 🎉",
        description: `₦${points} has been added to your wallet`,
      });

    } catch (error: any) {
      console.error("Error processing task reward:", error);
      toast({
        title: "Error",
        description: "Failed to process reward. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700">Loading tasks...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link to="/dashboard" className="mr-4">
                <ArrowLeft className="h-6 w-6 text-gray-600 hover:text-gray-900" />
              </Link>
              <h1 className="text-xl font-semibold text-gray-900">Tasks & Rewards</h1>
            </div>
            {userProfile && (
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                ₦{(userProfile.balance || 0).toLocaleString()}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Social Media Tasks */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="mr-2 h-5 w-5" />
              Social Media Tasks
            </CardTitle>
            <CardDescription>
              Follow our social media accounts for rewards
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border rounded-lg p-4 text-center">
                <Facebook className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <h3 className="font-medium mb-2">Follow on Facebook</h3>
                <p className="text-sm text-gray-600 mb-3">Earn ₦25</p>
                <Button 
                  size="sm" 
                  variant={completedTasks.has('social-facebook') ? "secondary" : "outline"}
                  onClick={() => handleSocialFollow('facebook', 'https://www.facebook.com/profile.php?id=61576663620789')}
                  className="w-full"
                  disabled={completedTasks.has('social-facebook')}
                >
                  {completedTasks.has('social-facebook') ? 'Completed' : 'Follow & Earn'}
                </Button>
              </div>
              
              <div className="border rounded-lg p-4 text-center">
                <Instagram className="h-8 w-8 text-pink-600 mx-auto mb-2" />
                <h3 className="font-medium mb-2">Follow on Instagram</h3>
                <p className="text-sm text-gray-600 mb-3">Earn ₦25</p>
                <Button 
                  size="sm" 
                  variant="outline"
                  className="w-full"
                  disabled
                >
                  Coming Soon
                </Button>
              </div>
              
              <div className="border rounded-lg p-4 text-center">
                <Twitter className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                <h3 className="font-medium mb-2">Follow on X (Twitter)</h3>
                <p className="text-sm text-gray-600 mb-3">Earn ₦25</p>
                <Button 
                  size="sm" 
                  variant="outline"
                  className="w-full"
                  disabled
                >
                  Coming Soon  
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Tasks */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Gift className="mr-2 h-5 w-5" />
              Quick Tasks
            </CardTitle>
            <CardDescription>
              Complete these simple tasks for instant rewards
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="border rounded-lg p-4 text-center">
                <Eye className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <h3 className="font-medium mb-2">Watch Demo Video</h3>
                <p className="text-sm text-gray-600 mb-3">Watch 2-minute tutorial • Earn ₦15</p>
                <Button 
                  size="sm" 
                  variant={completedTasks.has('quick-video') ? "secondary" : "outline"}
                  onClick={() => {
                    window.open('https://www.youtube.com/watch?v=dQw4w9WgXcQ', '_blank');
                    handleQuickTask('video', 15, 'Demo video viewing reward');
                  }}
                  className="w-full"
                  disabled={completedTasks.has('quick-video')}
                >
                  {completedTasks.has('quick-video') ? 'Completed' : 'Watch & Earn'}
                </Button>
              </div>

              <div className="border rounded-lg p-4 text-center">
                <MessageSquare className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <h3 className="font-medium mb-2">Share Feedback</h3>
                <p className="text-sm text-gray-600 mb-3">Rate our platform • Earn ₦20</p>
                <Button 
                  size="sm" 
                  variant={completedTasks.has('quick-feedback') ? "secondary" : "outline"}
                  onClick={() => handleQuickTask('feedback', 20, 'Platform feedback reward')}
                  className="w-full"
                  disabled={completedTasks.has('quick-feedback')}
                >
                  {completedTasks.has('quick-feedback') ? 'Completed' : 'Give Feedback'}
                </Button>
              </div>

              <div className="border rounded-lg p-4 text-center">
                <Star className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                <h3 className="font-medium mb-2">Daily Check-in</h3>
                <p className="text-sm text-gray-600 mb-3">Login bonus • Earn ₦10</p>
                <Button 
                  size="sm" 
                  variant={completedTasks.has('quick-checkin') ? "secondary" : "outline"}
                  onClick={() => handleQuickTask('checkin', 10, 'Daily check-in bonus')}
                  className="w-full"
                  disabled={completedTasks.has('quick-checkin')}
                >
                  {completedTasks.has('quick-checkin') ? 'Completed' : 'Check In'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Database Tasks */}
        <Card>
          <CardHeader>
            <CardTitle>Available Tasks</CardTitle>
            <CardDescription>
              Complete these tasks to earn more rewards
            </CardDescription>
          </CardHeader>
          <CardContent>
            {tasks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onTaskComplete={() => {
                      setCompletedTasks(prev => new Set([...prev, task.id]));
                    }}
                  />
                ))}
              </div>
            ) : (
              <p className="py-8 text-center text-gray-500">No additional tasks available at the moment. Check back soon!</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Tasks;
