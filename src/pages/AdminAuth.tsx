
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';

const AdminAuth = () => {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Direct client-side password check
    if (password !== 'codewave2025') {
      toast({
        title: "Access denied",
        description: "Invalid admin password",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Simulate successful authentication
      setTimeout(() => {
        // Create and store an admin token
        const tokenPayload = {
          id: 'admin-user',
          isAdmin: true,
          exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours expiry
        };
        
        const fakeToken = btoa(JSON.stringify(tokenPayload));
        localStorage.setItem('adminToken', fakeToken);
        
        toast({
          title: "Admin access granted",
          description: "Redirecting to admin dashboard...",
        });
        
        navigate('/admin-dashboard');
      }, 500);
    } catch (error) {
      console.error('Admin login error:', error);
      toast({
        title: "Authentication failed",
        description: "Please try again",
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
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Input
                id="password"
                type="password"
                placeholder="Enter admin password"
                autoComplete="off"
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
