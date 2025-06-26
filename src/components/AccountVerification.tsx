
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';

interface AccountVerificationProps {
  bankName: string;
  accountNumber: string;
  onVerified: (accountName: string) => void;
}

const AccountVerification = ({ bankName, accountNumber, onVerified }: AccountVerificationProps) => {
  const [isVerifying, setIsVerifying] = useState(false);

  const verifyAccount = async () => {
    if (!accountNumber || !bankName || accountNumber.length !== 10) {
      toast({
        title: "Invalid input",
        description: "Please enter a valid 10-digit account number and bank name",
        variant: "destructive",
      });
      return;
    }

    setIsVerifying(true);
    
    try {
      // Mock API call - In production, you would use a real bank verification API
      // Such as Paystack Resolve Account Number API or Flutterwave Bank Account Verification
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API delay
      
      // Mock account name generation for demo purposes
      const mockAccountName = `Account Holder ${accountNumber.slice(-4)}`;
      
      onVerified(mockAccountName);
      
      toast({
        title: "Account verified successfully",
        description: `Account name: ${mockAccountName}`,
      });
    } catch (error) {
      toast({
        title: "Verification failed",
        description: "Could not verify account number. Please check your details and try again.",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="p-4 bg-blue-50 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">Account Verification</h4>
        <p className="text-sm text-blue-800">
          Bank: {bankName}
        </p>
        <p className="text-sm text-blue-800">
          Account Number: {accountNumber}
        </p>
      </div>
      
      <Button 
        onClick={verifyAccount}
        disabled={isVerifying}
        className="w-full"
      >
        {isVerifying ? "Verifying Account..." : "Verify Account Number"}
      </Button>
    </div>
  );
};

export default AccountVerification;
