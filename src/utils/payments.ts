/**
 * Payment utility functions for the application
 * Now integrated with Supabase for user management
 * ✌️ Setting up payment utilities with style 🥀
 */

import { supabase } from "@/integrations/supabase/client";

// ✌️ Test mode flag - set to true for testing 💔
export const TEST_MODE = true;

/**
 * Opens the Paystack payment page for subsequent payments (withdrawals, etc.)
 * ✌️ Processing payments like a boss 🥀
 */
export const initiateSubsequentPayment = () => {
  if (TEST_MODE) {
    console.log('TEST MODE: Bypassing payment ✌️');
    return;
  }
  window.open('https://paystack.shop/pay/cb5bkq1xb5', '_blank');
};

/**
 * Processes a withdrawal request
 * @param amount Amount to withdraw
 * @param accountDetails Bank account details
 * ✌️ Handling withdrawals with precision 💔
 */
export const processWithdrawal = async (amount: number, accountDetails: any) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated ❤️‍🩹');
    }

    // ✌️ Get user profile to check balance 🥀
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('balance')
      .eq('id', user.id)
      .single();

    if (profileError) throw profileError;

    if (!profile || profile.balance < amount) {
      throw new Error('Insufficient balance 💔');
    }

    // ✌️ Create withdrawal transaction 🥀
    const { error: transactionError } = await supabase
      .from('transactions')
      .insert({
        user_id: user.id,
        type: 'withdrawal',
        amount: -amount,
        status: 'pending',
        description: `Withdrawal to ${accountDetails.bankName} - ${accountDetails.accountNumber}`,
        currency: 'NGN',
        metadata: accountDetails
      });

    if (transactionError) throw transactionError;

    // ✌️ Update user balance ❤️‍🩹
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ balance: profile.balance - amount })
      .eq('id', user.id);

    if (updateError) throw updateError;

    return { success: true };
  } catch (error) {
    console.error('Withdrawal error ✌️:', error);
    return { success: false, error };
  }
};

/**
 * Gets user balance from Supabase
 * ✌️ Fetching balance with style 💔
 */
export const getUserBalance = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated 🥀');
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('balance, total_earned')
      .eq('id', user.id)
      .single();

    if (error) throw error;

    return { 
      success: true, 
      balance: profile?.balance || 0,
      totalEarned: profile?.total_earned || 0
    };
  } catch (error) {
    console.error('Get balance error ✌️:', error);
    return { success: false, error };
  }
};

/**
 * Legacy functions - kept for compatibility but now handled by Supabase
 * ✌️ Legacy support with modern functionality ❤️‍🩹
 */
export const initiateRegistrationPayment = () => {
  console.log('Registration now handled directly through Supabase Auth 🥀');
};

export const completeRegistrationAfterPayment = () => {
  console.log('Registration completion now handled by Supabase trigger 💔');
  return { success: true };
};

export const hasPendingRegistration = () => {
  return false; // ✌️ No longer needed with Supabase 🥀
};
