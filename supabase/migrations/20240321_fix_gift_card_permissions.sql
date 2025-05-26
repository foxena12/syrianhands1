-- Drop existing function if it exists
DROP FUNCTION IF EXISTS activate_gift_card(UUID, UUID);

-- Recreate the function with proper error handling and transaction management
CREATE OR REPLACE FUNCTION activate_gift_card(
    p_card_id UUID,
    p_admin_id UUID
) RETURNS TABLE (
    success BOOLEAN,
    message TEXT
) LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_card_status gift_card_status;
BEGIN
    -- Start transaction
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

        -- Check if gift card exists and get its status
        SELECT status INTO v_card_status
        FROM gift_cards
        WHERE id = p_card_id
        FOR UPDATE;

        IF NOT FOUND THEN
            RETURN QUERY SELECT false, 'Gift card not found';
            RETURN;
        END IF;

        -- Check current status
        CASE v_card_status
            WHEN 'active' THEN
                RETURN QUERY SELECT false, 'Gift card is already activated';
                RETURN;
            WHEN 'redeemed' THEN
                RETURN QUERY SELECT false, 'Gift card has already been redeemed';
                RETURN;
            ELSE
                -- Activate the card
                UPDATE gift_cards
                SET 
                    status = 'active',
                    activated_at = NOW()
                WHERE id = p_card_id;

                RETURN QUERY SELECT true, 'Gift card activated successfully';
        END CASE;

    EXCEPTION 
        WHEN OTHERS THEN
            -- Roll back transaction
            RAISE NOTICE 'Rolling back transaction: %', SQLERRM;
            RETURN QUERY SELECT false, 'Error activating gift card: ' || SQLERRM;
    END;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION activate_gift_card(UUID, UUID) TO authenticated;

-- Add comment to function
COMMENT ON FUNCTION activate_gift_card(UUID, UUID) IS 'Activates a gift card. Only admins can activate cards. Returns success status and message.'; 