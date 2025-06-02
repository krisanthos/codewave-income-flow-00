
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, TrendingUp, Info } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

const Deposit = () => {
  const [amount, setAmount] = useState('');
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const PAYSTACK_BASE_LINK = "https://paystack.shop/pay/cb5bkq1xb5";
  const TAX_RATE = 0.03; // 3% tax

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

  const calculateTaxAndNet = (depositAmount: number) => {
    // No tax for amounts up to 5000 for new users, or if total_earned is 0
    const isFirstDeposit = (userProfile?.total_earned || 0) === 0;
    const shouldApplyTax = !isFirstDeposit || depositAmount > 5000;
    
    let taxAmount = 0;
    let netAmount = depositAmount;

    if (shouldApplyTax) {
      if (isFirstDeposit) {
        // Tax only on amount above 5000
        const taxableAmount = Math.max(0, depositAmount - 5000);
        taxAmount = taxableAmount * TAX_RATE;
      } else {
        // Tax on full amount for subsequent deposits
        taxAmount = depositAmount * TAX_RATE;
      }
      netAmount = depositAmount - taxAmount;
    }

    return { taxAmount, netAmount };
  };

  const handleDeposit = async () => {
    if (!amount || !user) return;

    const depositAmount = parseFloat(amount);
    if (depositAmount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid deposit amount",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { taxAmount, netAmount } = calculateTaxAndNet(depositAmount);

      // Create deposit record
      const { data: depositData, error: depositError } = await supabase
        .from('deposits')
        .insert({
          user_id: user.id,
          amount: depositAmount,
          tax_amount: taxAmount,
          net_amount: netAmount,
          status: 'pending'
        })
        .select()
        .single();

      if (depositError) throw depositError;

      // Create transaction record
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          type: 'deposit',
          amount: depositAmount,
          status: 'pending',
          description: `Deposit via Paystack - Tax: ₦${taxAmount.toFixed(2)}`,
          currency: 'NGN',
          reference_id: depositData.id
        });

      if (transactionError) throw transactionError;

      toast({
        title: "Redirecting to payment",
        description: "You will be redirected to complete your deposit",
      });

      // Create Paystack payment URL with amount in kobo (multiply by 100)
      const paystackAmount = Math.round(depositAmount * 100);
      const paystackUrl = `${PAYSTACK_BASE_LINK}?amount=${paystackAmount}&currency=NGN&reference=${depositData.id}&email=${user.email}`;
      
      // Redirect to Paystack
      window.open(paystackUrl, '_blank');

      // Navigate back to dashboard after a short delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);

    } catch (error: any) {
      toast({
        title: "Deposit failed",
        description: error.message,
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

  const depositAmount = parseFloat(amount) || 0;
  const { taxAmount, netAmount } = calculateTaxAndNet(depositAmount);
  const isFirstDeposit = (userProfile?.total_earned || 0) === 0;

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
              <h1 className="text-xl font-semibold text-gray-900">Deposit Funds</h1>
            </div>
            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
              ₦{(userProfile.balance || 0).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Deposit Form */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="mr-2 h-5 w-5" />
                  Make Deposit
                </CardTitle>
                <CardDescription>
                  Deposit funds to earn 2.5% daily returns per ₦10,000
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="amount">Deposit Amount (₦)</Label>
                    <Input
                      id="amount"
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="Enter deposit amount"
                      min="1"
                    />
                  </div>

                  {depositAmount > 0 && (
                    <div className="space-y-2 p-4 bg-gray-50 rounded-lg">
                      <div className="flex justify-between text-sm">
                        <span>Deposit Amount:</span>
                        <span>₦{depositAmount.toLocaleString()}</span>
                      </div>
                      {taxAmount > 0 && (
                        <div className="flex justify-between text-sm text-red-600">
                          <span>Tax (3%):</span>
                          <span>-₦{taxAmount.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-medium border-t pt-2">
                        <span>Net Deposit:</span>
                        <span className="text-green-600">₦{netAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm text-blue-600 border-t pt-2">
                        <span>Daily Earnings (2.5%):</span>
                        <span>₦{((netAmount / 10000) * 0.025 * 10000).toFixed(2)}</span>
                      </div>
                    </div>
                  )}

                  <Button 
                    onClick={handleDeposit} 
                    className="w-full" 
                    disabled={isLoading || !amount || depositAmount <= 0}
                  >
                    {isLoading ? "Processing..." : "Proceed to Payment"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Deposit Information */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Info className="mr-2 h-5 w-5" />
                  Deposit Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900">Daily Returns</h4>
                    <p className="text-sm text-gray-600">Earn 2.5% daily returns for every ₦10,000 deposited</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Tax Policy</h4>
                    <p className="text-sm text-gray-600">
                      {isFirstDeposit 
                        ? "First ₦5,000 is tax-free, 3% tax on amounts above ₦5,000"
                        : "3% tax applies to all deposits"
                      }
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Processing Time</h4>
                    <p className="text-sm text-gray-600">Deposits are processed instantly after payment confirmation</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Example</h4>
                    <p className="text-sm text-gray-600">₦10,000 deposit = ₦250 daily earnings</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Your Deposit History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center text-gray-500">
                  <p>Total Deposited: ₦{(userProfile.total_earned || 0).toLocaleString()}</p>
                  <p className="text-sm mt-1">Current Balance: ₦{(userProfile.balance || 0).toLocaleString()}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Payment Method */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Secure Payment via Paystack</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">
                  Your payment is secured by Paystack. You'll be redirected to complete the transaction.
                </p>
              </div>
              <div className="text-right">
                <div className="font-medium text-green-600">SSL Secured</div>
                <div className="text-xs text-gray-500">256-bit encryption</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Deposit;
