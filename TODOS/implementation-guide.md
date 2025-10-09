# Content Filtering Implementation Guide

## 🚀 **Step-by-Step Implementation Plan**

### **Phase 1: Basic Text Filtering (Start Here - 100% FREE)**

Let's start with the most impactful and completely free solution first.

#### **Step 1: Create Basic Content Filter**

```typescript
// lib/contentFilter.ts
interface ContentFilterResult {
  isAppropriate: boolean;
  confidence: number;
  flaggedWords: string[];
  suggestions: string[];
  requiresReview: boolean;
}

export class ContentFilter {
  private inappropriateWords = new Set([
    // Spam and commercial terms
    'spam', 'scam', 'fake', 'clickbait', 'buy now', 'click here',
    'free money', 'get rich', 'make money fast', 'work from home',
    'crypto investment', 'bitcoin', 'forex trading', 'investment opportunity',
    'guaranteed profit', 'risk-free', 'limited time offer', 'act now',
    'call now', 'text me', 'email me', 'contact me immediately',
    
    // Profanity (add as needed)
    // Add your own list based on your community standards
    
    // Suspicious patterns
    'urgent', 'immediate', 'quick cash', 'easy money'
  ]);

  private suspiciousPatterns = [
    /https?:\/\/[^\s]+/g, // URLs
    /@\w+/g, // Mentions
    /\$\d+/g, // Money amounts
    /(buy|sell|purchase|order)\s+\w+/gi, // Commercial language
    /(call|text|email)\s+me/gi, // Contact requests
    /\d{3}-\d{3}-\d{4}/g, // Phone numbers
    /[A-Z]{5,}/g, // Excessive caps (potential spam)
  ];

  async filterText(text: string): Promise<ContentFilterResult> {
    const words = text.toLowerCase().split(/\s+/);
    const flaggedWords = words.filter(word => this.inappropriateWords.has(word));
    
    const hasSuspiciousPatterns = this.suspiciousPatterns.some(pattern => 
      pattern.test(text)
    );

    const excessiveCaps = (text.match(/[A-Z]/g) || []).length > text.length * 0.3;
    const excessiveSpecialChars = (text.match(/[^a-zA-Z0-9\s]/g) || []).length > text.length * 0.2;
    const excessiveUrls = (text.match(/https?:\/\/[^\s]+/g) || []).length > 2;

    const isAppropriate = flaggedWords.length === 0 && 
                         !hasSuspiciousPatterns && 
                         !excessiveCaps && 
                         !excessiveSpecialChars &&
                         !excessiveUrls;

    return {
      isAppropriate,
      confidence: this.calculateConfidence(text, flaggedWords),
      flaggedWords,
      suggestions: this.generateSuggestions(flaggedWords, hasSuspiciousPatterns, excessiveCaps, excessiveSpecialChars, excessiveUrls),
      requiresReview: !isAppropriate
    };
  }

  private calculateConfidence(text: string, flaggedWords: string[]): number {
    let confidence = 100;
    confidence -= flaggedWords.length * 20;
    confidence -= (text.match(/https?:\/\/[^\s]+/g) || []).length * 15;
    confidence -= (text.match(/[A-Z]{3,}/g) || []).length * 10;
    return Math.max(0, confidence);
  }

  private generateSuggestions(flaggedWords: string[], hasSuspiciousPatterns: boolean, excessiveCaps: boolean, excessiveSpecialChars: boolean, excessiveUrls: boolean): string[] {
    const suggestions = [];
    
    if (flaggedWords.includes('spam')) {
      suggestions.push('Please avoid promotional or spam-like content');
    }
    if (flaggedWords.includes('fake')) {
      suggestions.push('Please ensure your content is authentic and truthful');
    }
    if (flaggedWords.some(word => ['buy', 'sell', 'purchase'].includes(word))) {
      suggestions.push('This platform is for sharing miracles and prayer requests, not commercial activities');
    }
    if (hasSuspiciousPatterns) {
      suggestions.push('Please avoid including contact information or promotional links');
    }
    if (excessiveCaps) {
      suggestions.push('Please avoid using excessive capital letters');
    }
    if (excessiveSpecialChars) {
      suggestions.push('Please reduce the use of special characters');
    }
    if (excessiveUrls) {
      suggestions.push('Please limit the number of links in your content');
    }
    
    return suggestions;
  }
}
```

