
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

// These would be environment variables in a real implementation
const API_KEY = Deno.env.get("RESEND_API_KEY") || "";
const FROM_EMAIL = "noreply@syrianstore.com";

interface GiftCardEmailPayload {
  recipientEmail: string;
  code: string;
  amount: number;
  buyerEmail?: string;
  message?: string;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const { recipientEmail, code, amount, buyerEmail, message }: GiftCardEmailPayload = await req.json();
    
    if (!recipientEmail || !code || !amount) {
      throw new Error("Missing required fields: recipientEmail, code, amount");
    }
    
    // Log the request (would actually send an email in a real implementation)
    console.log(`[GIFT CARD] Sending to: ${recipientEmail}, Code: ${code}, Amount: $${amount}`);
    
    // In a real implementation, you would use an email service like Resend
    // For now, simulate success and log the details
    const emailData = {
      from: FROM_EMAIL,
      to: recipientEmail,
      subject: `Your $${amount} Gift Card from Syrian Hands Store`,
      html: getGiftCardEmailTemplate(code, amount, message),
    };
    
    console.log("[GIFT CARD] Email data:", emailData);
    
    // Return success
    return new Response(
      JSON.stringify({
        success: true,
        message: "Gift card email sent successfully",
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error) {
    console.error("Error in send-gift-card function:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "An error occurred while sending the gift card email",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  }
};

// Email template
function getGiftCardEmailTemplate(code: string, amount: number, message?: string): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h1 style="color: #122567; margin-top: 20px;">Your Gift Card is Ready!</h1>
      </div>
      
      <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h2 style="color: #122567; margin-top: 0;">Gift Card Details</h2>
        <p style="font-size: 18px; margin-bottom: 10px;">Amount: <strong>$${amount}</strong></p>
        <div style="background-color: #122567; color: white; padding: 15px; text-align: center; font-size: 24px; letter-spacing: 2px; border-radius: 6px; margin: 15px 0;">
          ${code}
        </div>
        <p style="color: #666;">Use this code during checkout to apply your gift card balance.</p>
        ${message ? `<p style="font-style: italic; margin-top: 20px;">${message}</p>` : ''}
      </div>
      
      <div style="margin-top: 30px; color: #666; font-size: 14px; text-align: center;">
        <p>Thank you for your purchase!</p>
        <p>If you have any questions, please contact our customer support.</p>
      </div>
    </div>
  `;
}

serve(handler);
