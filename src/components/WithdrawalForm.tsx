
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

const MINIMUM_WITHDRAWAL = 21450; // ₦21,450 minimum withdrawal

const WithdrawalForm = ({ balance, onWithdrawalSuccess }: { 
  balance: number; 
  onWithdrawalSuccess: () => void; 
}) => {
  const [amount, setAmount] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountName, setAccountName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifyingAccount, setIsVerifyingAccount] = useState(false);
  const { user } = useAuth();

  const verifyAccountNumber = async () => {
    if (!accountNumber || !bankName || accountNumber.length !== 10) {
      toast({
        title: "Invalid input",
        description: "Please enter a valid 10-digit account number and select a bank",
        variant: "destructive",
      });
      return;
    }

    setIsVerifyingAccount(true);
    
    try {
      // Mock API call - in production, you'd use a real bank verification API
      // For now, we'll simulate the verification
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API delay
      
      // Mock account name based on account number (for demo purposes)
      const mockAccountName = `Account Holder ${accountNumber.slice(-4)}`;
      setAccountName(mockAccountName);
      
      toast({
        title: "Account verified",
        description: `Account name: ${mockAccountName}`,
      });
    } catch (error) {
      toast({
        title: "Verification failed",
        description: "Could not verify account number. Please check and try again.",
        variant: "destructive",
      });
    } finally {
      setIsVerifyingAccount(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const withdrawalAmount = parseFloat(amount);

    if (withdrawalAmount < MINIMUM_WITHDRAWAL) {
      toast({
        title: "Withdrawal amount too low",
        description: `Minimum withdrawal amount is ₦${MINIMUM_WITHDRAWAL.toLocaleString()}`,
        variant: "destructive",
      });
      return;
    }

    if (withdrawalAmount > balance) {
      toast({
        title: "Insufficient balance",
        description: "You don't have enough balance for this withdrawal",
        variant: "destructive",
      });
      return;
    }

    if (!accountName) {
      toast({
        title: "Account not verified",
        description: "Please verify your account number first",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Create withdrawal transaction
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          type: 'withdrawal',
          amount: withdrawalAmount,
          status: 'pending',
          description: `Withdrawal to ${bankName} - ${accountNumber}`,
          metadata: {
            bank_name: bankName,
            account_number: accountNumber,
            account_name: accountName
          }
        });

      if (transactionError) throw transactionError;

      // Update user balance
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          balance: balance - withdrawalAmount
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      toast({
        title: "Withdrawal request submitted",
        description: "Your withdrawal request is being processed. You'll be notified once it's complete.",
      });

      // Reset form
      setAmount('');
      setAccountNumber('');
      setBankName('');
      setAccountName('');
      
      onWithdrawalSuccess();
    } catch (error: any) {
      toast({
        title: "Withdrawal failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-l-4 border-l-green-500">
      <CardHeader>
        <CardTitle className="text-green-800 flex items-center gap-2">
          💰 Request Withdrawal
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="amount" className="text-gray-700">Amount (₦)</Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={`Minimum ₦${MINIMUM_WITHDRAWAL.toLocaleString()}`}
              required
              min={MINIMUM_WITHDRAWAL}
              max={balance}
              className="border-green-200 focus:border-green-500"
            />
          </div>
          
          <div>
            <Label htmlFor="bankName" className="text-gray-700">Bank Name</Label>
            <Input
              id="bankName"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              placeholder="e.g., GTBank, First Bank"
              required
              className="border-green-200 focus:border-green-500"
            />
          </div>
          
          <div>
            <Label htmlFor="accountNumber" className="text-gray-700">Account Number</Label>
            <div className="flex gap-2">
              <Input
                id="accountNumber"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="10-digit account number"
                required
                pattern="[0-9]{10}"
                maxLength={10}
                className="border-green-200 focus:border-green-500"
              />
              <Button 
                type="button" 
                onClick={verifyAccountNumber}
                disabled={isVerifyingAccount || !accountNumber || !bankName}
                variant="outline"
              >
                {isVerifyingAccount ? "Verifying..." : "Verify"}
              </Button>
            </div>
          </div>
          
          <div>
            <Label htmlFor="accountName" className="text-gray-700">Account Name</Label>
            <Input
              id="accountName"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              placeholder="Will be auto-filled after verification"
              required
              className="border-green-200 focus:border-green-500 bg-gray-50"
              readOnly
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-green-600 hover:bg-green-700 transition-colors"
            disabled={isLoading || !accountName}
          >
            {isLoading ? "Processing..." : "Submit Withdrawal Request"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default WithdrawalForm;
