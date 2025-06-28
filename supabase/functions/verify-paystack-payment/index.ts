
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PaymentVerificationRequest {
  reference: string;
  userData: {
    email: string;
    password: string;
    fullName: string;
    phoneNumber: string;
  };
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { reference, userData }: PaymentVerificationRequest = await req.json();
    
    console.log('Verifying payment with reference:', reference);
    
    // Verify payment with Paystack
    const paystackResponse = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('PAYSTACK_SECRET_KEY')}`,
        'Content-Type': 'application/json',
      },
    });

    const paystackData = await paystackResponse.json();
    
    console.log('Paystack verification response:', paystackData);

    if (!paystackData.status || paystackData.data.status !== 'success') {
      return new Response(
        JSON.stringify({ success: false, error: 'Payment not successful' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if payment amount is correct (5000 Naira = 500000 kobo)
    if (paystackData.data.amount < 500000) {
      return new Response(
        JSON.stringify({ success: false, error: 'Payment amount insufficient' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client with service role key for admin operations
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('email')
      .eq('email', userData.email)
      .single();

    if (existingUser) {
      return new Response(
        JSON.stringify({ success: false, error: 'Account with this email already exists' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create user account
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: userData.email,
      password: userData.password,
      email_confirm: false, // We'll send verification email manually
      user_metadata: {
        full_name: userData.fullName,
        phone: userData.phoneNumber,
      }
    });

    if (authError || !authData.user) {
      console.error('Auth error:', authError);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to create user account' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create payment approval record (pre-approved since payment is verified)
    const { error: approvalError } = await supabase
      .from('payments_for_approval')
      .insert({
        user_id: authData.user.id,
        payment_type: 'registration',
        amount: 5000,
        payment_confirmed: true,
        admin_approved: true, // Auto-approve since payment is verified
        paystack_reference: reference,
        processed_at: new Date().toISOString()
      });

    if (approvalError) {
      console.error('Approval record error:', approvalError);
    }

    // Update user profile to mark registration as paid and add welcome bonus
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        registration_fee_paid: true,
        balance: 2500, // Welcome bonus
        total_earned: 2500,
      })
      .eq('id', authData.user.id);

    if (profileError) {
      console.error('Profile update error:', profileError);
    }

    // Create welcome bonus transaction
    const { error: transactionError } = await supabase
      .from('transactions')
      .insert({
        user_id: authData.user.id,
        type: 'registration_bonus',
        amount: 2500,
        status: 'completed',
        description: 'Welcome bonus for approved registration',
        currency: 'NGN'
      });

    if (transactionError) {
      console.error('Transaction error:', transactionError);
    }

    // Send email verification
    const { error: emailError } = await supabase.auth.admin.generateLink({
      type: 'signup',
      email: userData.email,
      options: {
        redirectTo: `${req.headers.get('origin') || 'http://localhost:3000'}/auth?confirmed=true`
      }
    });

    if (emailError) {
      console.error('Email verification error:', emailError);
    }

    console.log('User account created and verified successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Payment verified and account created. Please check your email for verification link.' 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error: any) {
    console.error('Payment verification error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
};

serve(handler);
