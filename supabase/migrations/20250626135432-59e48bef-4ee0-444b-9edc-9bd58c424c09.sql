
-- Create a payments_for_approval table to track all payments needing admin approval
CREATE TABLE public.payments_for_approval (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  payment_type TEXT NOT NULL CHECK (payment_type IN ('deposit', 'registration')),
  amount NUMERIC NOT NULL,
  paystack_reference TEXT,
  payment_confirmed BOOLEAN DEFAULT false,
  admin_approved BOOLEAN DEFAULT false,
  admin_rejected BOOLEAN DEFAULT false,
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  processed_at TIMESTAMP WITH TIME ZONE,
  reference_id UUID -- Links to deposits.id or profiles.id for registration
);

-- Add RLS policies
ALTER TABLE public.payments_for_approval ENABLE ROW LEVEL SECURITY;

-- Users can view their own payment approval requests
CREATE POLICY "Users can view their own payment approvals" 
  ON public.payments_for_approval 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Only admins can approve/reject payments (we'll handle this in the application logic)
CREATE POLICY "Admins can manage payment approvals" 
  ON public.payments_for_approval 
  FOR ALL 
  USING (true)
  WITH CHECK (true);

-- Create function to process payment approval
CREATE OR REPLACE FUNCTION public.process_payment_approval(
  approval_id UUID,
  approved BOOLEAN,
  admin_notes_text TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  approval_record public.payments_for_approval%ROWTYPE;
  user_profile public.profiles%ROWTYPE;
BEGIN
  -- Get the approval record
  SELECT * INTO approval_record FROM public.payments_for_approval WHERE id = approval_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Payment approval not found';
  END IF;
  
  -- Update approval status
  UPDATE public.payments_for_approval 
  SET 
    admin_approved = approved,
    admin_rejected = NOT approved,
    admin_notes = admin_notes_text,
    processed_at = now(),
    updated_at = now()
  WHERE id = approval_id;
  
  -- If approved, process the payment
  IF approved THEN
    IF approval_record.payment_type = 'deposit' THEN
      -- Update deposit status and user balance
      UPDATE public.deposits 
      SET status = 'approved', updated_at = now()
      WHERE id = approval_record.reference_id;
      
      -- Add to user balance
      UPDATE public.profiles 
      SET 
        balance = balance + approval_record.amount,
        total_earned = total_earned + approval_record.amount,
        updated_at = now()
      WHERE id = approval_record.user_id;
      
      -- Update transaction status
      UPDATE public.transactions 
      SET status = 'completed', updated_at = now()
      WHERE reference_id = approval_record.reference_id::TEXT;
      
    ELSIF approval_record.payment_type = 'registration' THEN
      -- Activate user registration
      UPDATE public.profiles 
      SET 
        registration_fee_paid = true,
        balance = balance + 2500, -- Welcome bonus
        total_earned = total_earned + 2500,
        updated_at = now()
      WHERE id = approval_record.user_id;
      
      -- Create welcome bonus transaction
      INSERT INTO public.transactions (user_id, type, amount, status, description, currency)
      VALUES (
        approval_record.user_id,
        'registration_bonus',
        2500,
        'completed',
        'Welcome bonus for approved registration',
        'NGN'
      );
    END IF;
  END IF;
  
  RETURN true;
END;
$$;

-- Update the handle_new_user trigger to not give welcome bonus immediately
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, phone, balance, total_earned, registration_fee_paid)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'New User'),
    NEW.raw_user_meta_data->>'phone',
    0, -- No welcome bonus until admin approval
    0,
    false -- Registration not paid until admin approval
  );
  
  RETURN NEW;
END;
$$;

-- Create trigger for the updated function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