#### **Step 2: Create Content Validation Component**

```typescript
// components/forms/ContentValidation.tsx
import { useState, useEffect, useMemo } from 'react';
import { AlertTriangle, CheckCircle, Clock, Loader2 } from 'lucide-react';
import { ContentFilter, ContentFilterResult } from '@/lib/contentFilter';

interface ContentValidationProps {
  content: { title: string; description: string };
  onValidationChange: (result: ContentFilterResult) => void;
  getTranslation: (key: string, fallback: string) => string;
}

export function ContentValidation({ 
  content, 
  onValidationChange,
  getTranslation
}: ContentValidationProps) {
  const [validationResult, setValidationResult] = useState<ContentFilterResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const contentFilter = useMemo(() => new ContentFilter(), []);

  useEffect(() => {
    const validateContent = async () => {
      if (!content.title && !content.description) {
        setValidationResult(null);
        return;
      }
      
      setIsValidating(true);
      try {
        const result = await contentFilter.filterText(
          `${content.title} ${content.description}`
        );
        setValidationResult(result);
        onValidationChange(result);
      } catch (error) {
        console.error('Content validation error:', error);
      } finally {
        setIsValidating(false);
      }
    };

    const timeoutId = setTimeout(validateContent, 500); // Debounce
    return () => clearTimeout(timeoutId);
  }, [content, contentFilter, onValidationChange]);

  if (!validationResult && !isValidating) return null;

  return (
    <div className="validation-feedback">
      {isValidating && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <div className="flex items-center">
            <Loader2 className="w-5 h-5 text-blue-500 mr-2 animate-spin" />
            <span className="text-blue-700 font-medium">
              {getTranslation('validation.checking', 'Checking content...')}
            </span>
          </div>
        </div>
      )}
      
      {validationResult && !validationResult.isAppropriate && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
            <span className="text-red-700 font-medium">
              {getTranslation('validation.inappropriate', 'Content may be inappropriate')}
            </span>
          </div>
          {validationResult.flaggedWords.length > 0 && (
            <p className="text-red-600 text-sm mt-1">
              {getTranslation('validation.flaggedWords', 'Flagged words')}: {validationResult.flaggedWords.join(', ')}
            </p>
          )}
          {validationResult.suggestions.length > 0 && (
            <div className="mt-2">
              <p className="text-red-600 text-sm font-medium">
                {getTranslation('validation.suggestions', 'Suggestions')}:
              </p>
              <ul className="text-red-600 text-sm list-disc list-inside">
                {validationResult.suggestions.map((suggestion, index) => (
                  <li key={index}>{suggestion}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
      
      {validationResult && validationResult.requiresReview && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
          <div className="flex items-center">
            <Clock className="w-5 h-5 text-yellow-500 mr-2" />
            <span className="text-yellow-700 font-medium">
              {getTranslation('validation.reviewRequired', 'Your content will be reviewed before being published')}
            </span>
          </div>
        </div>
      )}
      
      {validationResult && validationResult.isAppropriate && !validationResult.requiresReview && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
            <span className="text-green-700 font-medium">
              {getTranslation('validation.approved', 'Content looks good!')}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
```

#### **Step 3: Update Miracle Form**

