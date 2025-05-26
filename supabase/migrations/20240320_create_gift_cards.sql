-- Create enum for gift card status
CREATE TYPE gift_card_status AS ENUM ('inactive', 'active', 'redeemed');

-- Create enum for gift card values
CREATE TYPE gift_card_value AS ENUM ('10', '20', '25', '30', '50', '75', '100', '150');

-- Create the gift_cards table
CREATE TABLE gift_cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    value gift_card_value NOT NULL,
    status gift_card_status NOT NULL DEFAULT 'inactive',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID NOT NULL REFERENCES auth.users(id),
    activated_at TIMESTAMPTZ,
    redeemed_at TIMESTAMPTZ,
    redeemed_by UUID REFERENCES auth.users(id),
    note TEXT,
    
    -- Add constraints
    CONSTRAINT valid_activation CHECK (
        (status = 'inactive' AND activated_at IS NULL) OR
        (status IN ('active', 'redeemed') AND activated_at IS NOT NULL)
    ),
    CONSTRAINT valid_redemption CHECK (
        (status IN ('inactive', 'active') AND redeemed_at IS NULL AND redeemed_by IS NULL) OR
        (status = 'redeemed' AND redeemed_at IS NOT NULL AND redeemed_by IS NOT NULL)
    )
);

-- Create indexes
CREATE INDEX idx_gift_cards_code ON gift_cards(code);
CREATE INDEX idx_gift_cards_status ON gift_cards(status);
CREATE INDEX idx_gift_cards_created_by ON gift_cards(created_by);
CREATE INDEX idx_gift_cards_redeemed_by ON gift_cards(redeemed_by);

-- Add account_balance to users profile
ALTER TABLE auth.users 
ADD COLUMN IF NOT EXISTS account_balance DECIMAL(10,2) NOT NULL DEFAULT 0.00;

-- Create table for gift card redemption history
CREATE TABLE gift_card_redemptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gift_card_id UUID NOT NULL REFERENCES gift_cards(id),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    redeemed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    value gift_card_value NOT NULL,
    
    CONSTRAINT unique_redemption UNIQUE (gift_card_id)
);

-- Create index for redemption history
CREATE INDEX idx_gift_card_redemptions_user ON gift_card_redemptions(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE gift_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE gift_card_redemptions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can do everything on gift_cards" ON gift_cards
    FOR ALL
    TO authenticated
    USING (auth.jwt() ->> 'role' = 'admin')
    WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Users can view active gift cards" ON gift_cards
    FOR SELECT
    TO authenticated
    USING (status = 'active' OR auth.uid() = created_by OR auth.uid() = redeemed_by);

CREATE POLICY "Users can view their own redemptions" ON gift_card_redemptions
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

-- Create function to activate gift card
CREATE OR REPLACE FUNCTION activate_gift_card(
    p_card_id UUID,
    p_admin_id UUID
) RETURNS TABLE (
    success BOOLEAN,
    message TEXT
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    -- Check if admin
    IF NOT EXISTS (
        SELECT 1 FROM auth.users 
        WHERE id = p_admin_id 
        AND (raw_user_meta_data->>'role')::text = 'admin'
    ) THEN
        RETURN QUERY SELECT false, 'Unauthorized: Admin access required';
        RETURN;
    END IF;

    -- Activate the card
    UPDATE gift_cards
    SET 
        status = 'active',
        activated_at = NOW()
    WHERE 
        id = p_card_id 
        AND status = 'inactive';

    IF FOUND THEN
        RETURN QUERY SELECT true, 'Gift card activated successfully';
    ELSE
        RETURN QUERY SELECT false, 'Gift card not found or already activated';
    END IF;
END;
$$;

-- Create function to redeem gift card
CREATE OR REPLACE FUNCTION redeem_gift_card(
    p_code TEXT,
    p_user_id UUID
) RETURNS TABLE (
    success BOOLEAN,
    message TEXT,
    value DECIMAL,
    new_balance DECIMAL
) LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_card_id UUID;
    v_card_value DECIMAL;
BEGIN
    -- Start transaction
    BEGIN
        -- Try to find and lock the gift card
        SELECT id, value::DECIMAL INTO v_card_id, v_card_value
        FROM gift_cards
        WHERE code = p_code
        AND status = 'active'
        FOR UPDATE;

        IF NOT FOUND THEN
            RETURN QUERY SELECT 
                false,
                'Invalid or inactive gift card code',
                0::DECIMAL,
                0::DECIMAL;
            RETURN;
        END IF;

        -- Update the gift card
        UPDATE gift_cards
        SET 
            status = 'redeemed',
            redeemed_at = NOW(),
            redeemed_by = p_user_id
        WHERE id = v_card_id;

        -- Add redemption record
        INSERT INTO gift_card_redemptions (
            gift_card_id,
            user_id,
            value
        ) VALUES (
            v_card_id,
            p_user_id,
            v_card_value::gift_card_value
        );

        -- Update user balance
        UPDATE auth.users
        SET account_balance = account_balance + v_card_value
        WHERE id = p_user_id
        RETURNING account_balance INTO v_card_value;

        -- Return success
        RETURN QUERY SELECT 
            true,
            'Gift card redeemed successfully',
            v_card_value,
            v_card_value;

    EXCEPTION WHEN OTHERS THEN
        -- Return error
        RETURN QUERY SELECT 
            false,
            'Error redeeming gift card: ' || SQLERRM,
            0::DECIMAL,
            0::DECIMAL;
    END;
END;
$$; 