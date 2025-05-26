import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json'
};

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Valid gift card values
const VALID_VALUES = [10, 20, 25, 30, 50, 75, 100, 150] as const;
type GiftCardValue = typeof VALID_VALUES[number];

// Generate a unique gift card code
function generateGiftCardCode(): string {
  const prefix = 'GC';
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const segments = [
    Array(4).fill(0).map(() => chars[Math.floor(Math.random() * chars.length)]).join(''),
    Array(4).fill(0).map(() => chars[Math.floor(Math.random() * chars.length)]).join(''),
    Array(4).fill(0).map(() => chars[Math.floor(Math.random() * chars.length)]).join(''),
  ];
  return `${prefix}-${segments.join('-')}`;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      status: 204,
      headers: corsHeaders 
    });
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Method not allowed' 
      }),
      { 
        status: 405,
        headers: corsHeaders
      }
    );
  }

  try {
    const { value, quantity = 1, note, createdBy } = await req.json();

    // Validate value
    if (!value || !VALID_VALUES.includes(value)) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Invalid value. Must be one of: ${VALID_VALUES.join(', ')}` 
        }),
        { 
          status: 400,
          headers: corsHeaders
        }
      );
    }

    // Validate quantity
    if (quantity <= 0 || quantity > 100) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid quantity. Must be between 1 and 100' 
        }),
        { 
          status: 400,
          headers: corsHeaders
        }
      );
    }

    // Validate creator
    if (!createdBy) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Creator ID is required' 
        }),
        { 
          status: 400,
          headers: corsHeaders
        }
      );
    }

    const cards = [];
    const now = new Date();

    // Generate the specified number of gift cards
    for (let i = 0; i < quantity; i++) {
      let code = generateGiftCardCode();
      let isUnique = false;

      // Keep generating codes until we get a unique one
      while (!isUnique) {
        const { data: existing } = await supabase
          .from('gift_cards')
          .select('code')
          .eq('code', code)
          .single();

        if (!existing) {
          isUnique = true;
        } else {
          code = generateGiftCardCode();
        }
      }

      cards.push({
        code,
        value,
        status: 'inactive',
        created_at: now.toISOString(),
        created_by: createdBy,
        note,
      });
    }

    // Insert the gift cards into the database
    const { error: insertError } = await supabase
      .from('gift_cards')
      .insert(cards);

    if (insertError) {
      console.error('Database insertion error:', insertError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Failed to create gift cards' 
        }),
        { 
          status: 500,
          headers: corsHeaders
        }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Successfully generated ${quantity} gift card(s)`,
        data: cards
      }),
      { 
        status: 200,
        headers: corsHeaders
      }
    );

  } catch (error) {
    console.error('Error in generate-gift-cards function:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Internal server error'
      }),
      { 
        status: error.status || 500,
        headers: corsHeaders
      }
    );
  }
}); 