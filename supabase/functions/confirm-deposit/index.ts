
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface DepositConfirmRequest {
  deposit_id: string;
  paystack_reference: string;
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { deposit_id, paystack_reference }: DepositConfirmRequest = await req.json();

    if (!deposit_id || !paystack_reference) {
      throw new Error("Missing deposit_id or paystack_reference");
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    console.log("Confirming deposit:", { deposit_id, paystack_reference });

    // Call the process_deposit_confirmation function
    const { data: success, error } = await supabaseClient.rpc('process_deposit_confirmation', {
      deposit_id,
      paystack_ref: paystack_reference
    });

    if (error) {
      console.error("Error confirming deposit:", error);
      throw error;
    }

    if (!success) {
      throw new Error("Deposit not found or already processed");
    }

    console.log("Deposit confirmed successfully");

    return new Response(
      JSON.stringify({ success: true, message: "Deposit confirmed successfully" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("Error in confirm-deposit function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