```typescript
// components/miracles/MiracleForm.tsx - Add to existing form
import { ContentValidation } from '@/components/forms/ContentValidation';
import { ContentFilterResult } from '@/lib/contentFilter';

export default function MiracleForm({ onClose, onSubmit, getTranslation }: MiracleFormProps) {
  // ... existing state ...
  const [validationResult, setValidationResult] = useState<ContentFilterResult | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check validation result
    if (validationResult && !validationResult.isAppropriate) {
      setError(getTranslation('validation.inappropriateContent', 'Content contains inappropriate material. Please review and edit.'));
      return;
    }
    
    if (!user || !location) return;

    setLoading(true);
    setError('');

    try {
      // ... existing upload logic ...

      // Insert miracle into database
      const { error } = await supabase
        .from('miracles')
        .insert({
          user_id: user.id,
          title: formData.title,
          description: formData.description,
          category: formData.category,
          location: locationString,
          location_name: formData.location_name,
          privacy_level: formData.privacy_level,
          photo_url: photoUrl,
          video_url: videoUrl,
          youtube_url: formData.youtube_url || null,
          is_approved: validationResult?.requiresReview ? false : true, // Auto-approve if no issues
        });

      if (error) throw error;
      onSubmit();
    } catch (error: any) {
      setError(error.message || getTranslation('miracles.form.submitError', 'Failed to submit miracle'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div>
      {/* ... existing form content ... */}
      
      {/* Add validation component before submit button */}
      <ContentValidation
        content={{ title: formData.title, description: formData.description }}
        onValidationChange={setValidationResult}
        getTranslation={getTranslation}
      />
      
      {/* Update submit button */}
      <button
        type="submit"
        disabled={loading || (validationResult && !validationResult.isAppropriate)}
        className="btn-miracle"
      >
        {loading ? 'Submitting...' : 'Submit'}
      </button>
    </motion.div>
  );
}
```

#### **Step 4: Update Prayer Request Form**

```typescript
// components/prayers/PrayerRequestForm.tsx - Add to existing form
import { ContentValidation } from '@/components/forms/ContentValidation';
import { ContentFilterResult } from '@/lib/contentFilter';

export default function PrayerRequestForm({ onClose, onSubmit, getTranslation }: PrayerRequestFormProps) {
  // ... existing state ...
  const [validationResult, setValidationResult] = useState<ContentFilterResult | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check validation result
    if (validationResult && !validationResult.isAppropriate) {
      setError(getTranslation('validation.inappropriateContent', 'Content contains inappropriate material. Please review and edit.'));
      return;
    }
    
    if (!user || !location) return;

    setLoading(true);
    setError('');

    try {
      // ... existing upload logic ...

      // Insert prayer request into database
      const { error } = await supabase
        .from('prayer_requests')
        .insert({
          user_id: user.id,
          title: formData.title,
          description: formData.description,
          category: formData.category,
          urgency: formData.urgency,
          location: locationString,
          location_name: formData.location_name,
          privacy_level: formData.privacy_level,
          photo_url: photoUrl,
          is_anonymous: formData.is_anonymous,
          is_approved: validationResult?.requiresReview ? false : true, // Auto-approve if no issues
        });

      if (error) throw error;
      onSubmit();
    } catch (error: any) {
      setError(error.message || getTranslation('prayers.form.submitError', 'Failed to submit prayer request'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div>
      {/* ... existing form content ... */}
      
      {/* Add validation component before submit button */}
      <ContentValidation
        content={{ title: formData.title, description: formData.description }}
        onValidationChange={setValidationResult}
        getTranslation={getTranslation}
      />
      
      {/* Update submit button */}
      <button
        type="submit"
        disabled={loading || (validationResult && !validationResult.isAppropriate)}
        className="btn-miracle"
      >
        {loading ? 'Submitting...' : 'Submit'}
      </button>
    </motion.div>
  );
}
```

#### **Step 5: Add Translation Keys**

```json
// i18n/messages/en.json - Add to existing validation section
{
  "validation": {
    "required": "This field is required",
    "email": "Please enter a valid email address",
    "minLength": "Must be at least {min} characters",
    "maxLength": "Must be no more than {max} characters",
    "url": "Please enter a valid URL",
    "number": "Please enter a valid number",
    "positive": "Must be a positive number",
    "checking": "Checking content...",
    "inappropriate": "Content may be inappropriate",
    "flaggedWords": "Flagged words",
    "suggestions": "Suggestions",
    "reviewRequired": "Your content will be reviewed before being published",
    "approved": "Content looks good!",
    "inappropriateContent": "Content contains inappropriate material. Please review and edit."
  }
}
```

