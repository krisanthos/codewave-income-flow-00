
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

const MINIMUM_WITHDRAWAL = 65000; // ₦65,000 minimum withdrawal

const WithdrawalForm = ({ balance, onWithdrawalSuccess }: { 
  balance: number; 
  onWithdrawalSuccess: () => void; 
}) => {
  const [amount, setAmount] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountName, setAccountName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

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

      // Update user balance using raw SQL to handle new columns
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          balance: balance - withdrawalAmount
        } as any)
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
            <Input
              id="accountNumber"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              placeholder="10-digit account number"
              required
              pattern="[0-9]{10}"
              className="border-green-200 focus:border-green-500"
            />
          </div>
          
          <div>
            <Label htmlFor="accountName" className="text-gray-700">Account Name</Label>
            <Input
              id="accountName"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              placeholder="Account holder's name"
              required
              className="border-green-200 focus:border-green-500"
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-green-600 hover:bg-green-700 transition-colors"
            disabled={isLoading}
          >
            {isLoading ? "Processing..." : "Submit Withdrawal Request"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default WithdrawalForm;
