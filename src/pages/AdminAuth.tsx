
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
    console.log('Attempting admin login with password:', password);
    
    // Directly check password first before making API call
    if (password !== 'codewave2025') {
      toast({
        title: "Access denied",
        description: "Invalid admin password. Please try 'codewave2025'",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Make an API call to authenticate admin
      const response = await fetch('/api/auth/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          adminPassword: 'codewave2025' // Use hardcoded password to ensure it matches
        }),
      });

      if (!response.ok) {
        console.error('Server responded with error:', response.status);
        throw new Error('Authentication failed');
      }

      const data = await response.json();
      console.log('Authentication successful, received token');
      localStorage.setItem('adminToken', data.token);
      
      toast({
        title: "Admin access granted",
        description: "Redirecting to admin dashboard...",
      });
      
      navigate('/admin-dashboard');
    } catch (error) {
      console.error('Admin login error:', error);
      toast({
        title: "Server error",
        description: "Could not connect to authentication server. Please try again later.",
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
            <span className="text-blue-500">Password: codewave2025</span>
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
