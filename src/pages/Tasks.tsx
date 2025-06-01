import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Play, ExternalLink, Facebook, Instagram, Twitter } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface Task {
  id: string;
  title: string;
  points: number;
  estimated_time_minutes: number;
  platform: string;
  difficulty: string;
}

const Tasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [watchingAd, setWatchingAd] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      try {
        // ✌️ Get user profile and tasks 🥀
        const [profileResult, tasksResult] = await Promise.all([
          supabase.rpc('get_current_user_profile'),
          supabase
            .from('tasks')
            .select('*')
            .eq('is_active', true)
            .limit(20)
        ]);

        if (profileResult.data && profileResult.data.length > 0) {
          setUserProfile(profileResult.data[0]);
        }

        if (tasksResult.data) {
          setTasks(tasksResult.data);
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

  // 💔 Handle watching ads and earning points ❤️‍🩹
  const handleWatchAd = async () => {
    if (!user || !userProfile) return;

    setWatchingAd(true);
    
    // Simulate ad watching (in real implementation, this would be triggered after ad completion)
    setTimeout(async () => {
      try {
        const earnedPoints = Math.floor(Math.random() * 51) + 50; // 50-100 points
        const newBalance = (userProfile.balance || 0) + earnedPoints;

        // Update user balance
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            balance: newBalance,
            total_earned: (userProfile.total_earned || 0) + earnedPoints
          })
          .eq('id', user.id);

        if (updateError) throw updateError;

        // Create transaction record
        const { error: transactionError } = await supabase
          .from('transactions')
          .insert({
            user_id: user.id,
            type: 'task_reward',
            amount: earnedPoints,
            status: 'completed',
            description: `Ad viewing reward`,
            currency: 'NGN'
          });

        if (transactionError) throw transactionError;

        // Update local state
        setUserProfile(prev => ({
          ...prev,
          balance: newBalance,
          total_earned: (prev.total_earned || 0) + earnedPoints
        }));

        toast({
          title: "Ad completed! 🎉",
          description: `₦${earnedPoints} has been added to your wallet`,
        });
      } catch (error: any) {
        console.error("Error processing ad reward:", error);
        toast({
          title: "Error",
          description: "Failed to process reward. Please try again.",
          variant: "destructive",
        });
      } finally {
        setWatchingAd(false);
      }
    }, 3000); // 3 second delay to simulate ad duration
  };

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
          title: "Task already completed",
          description: "You have already completed this task",
          variant: "destructive",
        });
        return;
      }

      // Complete the task
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
        title: "Task completed! 🎉",
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
      {/* Header 💔❤️‍🩹 */}
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
        {/* Watch Ads Section ✌️🥀 */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Play className="mr-2 h-5 w-5" />
              Watch Ads & Earn
            </CardTitle>
            <CardDescription>
              Watch advertisements and earn ₦50-100 per ad
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">Adscend Media Ads</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Watch sponsored content and earn instant rewards!
                </p>
                
                {watchingAd ? (
                  <div className="space-y-4">
                    <div className="bg-white border rounded-lg p-4">
                      <iframe
                        src="https://adscendmedia.com"
                        className="w-full h-64 border-0 rounded"
                        title="Adscend Media Ad"
                        sandbox="allow-scripts allow-same-origin"
                      />
                    </div>
                    <div className="text-center">
                      <div className="animate-pulse text-green-600 font-medium">
                        Processing reward... ⏳
                      </div>
                    </div>
                  </div>
                ) : (
                  <Button 
                    onClick={handleWatchAd}
                    className="bg-green-600 hover:bg-green-700"
                    disabled={watchingAd}
                  >
                    <Play className="mr-2 h-4 w-4" />
                    Watch Ad & Earn ₦50-100
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Social Media Tasks 💔❤️‍🩹 */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Social Media Tasks</CardTitle>
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
                  variant="outline"
                  onClick={() => window.open('https://www.facebook.com/profile.php?id=61576663620789', '_blank')}
                  className="w-full"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Follow
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

        {/* Other Tasks ✌️🥀 */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Tasks</CardTitle>
            <CardDescription>
              Complete these tasks to earn more rewards
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
                <p className="py-8 text-center text-gray-500">No additional tasks available at the moment. Check back soon!</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Tasks;
