
import React, { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';

const ConfirmRegistration = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  useEffect(() => {
    // In a real implementation, you would verify the token here
    console.log('Confirmation token:', token);
  }, [token]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full px-4">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              <CheckCircle className="h-16 w-16 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-green-800">
              Registration Confirmed! 🎉
            </CardTitle>
            <CardDescription>
              Welcome to our platform! Your account has been successfully verified.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-medium text-green-800 mb-2">What's Next?</h3>
              <ul className="text-sm text-green-700 space-y-1">
                <li>✓ Your account is now active</li>
                <li>✓ You've received a ₦2,500 welcome bonus</li>
                <li>✓ Start earning by completing tasks</li>
                <li>✓ Watch ads to earn extra money</li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <Link to="/login" className="block">
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  Login to Your Account
                </Button>
              </Link>
              
              <Link to="/" className="block">
                <Button variant="outline" className="w-full">
                  Back to Homepage
                </Button>
              </Link>
            </div>
            
            <div className="text-center text-sm text-gray-600">
              <p>
                Need help? Contact our support team for assistance.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ConfirmRegistration;
