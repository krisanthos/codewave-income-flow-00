
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

    // Check for deposit payment success
    const urlParams = new URLSearchParams(window.location.search);
    const paymentSuccess = urlParams.get('payment_success');
    const depositId = urlParams.get('deposit_id');
    
    if (paymentSuccess === 'true' && depositId) {
      handleDepositPaymentSuccess(depositId);
    }
  }, [user, navigate]);

  const handleDepositPaymentSuccess = async (depositId: string) => {
    try {
      // Create payment approval record for deposit
      const { error: approvalError } = await supabase
        .from('payments_for_approval')
        .insert({
          user_id: user?.id,
          payment_type: 'deposit',
          amount: parseFloat(amount || '0'),
          payment_confirmed: true,
          reference_id: depositId
        });

      if (approvalError) throw approvalError;

      toast({
        title: "Deposit payment confirmed!",
        description: "Your deposit has been submitted for admin approval. Funds will be added once approved.",
      });

      // Clear URL parameters
      window.history.replaceState({}, '', window.location.pathname);
      setAmount('');
    } catch (error: any) {
      console.error('Deposit confirmation error:', error);
      toast({
        title: "Error",
        description: "Failed to confirm deposit: " + error.message,
        variant: "destructive",
      });
    }
  };

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

      // Create deposit record with pending status
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

      // Create transaction record with pending status
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          type: 'deposit',
          amount: depositAmount,
          status: 'pending',
          description: `Deposit via Paystack - Tax: ₦${taxAmount.toFixed(2)} - Requires admin approval`,
          currency: 'NGN',
          reference_id: depositData.id
        });

      if (transactionError) throw transactionError;

      toast({
        title: "Redirecting to payment",
        description: "Complete payment for admin review and approval",
      });

      // Create Paystack payment URL with amount in kobo (multiply by 100)
      const paystackAmount = Math.round(depositAmount * 100);
      const returnUrl = encodeURIComponent(`${window.location.origin}/deposit?payment_success=true&deposit_id=${depositData.id}`);
      const paystackUrl = `${PAYSTACK_BASE_LINK}?amount=${paystackAmount}&currency=NGN&reference=${depositData.id}&email=${user.email}&callback_url=${returnUrl}`;
      
      // Redirect to Paystack
      window.location.href = paystackUrl;

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
                  Deposit funds to earn 2.5% daily returns per ₦10,000 (requires admin approval)
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
                        <span>Net Deposit (Pending Approval):</span>
                        <span className="text-orange-600">₦{netAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm text-blue-600 border-t pt-2">
                        <span>Daily Earnings (After Approval):</span>
                        <span>₦{((netAmount / 10000) * 0.025 * 10000).toFixed(2)}</span>
                      </div>
                    </div>
                  )}

                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                    <p className="text-sm text-yellow-800">
                      ⚠️ All deposits require admin approval before funds are added to your balance
                    </p>
                  </div>

                  <Button 
                    onClick={handleDeposit} 
                    className="w-full" 
                    disabled={isLoading || !amount || depositAmount <= 0}
                  >
                    {isLoading ? "Processing..." : "Pay & Submit for Approval"}
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
                    <p className="text-sm text-gray-600">Deposits require admin approval after payment confirmation</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Example</h4>
                    <p className="text-sm text-gray-600">₦10,000 deposit = ₦250 daily earnings (after approval)</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Admin Approval Process</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                    <h4 className="font-medium text-blue-800">How it works:</h4>
                    <ol className="text-sm text-blue-700 mt-2 space-y-1">
                      <li>1. Complete payment via Paystack</li>
                      <li>2. Admin reviews your payment</li>
                      <li>3. Once approved, funds are added to your balance</li>
                      <li>4. Daily earnings start immediately after approval</li>
                    </ol>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tax Calculation Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="bg-green-50 border border-green-200 rounded-md p-3">
                    <h4 className="font-medium text-green-800">First-Time Users</h4>
                    <p className="text-sm text-green-700">
                      • First ₦5,000 is completely tax-free
                      • 3% tax only applies to amounts above ₦5,000
                      • Example: ₦10,000 deposit = ₦150 tax (3% of ₦5,000)
                    </p>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                    <h4 className="font-medium text-blue-800">Subsequent Deposits</h4>
                    <p className="text-sm text-blue-700">
                      • 3% tax applies to the full deposit amount
                      • Example: ₦10,000 deposit = ₦300 tax
                    </p>
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
                  Your payment is secured by Paystack. After successful payment, your deposit will be submitted for admin approval.
                  Funds will be added to your balance once the admin approves your deposit.
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
