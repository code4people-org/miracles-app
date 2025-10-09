-- Add content filtering infrastructure
-- This migration adds server-side content validation and violation tracking

-- Create content violations table
CREATE TABLE IF NOT EXISTS public.content_violations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    content_type TEXT NOT NULL, -- 'miracle' or 'prayer_request'
    violation_type TEXT NOT NULL, -- 'inappropriate_word', 'spam_pattern', etc.
    flagged_content TEXT,
    content_id UUID, -- Reference to the actual content
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for content violations
CREATE INDEX IF NOT EXISTS idx_content_violations_user_id ON public.content_violations(user_id);
CREATE INDEX IF NOT EXISTS idx_content_violations_content_type ON public.content_violations(content_type);
CREATE INDEX IF NOT EXISTS idx_content_violations_violation_type ON public.content_violations(violation_type);
CREATE INDEX IF NOT EXISTS idx_content_violations_created_at ON public.content_violations(created_at DESC);

-- Enhanced content validation function
CREATE OR REPLACE FUNCTION validate_content_content()
RETURNS TRIGGER AS $$
DECLARE
    inappropriate_words TEXT[] := ARRAY[
        -- English spam and commercial terms
        'spam', 'scam', 'fake', 'clickbait', 'buy now', 'click here',
        'free money', 'get rich', 'make money fast', 'work from home',
        'crypto investment', 'bitcoin', 'forex trading', 'investment opportunity',
        'guaranteed profit', 'risk-free', 'limited time offer', 'act now',
        'call now', 'text me', 'email me', 'contact me immediately',
        
        -- Spanish commercial terms
        'compra', 'vende', 'comprar', 'vender', 'propiedad', 'inmueble',
        'inversión', 'dinero fácil', 'ganar dinero', 'trabajo desde casa',
        'oportunidad de negocio', 'oferta limitada', 'llama ahora',
        'contacta', 'escribeme', 'llamame', 'inversión garantizada',
        
        -- French commercial terms
        'acheter', 'vendre', 'propriété', 'immobilier', 'investissement',
        'argent facile', 'gagner de l''argent', 'travail à domicile',
        'opportunité d''affaires', 'offre limitée', 'appelez maintenant',
        
        -- German commercial terms
        'kaufen', 'verkaufen', 'immobilie', 'investition', 'geld verdienen',
        'arbeit von zuhause', 'geschäftsmöglichkeit', 'begrenztes angebot',
        
        -- Italian commercial terms
        'comprare', 'vendere', 'proprietà', 'immobiliare', 'investimento',
        'guadagnare soldi', 'lavoro da casa', 'opportunità di business',
        
        -- Portuguese commercial terms
        'comprar', 'vender', 'propriedade', 'imóvel', 'investimento',
        'ganhar dinheiro', 'trabalho em casa', 'oportunidade de negócio',
        
        -- Suspicious patterns
        'urgent', 'immediate', 'quick cash', 'easy money',
        
        -- Add more as needed based on your community standards
        'mlm', 'pyramid scheme', 'multi level marketing',
        'get rich quick', 'passive income', 'side hustle',
        'affiliate marketing', 'click here now', 'limited time',
        'exclusive offer', 'secret method', 'proven system'
    ];
    word TEXT;
    content_text TEXT;
    url_count INTEGER;
    caps_ratio FLOAT;
    special_char_ratio FLOAT;
BEGIN
    content_text := LOWER(NEW.title || ' ' || NEW.description);
    
    -- Check for inappropriate words
    FOREACH word IN ARRAY inappropriate_words
    LOOP
        IF content_text LIKE '%' || word || '%' THEN
            -- Log the attempt
            INSERT INTO content_violations (
                user_id, 
                content_type, 
                violation_type, 
                flagged_content,
                content_id,
                created_at
            ) VALUES (
                NEW.user_id,
                CASE WHEN TG_TABLE_NAME = 'miracles' THEN 'miracle' ELSE 'prayer_request' END,
                'inappropriate_word',
                word,
                NEW.id,
                NOW()
            );
            
            -- Set requires review
            NEW.is_approved := false;
            EXIT;
        END IF;
    END LOOP;
    
    -- Check for excessive URLs
    url_count := (SELECT COUNT(*) FROM regexp_split_to_table(content_text, 'https?://[^\s]+'));
    IF url_count > 2 THEN
        INSERT INTO content_violations (
            user_id, 
            content_type, 
            violation_type, 
            flagged_content,
            content_id,
            created_at
        ) VALUES (
            NEW.user_id,
            CASE WHEN TG_TABLE_NAME = 'miracles' THEN 'miracle' ELSE 'prayer_request' END,
            'excessive_urls',
            'Found ' || url_count || ' URLs',
            NEW.id,
            NOW()
        );
        NEW.is_approved := false;
    END IF;
    
    -- Check for excessive special characters (potential spam)
    special_char_ratio := (SELECT LENGTH(content_text) - LENGTH(REGEXP_REPLACE(content_text, '[^a-zA-Z0-9\s]', '', 'g')))::FLOAT / LENGTH(content_text);
    IF special_char_ratio > 0.3 THEN
        INSERT INTO content_violations (
            user_id, 
            content_type, 
            violation_type, 
            flagged_content,
            content_id,
            created_at
        ) VALUES (
            NEW.user_id,
            CASE WHEN TG_TABLE_NAME = 'miracles' THEN 'miracle' ELSE 'prayer_request' END,
            'excessive_special_chars',
            'Special character ratio: ' || ROUND(special_char_ratio * 100, 2) || '%',
            NEW.id,
            NOW()
        );
        NEW.is_approved := false;
    END IF;
    
    -- Check for excessive caps
    caps_ratio := (SELECT LENGTH(REGEXP_REPLACE(content_text, '[^A-Z]', '', 'g')))::FLOAT / LENGTH(content_text);
    IF caps_ratio > 0.3 THEN
        INSERT INTO content_violations (
            user_id, 
            content_type, 
            violation_type, 
            flagged_content,
            content_id,
            created_at
        ) VALUES (
            NEW.user_id,
            CASE WHEN TG_TABLE_NAME = 'miracles' THEN 'miracle' ELSE 'prayer_request' END,
            'excessive_caps',
            'Caps ratio: ' || ROUND(caps_ratio * 100, 2) || '%',
            NEW.id,
            NOW()
        );
        NEW.is_approved := false;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
CREATE TRIGGER validate_miracle_content
    BEFORE INSERT OR UPDATE ON public.miracles
    FOR EACH ROW EXECUTE FUNCTION validate_content_content();

CREATE TRIGGER validate_prayer_content
    BEFORE INSERT OR UPDATE ON public.prayer_requests
    FOR EACH ROW EXECUTE FUNCTION validate_content_content();

-- Add RLS policies for content violations
ALTER TABLE public.content_violations ENABLE ROW LEVEL SECURITY;

-- Users can view their own violations
CREATE POLICY "Users can view their own content violations" ON public.content_violations
    FOR SELECT USING (auth.uid() = user_id);

-- Admins can view all violations (you'll need to implement admin role checking)
-- CREATE POLICY "Admins can view all content violations" ON public.content_violations
--     FOR SELECT USING (is_admin(auth.uid()));

-- Add comment to indicate the migration is complete
COMMENT ON TABLE public.content_violations IS 'Content violations detected by server-side validation triggers';
COMMENT ON FUNCTION validate_content_content() IS 'Validates content for inappropriate words and patterns, logs violations, and sets approval status';
