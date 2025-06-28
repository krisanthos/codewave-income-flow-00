
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const AdminAuth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  
  // Admin emails and password
  const ADMIN_EMAILS = ['sebestianarchibald@gmail.com', 'victorycrisantos@gmail.com'];
  const ADMIN_PASSWORD = '@Anonymousfemboy2025';
  
  useEffect(() => {
    // Check if user is already logged in as admin
    const checkAdminAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // Check if user is admin by looking at their profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (profile && ADMIN_EMAILS.includes(profile.email)) {
          navigate('/admin-dashboard');
        }
      }
    };
    checkAdminAuth();
  }, [navigate]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Missing fields",
        description: "Please enter both email and password",
        variant: "destructive",
      });
      return;
    }
    
    // Check if email is one of the admin emails
    if (!ADMIN_EMAILS.includes(email.toLowerCase())) {
      toast({
        title: "Access denied",
        description: "Invalid admin credentials",
        variant: "destructive",
      });
      return;
    }
    
    // Check if password matches
    if (password !== ADMIN_PASSWORD) {
      toast({
        title: "Access denied",
        description: "Invalid admin credentials",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // First, try to create the admin user if they don't exist
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: email === 'sebestianarchibald@gmail.com' ? 'Sebastian Archibald' : 'Victory Crisantos',
            is_admin: true
          }
        }
      });

      // If user already exists, that's fine, just try to sign in
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error && error.message !== 'User already registered') {
        throw error;
      }

      if (data.user || !error) {
        // Make sure the user has admin privileges in their profile
        const { error: updateError } = await supabase
          .from('profiles') 
          .upsert({
            id: data.user?.id,
            email: email,
            full_name: email === 'sebestianarchibald@gmail.com' ? 'Sebastian Archibald' : 'Victory Crisantos',
            registration_fee_paid: true,
            balance: 0,
            total_earned: 0
          });

        if (updateError) {
          console.log('Profile update error (non-critical):', updateError);
        }
        
        toast({
          title: "Admin access granted",
          description: "Redirecting to admin dashboard...",
        });
        
        navigate('/admin-dashboard');
      }
    } catch (error: any) {
      console.error('Admin login error:', error);
      toast({
        title: "Authentication failed",
        description: error.message || "Invalid credentials",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">Admin Authentication</CardTitle>
          <CardDescription>
            This area is restricted to authorized personnel only.
            <br />
            <span className="text-sm text-muted-foreground">
              Use your admin email and password to continue.
            </span>
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Input
                id="email"
                type="email"
                placeholder="Admin email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Input
                id="password"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" disabled={isLoading}>
              {isLoading ? "Authenticating..." : "Access Admin Area"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default AdminAuth;