### **Phase 2: Database-Level Validation (Server-Side Protection)**

#### **Step 6: Create Database Migration**

```sql
-- supabase/migrations/20250128000003_add_content_filtering.sql
-- Add content filtering infrastructure

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
        'spam', 'scam', 'fake', 'clickbait', 'buy now', 'click here',
        'free money', 'get rich', 'make money fast', 'work from home',
        'crypto investment', 'bitcoin', 'forex trading', 'investment opportunity',
        'guaranteed profit', 'risk-free', 'limited time offer', 'act now',
        'call now', 'text me', 'email me', 'contact me immediately'
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
```

### **Phase 3: AI Integration (When Ready for Free AI Services)**

#### **Step 7: Set Up AI Services (Optional - When You Want AI)**

```bash
# 1. OpenAI Setup
# - Go to https://platform.openai.com/
# - Create account and add billing method
# - Generate API key
# - Add to .env.local: OPENAI_API_KEY=sk-your-key

# 2. Google Vision Setup (Optional)
# - Go to https://console.cloud.google.com/
# - Create project and enable Vision API
# - Create service account and download JSON
# - Add to .env.local: GOOGLE_APPLICATION_CREDENTIALS=./credentials/vision.json
```

#### **Step 8: Create AI Moderation Service (Optional)**

```typescript
// lib/aiModeration.ts
export class AIModerationService {
  async moderateContent(content: { title: string; description: string }): Promise<ModerationResult> {
    // Only use AI if API key is available
    if (process.env.OPENAI_API_KEY) {
      return await this.checkWithOpenAI(content);
    }
    
    // Fall back to basic filtering
    const basicFilter = new ContentFilter();
    return await basicFilter.filterText(`${content.title} ${content.description}`);
  }

  private async checkWithOpenAI(content: any): Promise<ModerationResult> {
    try {
      const response = await fetch('https://api.openai.com/v1/moderations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: `${content.title} ${content.description}`,
        }),
      });
      
      const data = await response.json();
      const result = data.results[0];
      
      return {
        isAppropriate: !result.flagged,
        confidence: result.flagged ? 100 : 0,
        flagged: result.flagged,
        reason: result.flagged ? 'Content flagged by AI moderation' : undefined
      };
    } catch (error) {
      console.error('OpenAI moderation error:', error);
      // Fall back to basic filtering
      const basicFilter = new ContentFilter();
      return await basicFilter.filterText(`${content.title} ${content.description}`);
    }
  }
}
```

## 🎯 **Implementation Order**

### **Start Here (Immediate - 100% Free)**
1. ✅ Create `lib/contentFilter.ts`
2. ✅ Create `components/forms/ContentValidation.tsx`
3. ✅ Update `MiracleForm.tsx` and `PrayerRequestForm.tsx`
4. ✅ Add translation keys
5. ✅ Test with real content

### **Next (Server-Side Protection)**
6. ✅ Run database migration
7. ✅ Test database triggers
8. ✅ Monitor content violations

### **Later (When Ready for AI)**
9. ✅ Set up OpenAI account (free tier)
10. ✅ Add AI moderation service
11. ✅ Integrate with existing forms

## 🧪 **Testing Your Implementation**

### **Test Cases to Try**
```typescript
// Test inappropriate content
const testCases = [
  "Buy now! Get rich quick with this amazing opportunity!",
  "CLICK HERE FOR FREE MONEY!!!",
  "Contact me at 555-123-4567 for more info",
  "This is a genuine miracle story about healing",
  "Please pray for my family during this difficult time"
];

// Test each case
testCases.forEach(async (testCase) => {
  const result = await contentFilter.filterText(testCase);
  console.log(`"${testCase}" -> ${result.isAppropriate ? 'APPROVED' : 'FLAGGED'}`);
});
```

## 🚀 **Ready to Start?**

**Recommended first step**: Implement the basic text filtering (Steps 1-5). This gives you immediate protection with zero cost and can be done in about 2-3 hours.

Would you like me to help you implement any of these steps, or do you have questions about the implementation approach?
