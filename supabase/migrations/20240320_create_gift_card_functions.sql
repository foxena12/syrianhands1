-- Function to redeem a gift card
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
    v_user_balance DECIMAL;
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
        RETURNING account_balance INTO v_user_balance;

        -- Return success
        RETURN QUERY SELECT 
            true,
            'Gift card redeemed successfully',
            v_card_value,
            v_user_balance;

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

-- Function to get user's gift card history
CREATE OR REPLACE FUNCTION get_user_gift_card_history(
    p_user_id UUID
) RETURNS TABLE (
    code TEXT,
    value DECIMAL,
    redeemed_at TIMESTAMPTZ
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    RETURN QUERY
    SELECT 
        gc.code,
        gc.value::DECIMAL,
        gc.redeemed_at
    FROM gift_cards gc
    WHERE gc.redeemed_by = p_user_id
    ORDER BY gc.redeemed_at DESC;
END;
$$;

-- Function to get user's current balance
CREATE OR REPLACE FUNCTION get_user_balance(
    p_user_id UUID
) RETURNS DECIMAL LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_balance DECIMAL;
BEGIN
    SELECT account_balance INTO v_balance
    FROM auth.users
    WHERE id = p_user_id;
    
    RETURN COALESCE(v_balance, 0);
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION redeem_gift_card(TEXT, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_gift_card_history(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_balance(UUID) TO authenticated; 