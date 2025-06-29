
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Facebook, Instagram, Twitter, Star, Download, Eye, MessageSquare, Users, Gift, Heart, ThumbsUp } from "lucide-react";
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

interface SocialPost {
  id: string;
  platform: string;
  post_url: string;
  post_title: string;
  post_description: string;
  reward_amount: number;
}

const Tasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [socialPosts, setSocialPosts] = useState<SocialPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());
  const [completedSocialTasks, setCompletedSocialTasks] = useState<Set<string>>(new Set());
  const [completedDailyTasks, setCompletedDailyTasks] = useState<Set<string>>(new Set());
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
        const { data: profileData } = await supabase.rpc('get_current_user_profile');
        if (profileData && profileData.length > 0) {
          setUserProfile(profileData[0]);
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

        // Get social media posts
        const { data: socialPostsData } = await supabase
          .from('social_posts')
          .select('*')
          .eq('is_active', true);

        if (socialPostsData) {
          setSocialPosts(socialPostsData);
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

        // Get completed social interactions
        const { data: completedSocialData } = await supabase
          .from('user_social_interactions')
          .select('post_id, interaction_type')
          .eq('user_id', user.id)
          .eq('reward_claimed', true);

        if (completedSocialData) {
          const socialTaskIds = completedSocialData.map(item => `${item.post_id}-${item.interaction_type}`);
          setCompletedSocialTasks(new Set(socialTaskIds));
        }

        // Get today's completed daily tasks
        const today = new Date().toISOString().split('T')[0];
        const { data: completedDailyData } = await supabase
          .from('daily_task_completions')
          .select('task_type')
          .eq('user_id', user.id)
          .eq('completion_date', today);

        if (completedDailyData) {
          setCompletedDailyTasks(new Set(completedDailyData.map(task => task.task_type)));
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

  const updateUserBalance = async (amount: number, description: string) => {
    try {
      const newBalance = (userProfile.balance || 0) + amount;
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          balance: newBalance,
          total_earned: (userProfile.total_earned || 0) + amount
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // Create transaction record
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          type: 'task_reward',
          amount: amount,
          status: 'completed',
          description: description,
          currency: 'NGN'
        });

      if (transactionError) throw transactionError;

      // Update local state
      setUserProfile(prev => ({
        ...prev,
        balance: newBalance,
        total_earned: (prev.total_earned || 0) + amount
      }));

      return true;
    } catch (error: any) {
      console.error("Error updating balance:", error);
      throw error;
    }
  };

  const handleSocialInteraction = async (post: SocialPost, interactionType: string) => {
    const taskId = `${post.id}-${interactionType}`;
    
    if (completedSocialTasks.has(taskId)) {
      toast({
        title: "Already completed",
        description: "You have already completed this social media task",
        variant: "destructive",
      });
      return;
    }

    try {
      // Open the social media link
      window.open(post.post_url, '_blank');
      
      // Record the interaction
      const { error: interactionError } = await supabase
        .from('user_social_interactions')
        .insert({
          user_id: user.id,
          post_id: post.id,
          interaction_type: interactionType,
          reward_claimed: true
        });

      if (interactionError) throw interactionError;

      // Update balance
      await updateUserBalance(post.reward_amount, `Social media ${interactionType} reward - ${post.platform}`);

      setCompletedSocialTasks(prev => new Set([...prev, taskId]));

      toast({
        title: "Task completed! 🎉",
        description: `₦${post.reward_amount} has been added to your wallet`,
      });

    } catch (error: any) {
      console.error("Error processing social interaction:", error);
      toast({
        title: "Error",
        description: "Failed to process reward. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDailyTask = async (taskType: string, amount: number, description: string) => {
    if (completedDailyTasks.has(taskType)) {
      toast({
        title: "Already completed",
        description: "You have already completed this task today",
        variant: "destructive",
      });
      return;
    }

    try {
      // Record daily task completion
      const { error: taskError } = await supabase
        .from('daily_task_completions')
        .insert({
          user_id: user.id,
          task_type: taskType,
          reward_amount: amount
        });

      if (taskError) throw taskError;

      // Update balance
      await updateUserBalance(amount, description);

      setCompletedDailyTasks(prev => new Set([...prev, taskType]));

      toast({
        title: "Task completed! 🎉",
        description: `₦${amount} has been added to your wallet`,
      });

    } catch (error: any) {
      console.error("Error processing daily task:", error);
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
        {/* Daily Tasks */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Gift className="mr-2 h-5 w-5" />
              Daily Tasks
            </CardTitle>
            <CardDescription>
              Complete these tasks once per day for instant rewards
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="border rounded-lg p-4 text-center">
                <Star className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                <h3 className="font-medium mb-2">Daily Check-in</h3>
                <p className="text-sm text-gray-600 mb-3">Login bonus • Earn ₦100</p>
                <Button 
                  size="sm" 
                  variant={completedDailyTasks.has('daily_checkin') ? "secondary" : "outline"}
                  onClick={() => handleDailyTask('daily_checkin', 100, 'Daily check-in bonus')}
                  className="w-full"
                  disabled={completedDailyTasks.has('daily_checkin')}
                >
                  {completedDailyTasks.has('daily_checkin') ? 'Completed Today' : 'Check In'}
                </Button>
              </div>

              <div className="border rounded-lg p-4 text-center">
                <MessageSquare className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <h3 className="font-medium mb-2">Rate Our Website</h3>
                <p className="text-sm text-gray-600 mb-3">Give us feedback • Earn ₦200</p>
                <Button 
                  size="sm" 
                  variant={completedDailyTasks.has('website_rating') ? "secondary" : "outline"}
                  onClick={() => handleDailyTask('website_rating', 200, 'Website rating reward')}
                  className="w-full"
                  disabled={completedDailyTasks.has('website_rating')}
                >
                  {completedDailyTasks.has('website_rating') ? 'Completed Today' : 'Rate Website'}
                </Button>
              </div>

              <div className="border rounded-lg p-4 text-center">
                <Eye className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <h3 className="font-medium mb-2">Watch Demo Video</h3>
                <p className="text-sm text-gray-600 mb-3">2-minute tutorial • Earn ₦50</p>
                <Button 
                  size="sm" 
                  variant={completedDailyTasks.has('demo_video') ? "secondary" : "outline"}
                  onClick={() => {
                    window.open('https://www.youtube.com/watch?v=dQw4w9WgXcQ', '_blank');
                    handleDailyTask('demo_video', 50, 'Demo video viewing reward');
                  }}
                  className="w-full"
                  disabled={completedDailyTasks.has('demo_video')}
                >
                  {completedDailyTasks.has('demo_video') ? 'Completed Today' : 'Watch & Earn'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Social Media Tasks */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="mr-2 h-5 w-5" />
              Social Media Tasks
            </CardTitle>
            <CardDescription>
              Interact with our social media posts and earn rewards
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {socialPosts.map((post) => (
                <div key={post.id} className="border rounded-lg p-4 text-center">
                  {post.platform === 'facebook' && <Facebook className="h-8 w-8 text-blue-600 mx-auto mb-2" />}
                  {post.platform === 'instagram' && <Instagram className="h-8 w-8 text-pink-600 mx-auto mb-2" />}
                  {post.platform === 'twitter' && <Twitter className="h-8 w-8 text-blue-400 mx-auto mb-2" />}
                  
                  <h3 className="font-medium mb-2">{post.post_title}</h3>
                  <p className="text-sm text-gray-600 mb-3">{post.post_description}</p>
                  <p className="text-sm font-medium text-green-600 mb-3">Earn ₦{post.reward_amount}</p>
                  
                  <div className="space-y-2">
                    <Button 
                      size="sm" 
                      variant={completedSocialTasks.has(`${post.id}-like`) ? "secondary" : "outline"}
                      onClick={() => handleSocialInteraction(post, 'like')}
                      className="w-full"
                      disabled={completedSocialTasks.has(`${post.id}-like`)}
                    >
                      <Heart className="h-4 w-4 mr-2" />
                      {completedSocialTasks.has(`${post.id}-like`) ? 'Liked' : 'Like & Earn'}
                    </Button>
                    
                    <Button 
                      size="sm" 
                      variant={completedSocialTasks.has(`${post.id}-follow`) ? "secondary" : "outline"}
                      onClick={() => handleSocialInteraction(post, 'follow')}
                      className="w-full"
                      disabled={completedSocialTasks.has(`${post.id}-follow`)}
                    >
                      <Users className="h-4 w-4 mr-2" />
                      {completedSocialTasks.has(`${post.id}-follow`) ? 'Followed' : 'Follow & Earn'}
                    </Button>
                  </div>
                </div>
              ))}
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
