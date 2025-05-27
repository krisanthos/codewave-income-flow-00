
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Clock, DollarSign } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface Task {
  id: string;
  title: string;
  description: string;
  points: number;
  platform: string;
  task_type: string;
  task_url?: string;
  estimated_time_minutes?: number;
  difficulty: string;
}

const TaskCard = ({ task, onTaskComplete }: { task: Task; onTaskComplete: () => void }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const handleStartTask = async () => {
    if (!user) return;

    setIsLoading(true);

    try {
      // Check if user has already started this task
      const { data: existingTask } = await supabase
        .from('user_tasks')
        .select('*')
        .eq('user_id', user.id)
        .eq('task_id', task.id)
        .single();

      if (existingTask) {
        toast({
          title: "Task already started",
          description: "You have already started this task",
          variant: "destructive",
        });
        return;
      }

      // Create user task entry
      const { error: taskError } = await supabase
        .from('user_tasks')
        .insert({
          user_id: user.id,
          task_id: task.id,
          status: 'in_progress',
          started_at: new Date().toISOString()
        });

      if (taskError) throw taskError;

      // Open task URL if available
      if (task.task_url) {
        window.open(task.task_url, '_blank');
      }

      toast({
        title: "Task started!",
        description: "Complete the task and come back to claim your reward",
      });

    } catch (error: any) {
      toast({
        title: "Error starting task",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteTask = async () => {
    if (!user) return;

    setIsLoading(true);

    try {
      // Update task status to completed
      const { error: taskError } = await supabase
        .from('user_tasks')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          points_earned: task.points
        })
        .eq('user_id', user.id)
        .eq('task_id', task.id);

      if (taskError) throw taskError;

      // Update user balance and total earned
      const { data: profile } = await supabase
        .from('profiles')
        .select('balance, total_earned')
        .eq('id', user.id)
        .single();

      if (profile) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            balance: (profile.balance || 0) + task.points,
            total_earned: (profile.total_earned || 0) + task.points
          })
          .eq('id', user.id);

        if (profileError) throw profileError;
      }

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

      toast({
        title: "Task completed!",
        description: `₦${task.points} has been added to your wallet`,
      });

      onTaskComplete();
    } catch (error: any) {
      toast({
        title: "Error completing task",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPlatformIcon = (platform: string) => {
    // You could add specific icons for each platform here
    return '📱';
  };

  return (
    <Card className="hover:shadow-lg transition-shadow animate-fade-in-up">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg text-gray-900 flex items-center gap-2">
            <span>{getPlatformIcon(task.platform)}</span>
            {task.title}
          </CardTitle>
          <Badge className={getDifficultyColor(task.difficulty)}>
            {task.difficulty}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-gray-600 text-sm">{task.description}</p>
        
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <DollarSign size={16} className="text-green-600" />
            <span className="font-medium text-green-600">₦{task.points}</span>
          </div>
          {task.estimated_time_minutes && (
            <div className="flex items-center gap-1">
              <Clock size={16} />
              <span>{task.estimated_time_minutes} min</span>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={handleStartTask}
            disabled={isLoading}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            {task.task_url && <ExternalLink size={16} className="mr-2" />}
            {isLoading ? "Starting..." : "Start Task"}
          </Button>
          <Button 
            onClick={handleCompleteTask}
            disabled={isLoading}
            variant="outline"
            className="flex-1 border-green-600 text-green-600 hover:bg-green-50"
          >
            {isLoading ? "Completing..." : "Complete & Claim"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskCard;
