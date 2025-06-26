
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, CreditCard, DollarSign, AlertTriangle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import BankAccountSelector from '@/components/BankAccountSelector';

interface BankAccount {
  id: string;
  bank_name: string;
  account_number: string;
  account_name: string;
  is_verified: boolean;
}

const Withdrawal = () => {
  const [selectedAccount, setSelectedAccount] = useState<BankAccount | null>(null);
  const [amount, setAmount] = useState('');
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const WITHDRAWAL_LIMIT = 21450; // Updated to ₦21,450

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchUserProfile = async () => {
      try {
        const { data, error } = await supabase.rpc('get_current_user_profile');
        if (error) throw error;
        if (data && data.length > 0) {
          setUserProfile(data[0]);
        }
      } catch (error: any) {
        console.error("Error fetching user profile:", error);
        toast({
          title: "Error",
          description: "Failed to load profile. Please refresh the page.",
          variant: "destructive",
        });
      }
    };

    fetchUserProfile();
  }, [user, navigate]);

  const handleWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedAccount || !amount) return;

    const withdrawalAmount = parseFloat(amount);

    if (withdrawalAmount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid withdrawal amount",
        variant: "destructive",
      });
      return;
    }

    if (withdrawalAmount < WITHDRAWAL_LIMIT) {
      toast({
        title: "Amount below minimum",
        description: `Minimum withdrawal amount is ₦${WITHDRAWAL_LIMIT.toLocaleString()}`,
        variant: "destructive",
      });
      return;
    }

    if (withdrawalAmount > (userProfile?.balance || 0)) {
      toast({
        title: "Insufficient balance",
        description: `You don't have enough balance for this withdrawal. Your current balance is ₦${(userProfile?.balance || 0).toLocaleString()}`,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Use the withdrawal function that validates minimum amount and balance
      const { data: withdrawalId, error: withdrawalError } = await supabase
        .rpc('create_withdrawal_request', {
          withdrawal_amount: withdrawalAmount,
          bank_account_id: selectedAccount.id
        });

      if (withdrawalError) throw withdrawalError;

      // Create transaction record
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          type: 'withdrawal',
          amount: withdrawalAmount,
          status: 'pending',
          description: `Withdrawal to ${selectedAccount.bank_name} - ${selectedAccount.account_number}`,
          currency: 'NGN'
        });

      if (transactionError) throw transactionError;

      toast({
        title: "Withdrawal request submitted",
        description: "Your withdrawal request has been sent to admin for processing.",
      });

      // Reset form
      setAmount('');
      setSelectedAccount(null);
      
      // Navigate back to dashboard
      navigate('/dashboard');
    } catch (error: any) {
      console.error("Withdrawal error:", error);
      toast({
        title: "Withdrawal failed",
        description: error.message || "An error occurred while processing your withdrawal",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!userProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700">Loading...</h2>
        </div>
      </div>
    );
  }

  const canWithdraw = (userProfile?.balance || 0) >= WITHDRAWAL_LIMIT;

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
              <h1 className="text-xl font-semibold text-gray-900">Withdraw Funds</h1>
            </div>
            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
              ₦{(userProfile.balance || 0).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Insufficient Balance Warning */}
        {!canWithdraw && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="flex items-center text-red-800">
                <AlertTriangle className="mr-2" size={20} />
                Insufficient Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-700 mb-2">
                Your current balance (₦{(userProfile.balance || 0).toLocaleString()}) is below the minimum withdrawal amount of ₦{WITHDRAWAL_LIMIT.toLocaleString()}.
              </p>
              <p className="text-red-600 text-sm">
                Please make a deposit or complete more tasks to increase your balance before requesting a withdrawal.
              </p>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Bank Account Selection */}
          <div>
            <BankAccountSelector onAccountSelected={setSelectedAccount} />
          </div>

          {/* Withdrawal Form */}
          <div>
            {selectedAccount ? (
              <Card className={!canWithdraw ? "opacity-50" : ""}>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <DollarSign className="mr-2 h-5 w-5" />
                    Withdrawal Amount
                  </CardTitle>
                  <CardDescription>
                    Withdrawing to {selectedAccount.bank_name} - {selectedAccount.account_number}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleWithdrawal} className="space-y-4">
                    <div>
                      <Label htmlFor="amount">Amount (₦)</Label>
                      <Input
                        id="amount"
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder={`Minimum ₦${WITHDRAWAL_LIMIT.toLocaleString()}`}
                        required
                        min={WITHDRAWAL_LIMIT}
                        max={userProfile.balance || 0}
                        disabled={!canWithdraw}
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Available: ₦{(userProfile.balance || 0).toLocaleString()}
                      </p>
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={isLoading || !canWithdraw}
                    >
                      {isLoading ? "Processing..." : "Submit Withdrawal Request"}
                    </Button>
                    
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="w-full"
                      onClick={() => setSelectedAccount(null)}
                      disabled={!canWithdraw}
                    >
                      Change Bank Account
                    </Button>
                  </form>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Select Bank Account</CardTitle>
                  <CardDescription>
                    Please select or add a bank account to proceed with withdrawal
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center text-gray-500">
                    <CreditCard className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                    <p>Select a bank account from the left panel to continue</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Withdrawal Info */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Withdrawal Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <h4 className="font-medium text-gray-900">Processing Time</h4>
                <p className="text-gray-600">Admin review required</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Minimum Amount</h4>
                <p className="text-gray-600">₦{WITHDRAWAL_LIMIT.toLocaleString()}</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Available Balance</h4>
                <p className="text-gray-600">₦{(userProfile.balance || 0).toLocaleString()}</p>
              </div>
            </div>
            
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">How Withdrawals Work:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Minimum withdrawal amount is ₦{WITHDRAWAL_LIMIT.toLocaleString()}</li>
                <li>• Your withdrawal request will be sent to the admin dashboard</li>
                <li>• Admin will review and process your request</li>
                <li>• The amount will be deducted from your balance immediately</li>
                <li>• You'll be notified once the transfer is completed</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Withdrawal;
