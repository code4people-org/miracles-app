# Content Filtering & Moderation System - Technical Proposal

## Overview

This proposal outlines a comprehensive content filtering and moderation system for the Miracles app to prevent inappropriate content from being posted. The system builds upon the existing reporting and approval infrastructure while adding proactive filtering mechanisms.

## 🎯 Current State Analysis

### ✅ **Existing Infrastructure**
- **Basic validation**: Length constraints (3-100 chars for titles, 10-1000 chars for descriptions)
- **Reporting system**: Users can report inappropriate content with categories
- **Approval system**: `is_approved` field for manual moderation
- **User authentication**: All content is tied to authenticated users
- **Content categories**: Predefined categories for both miracles and prayer requests
- **Database constraints**: Basic CHECK constraints on content length

### 🔍 **Current Limitations**
- No proactive content filtering before submission
- No image/video content moderation
- No AI-powered content analysis
- Limited automated detection of spam/inappropriate content
- No user reputation system for content quality
- Manual moderation only after content is posted

## 🚫 Content Filtering Proposals

### 1. **Text-Based Content Filtering**

**Implementation**: Real-time text analysis before submission

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
    // Profanity, hate speech, spam terms
    'spam', 'scam', 'fake', 'clickbait', 'buy now', 'click here',
    'free money', 'get rich', 'make money fast', 'work from home',
    'crypto investment', 'bitcoin', 'forex trading',
    // Add comprehensive word lists
  ]);

  private suspiciousPatterns = [
    /https?:\/\/[^\s]+/g, // URLs
    /@\w+/g, // Mentions
    /\$\d+/g, // Money amounts
    /(buy|sell|purchase|order)\s+\w+/gi, // Commercial language
    /(call|text|email)\s+me/gi, // Contact requests
    /\d{3}-\d{3}-\d{4}/g, // Phone numbers
    /[A-Z]{3,}/g, // Excessive caps (potential spam)
  ];

  async filterText(text: string): Promise<ContentFilterResult> {
    const words = text.toLowerCase().split(/\s+/);
    const flaggedWords = words.filter(word => this.inappropriateWords.has(word));
    
    const hasSuspiciousPatterns = this.suspiciousPatterns.some(pattern => 
      pattern.test(text)
    );

    const excessiveCaps = (text.match(/[A-Z]/g) || []).length > text.length * 0.3;
    const excessiveSpecialChars = (text.match(/[^a-zA-Z0-9\s]/g) || []).length > text.length * 0.2;

    return {
      isAppropriate: flaggedWords.length === 0 && !hasSuspiciousPatterns && !excessiveCaps && !excessiveSpecialChars,
      confidence: this.calculateConfidence(text, flaggedWords),
      flaggedWords,
      suggestions: this.generateSuggestions(flaggedWords),
      requiresReview: flaggedWords.length > 0 || hasSuspiciousPatterns || excessiveCaps || excessiveSpecialChars
    };
  }

  private calculateConfidence(text: string, flaggedWords: string[]): number {
    let confidence = 100;
    confidence -= flaggedWords.length * 20;
    confidence -= (text.match(/https?:\/\/[^\s]+/g) || []).length * 15;
    confidence -= (text.match(/[A-Z]{3,}/g) || []).length * 10;
    return Math.max(0, confidence);
  }

  private generateSuggestions(flaggedWords: string[]): string[] {
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
    
    return suggestions;
  }
}
```

### 2. **AI-Powered Content Moderation**

**Integration with AI services**:

```typescript
// lib/aiModeration.ts
interface ModerationResult {
  isAppropriate: boolean;
  confidence: number;
  categories: {
    hate: number;
    harassment: number;
    selfHarm: number;
    sexual: number;
    violence: number;
  };
  flagged: boolean;
  reason?: string;
}

export class AIModerationService {
  async moderateContent(content: {
    title: string;
    description: string;
    category: string;
  }): Promise<ModerationResult> {
    // Option 1: OpenAI Moderation API
    const openaiResult = await this.checkWithOpenAI(content);
    
    // Option 2: Google Perspective API
    const perspectiveResult = await this.checkWithPerspective(content);
    
    // Option 3: Azure Content Moderator
    const azureResult = await this.checkWithAzure(content);
    
    return this.combineResults([openaiResult, perspectiveResult, azureResult]);
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
        categories: {
          hate: result.categories.hate ? 1 : 0,
          harassment: result.categories.harassment ? 1 : 0,
          selfHarm: result.categories.self_harm ? 1 : 0,
          sexual: result.categories.sexual ? 1 : 0,
          violence: result.categories.violence ? 1 : 0,
        },
        flagged: result.flagged,
        reason: result.flagged ? 'Content flagged by OpenAI moderation' : undefined
      };
    } catch (error) {
      console.error('OpenAI moderation error:', error);
      return { isAppropriate: true, confidence: 0, categories: {}, flagged: false };
    }
  }

  private async checkWithPerspective(content: any): Promise<ModerationResult> {
    try {
      const response = await fetch(
        `https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze?key=${process.env.GOOGLE_PERSPECTIVE_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            comment: { text: `${content.title} ${content.description}` },
            requestedAttributes: {
              TOXICITY: {},
              SEVERE_TOXICITY: {},
              IDENTITY_ATTACK: {},
              INSULT: {},
              THREAT: {},
              SEXUALLY_EXPLICIT: {},
              SPAM: {}
            }
          })
        }
      );
      
      const data = await response.json();
      const attributes = data.attributeScores;
      
      const toxicityScore = attributes.TOXICITY?.summaryScore?.value || 0;
      const spamScore = attributes.SPAM?.summaryScore?.value || 0;
      
      return {
        isAppropriate: toxicityScore < 0.7 && spamScore < 0.7,
        confidence: Math.max(toxicityScore, spamScore) * 100,
        categories: {
          hate: attributes.IDENTITY_ATTACK?.summaryScore?.value || 0,
          harassment: attributes.INSULT?.summaryScore?.value || 0,
          selfHarm: 0,
          sexual: attributes.SEXUALLY_EXPLICIT?.summaryScore?.value || 0,
          violence: attributes.THREAT?.summaryScore?.value || 0,
        },
        flagged: toxicityScore > 0.7 || spamScore > 0.7,
        reason: toxicityScore > 0.7 ? 'Content appears toxic' : spamScore > 0.7 ? 'Content appears to be spam' : undefined
      };
    } catch (error) {
      console.error('Perspective API error:', error);
      return { isAppropriate: true, confidence: 0, categories: {}, flagged: false };
    }
  }

  private combineResults(results: ModerationResult[]): ModerationResult {
    const flaggedResults = results.filter(r => r.flagged);
    
    if (flaggedResults.length === 0) {
      return { isAppropriate: true, confidence: 0, categories: {}, flagged: false };
    }
    
    // If any service flags the content, consider it inappropriate
    const maxConfidence = Math.max(...flaggedResults.map(r => r.confidence));
    const combinedCategories = flaggedResults.reduce((acc, result) => {
      Object.keys(result.categories).forEach(key => {
        acc[key] = Math.max(acc[key] || 0, result.categories[key]);
      });
      return acc;
    }, {} as any);
    
    return {
      isAppropriate: false,
      confidence: maxConfidence,
      categories: combinedCategories,
      flagged: true,
      reason: flaggedResults[0].reason
    };
  }
}
```

### 3. **Image Content Filtering**

**For uploaded photos and videos**:

```typescript
// lib/imageModeration.ts
interface ImageModerationResult {
  isAppropriate: boolean;
  confidence: number;
  categories: {
    adult: number;
    violence: number;
    racy: number;
    spoof: number;
    medical: number;
  };
  textDetected?: string[];
  objectsDetected?: string[];
  flagged: boolean;
  reason?: string;
}

export class ImageModerationService {
  async moderateImage(imageFile: File): Promise<ImageModerationResult> {
    // Option 1: Google Vision API
    const visionResult = await this.checkWithGoogleVision(imageFile);
    
    // Option 2: AWS Rekognition
    const rekognitionResult = await this.checkWithAWSRekognition(imageFile);
    
    // Option 3: Azure Computer Vision
    const azureResult = await this.checkWithAzureVision(imageFile);
    
    return this.combineImageResults([visionResult, rekognitionResult, azureResult]);
  }

  private async checkWithGoogleVision(file: File): Promise<ImageModerationResult> {
    try {
      const base64 = await this.fileToBase64(file);
      
      const response = await fetch(
        `https://vision.googleapis.com/v1/images:annotate?key=${process.env.GOOGLE_VISION_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            requests: [{
              image: { content: base64 },
              features: [
                { type: 'SAFE_SEARCH_DETECTION' },
                { type: 'OBJECT_LOCALIZATION' },
                { type: 'TEXT_DETECTION' }
              ]
            }]
          })
        }
      );
      
      const data = await response.json();
      const result = data.responses[0];
      
      const safeSearch = result.safeSearchAnnotation;
      const textAnnotations = result.textAnnotations || [];
      const objects = result.localizedObjectAnnotations || [];
      
      const isInappropriate = 
        safeSearch.adult === 'LIKELY' || safeSearch.adult === 'VERY_LIKELY' ||
        safeSearch.violence === 'LIKELY' || safeSearch.violence === 'VERY_LIKELY' ||
        safeSearch.racy === 'LIKELY' || safeSearch.racy === 'VERY_LIKELY';
      
      return {
        isAppropriate: !isInappropriate,
        confidence: isInappropriate ? 100 : 0,
        categories: {
          adult: this.safeSearchToNumber(safeSearch.adult),
          violence: this.safeSearchToNumber(safeSearch.violence),
          racy: this.safeSearchToNumber(safeSearch.racy),
          spoof: this.safeSearchToNumber(safeSearch.spoof),
          medical: this.safeSearchToNumber(safeSearch.medical)
        },
        textDetected: textAnnotations.map((t: any) => t.description),
        objectsDetected: objects.map((o: any) => o.name),
        flagged: isInappropriate,
        reason: isInappropriate ? 'Image contains inappropriate content' : undefined
      };
    } catch (error) {
      console.error('Google Vision API error:', error);
      return { isAppropriate: true, confidence: 0, categories: {}, flagged: false };
    }
  }

  private safeSearchToNumber(level: string): number {
    switch (level) {
      case 'VERY_UNLIKELY': return 0;
      case 'UNLIKELY': return 0.25;
      case 'POSSIBLE': return 0.5;
      case 'LIKELY': return 0.75;
      case 'VERY_LIKELY': return 1;
      default: return 0;
    }
  }

  private async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64 = reader.result as string;
        resolve(base64.split(',')[1]); // Remove data:image/...;base64, prefix
      };
      reader.onerror = error => reject(error);
    });
  }
}
```

### 4. **Enhanced Form Validation**

**Real-time validation with user feedback**:

```typescript
// components/forms/ContentValidation.tsx
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
      if (!content.title && !content.description) return;
      
      setIsValidating(true);
      const result = await contentFilter.filterText(
        `${content.title} ${content.description}`
      );
      setValidationResult(result);
      onValidationChange(result);
      setIsValidating(false);
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

### 5. **Database-Level Content Filtering**

**Enhanced database constraints and triggers**:

```sql
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

-- Create content violations table
CREATE TABLE IF NOT EXISTS content_violations (
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

-- Apply triggers
CREATE TRIGGER validate_miracle_content
    BEFORE INSERT OR UPDATE ON public.miracles
    FOR EACH ROW EXECUTE FUNCTION validate_content_content();

CREATE TRIGGER validate_prayer_content
    BEFORE INSERT OR UPDATE ON public.prayer_requests
    FOR EACH ROW EXECUTE FUNCTION validate_content_content();
```

### 6. **User Reputation System**

**Track user behavior and adjust filtering**:

```typescript
// lib/userReputation.ts
interface UserReputation {
  score: number;
  level: 'new' | 'trusted' | 'verified' | 'moderator';
  requiresModeration: boolean;
  canPostDirectly: boolean;
  violations: number;
  reports: number;
  approvedContent: number;
}

export class UserReputationService {
  async calculateUserReputation(userId: string): Promise<UserReputation> {
    const violations = await this.getUserViolations(userId);
    const reports = await this.getUserReports(userId);
    const approvedContent = await this.getUserApprovedContent(userId);
    
    const reputationScore = this.calculateScore(violations, reports, approvedContent);
    
    return {
      score: reputationScore,
      level: this.getReputationLevel(reputationScore),
      requiresModeration: reputationScore < 50,
      canPostDirectly: reputationScore > 80,
      violations: violations.length,
      reports: reports.length,
      approvedContent: approvedContent.length
    };
  }

  private async getUserViolations(userId: string): Promise<any[]> {
    const { data } = await supabase
      .from('content_violations')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()); // Last 30 days
    
    return data || [];
  }

  private async getUserReports(userId: string): Promise<any[]> {
    const { data } = await supabase
      .from('reports')
      .select('*')
      .eq('reporter_id', userId)
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()); // Last 30 days
    
    return data || [];
  }

  private async getUserApprovedContent(userId: string): Promise<any[]> {
    const { data: miracles } = await supabase
      .from('miracles')
      .select('id')
      .eq('user_id', userId)
      .eq('is_approved', true)
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());
    
    const { data: prayers } = await supabase
      .from('prayer_requests')
      .select('id')
      .eq('user_id', userId)
      .eq('is_approved', true)
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());
    
    return [...(miracles || []), ...(prayers || [])];
  }

  private calculateScore(violations: any[], reports: any[], approved: any[]): number {
    let score = 100; // Start with perfect score
    
    // Deduct for violations (more recent violations have higher impact)
    violations.forEach(violation => {
      const daysSince = (Date.now() - new Date(violation.created_at).getTime()) / (1000 * 60 * 60 * 24);
      const weight = Math.max(0.1, 1 - (daysSince / 30)); // Weight decreases over time
      score -= 15 * weight;
    });
    
    // Deduct for reports
    reports.forEach(report => {
      const daysSince = (Date.now() - new Date(report.created_at).getTime()) / (1000 * 60 * 60 * 24);
      const weight = Math.max(0.1, 1 - (daysSince / 30));
      score -= 10 * weight;
    });
    
    // Bonus for approved content
    approved.forEach(content => {
      const daysSince = (Date.now() - new Date(content.created_at).getTime()) / (1000 * 60 * 60 * 24);
      const weight = Math.max(0.1, 1 - (daysSince / 30));
      score += 2 * weight;
    });
    
    return Math.max(0, Math.min(100, score));
  }

  private getReputationLevel(score: number): 'new' | 'trusted' | 'verified' | 'moderator' {
    if (score >= 90) return 'moderator';
    if (score >= 75) return 'verified';
    if (score >= 50) return 'trusted';
    return 'new';
  }
}
```

### 7. **Enhanced Reporting System**

**Better moderation dashboard**:

```typescript
// components/admin/ModerationDashboard.tsx
interface ModerationDashboardProps {
  user: any;
}

export function ModerationDashboard({ user }: ModerationDashboardProps) {
  const [pendingContent, setPendingContent] = useState([]);
  const [reports, setReports] = useState([]);
  const [userViolations, setUserViolations] = useState([]);
  const [stats, setStats] = useState({
    totalPending: 0,
    totalReports: 0,
    totalViolations: 0,
    approvalRate: 0
  });

  useEffect(() => {
    fetchModerationData();
  }, []);

  const fetchModerationData = async () => {
    // Fetch pending content
    const { data: pendingMiracles } = await supabase
      .from('miracles')
      .select('*')
      .eq('is_approved', false)
      .order('created_at', { ascending: false });

    const { data: pendingPrayers } = await supabase
      .from('prayer_requests')
      .select('*')
      .eq('is_approved', false)
      .order('created_at', { ascending: false });

    // Fetch recent reports
    const { data: recentReports } = await supabase
      .from('reports')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    // Fetch user violations
    const { data: violations } = await supabase
      .from('content_violations')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    setPendingContent([...pendingMiracles, ...pendingPrayers]);
    setReports(recentReports || []);
    setUserViolations(violations || []);

    // Calculate stats
    const totalApproved = await getTotalApprovedContent();
    const totalSubmitted = await getTotalSubmittedContent();
    
    setStats({
      totalPending: (pendingMiracles?.length || 0) + (pendingPrayers?.length || 0),
      totalReports: recentReports?.length || 0,
      totalViolations: violations?.length || 0,
      approvalRate: totalSubmitted > 0 ? (totalApproved / totalSubmitted) * 100 : 0
    });
  };

  const handleApproveContent = async (contentId: string, contentType: string) => {
    const table = contentType === 'miracle' ? 'miracles' : 'prayer_requests';
    
    const { error } = await supabase
      .from(table)
      .update({ is_approved: true })
      .eq('id', contentId);

    if (!error) {
      fetchModerationData(); // Refresh data
    }
  };

  const handleRejectContent = async (contentId: string, reason: string, contentType: string) => {
    // Log the rejection
    await supabase
      .from('content_violations')
      .insert({
        content_id: contentId,
        content_type: contentType,
        violation_type: 'manual_rejection',
        flagged_content: reason,
        user_id: user.id
      });

    // Delete the content
    const table = contentType === 'miracle' ? 'miracles' : 'prayer_requests';
    await supabase
      .from(table)
      .delete()
      .eq('id', contentId);

    fetchModerationData(); // Refresh data
  };

  return (
    <div className="moderation-dashboard p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Content Moderation Dashboard</h1>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Pending Review</h3>
          <p className="text-2xl font-bold text-orange-600">{stats.totalPending}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Recent Reports</h3>
          <p className="text-2xl font-bold text-red-600">{stats.totalReports}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Violations</h3>
          <p className="text-2xl font-bold text-purple-600">{stats.totalViolations}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Approval Rate</h3>
          <p className="text-2xl font-bold text-green-600">{stats.approvalRate.toFixed(1)}%</p>
        </div>
      </div>

      {/* Content Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <PendingContentCard 
          content={pendingContent}
          onApprove={handleApproveContent}
          onReject={handleRejectContent}
        />
        <ReportsCard reports={reports} />
        <UserViolationsCard violations={userViolations} />
      </div>
    </div>
  );
}

// components/admin/PendingContentCard.tsx
interface PendingContentCardProps {
  content: any[];
  onApprove: (id: string, type: string) => void;
  onReject: (id: string, reason: string, type: string) => void;
}

export function PendingContentCard({ content, onApprove, onReject }: PendingContentCardProps) {
  const [selectedContent, setSelectedContent] = useState<any>(null);
  const [rejectReason, setRejectReason] = useState('');

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Pending Content ({content.length})</h2>
      
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {content.map((item) => (
          <div key={item.id} className="border rounded-lg p-3">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-medium text-gray-800 truncate">{item.title}</h3>
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                {item.category}
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.description}</p>
            <div className="flex space-x-2">
              <button
                onClick={() => onApprove(item.id, 'miracle' in item ? 'miracle' : 'prayer_request')}
                className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
              >
                Approve
              </button>
              <button
                onClick={() => setSelectedContent(item)}
                className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
              >
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Reject Modal */}
      {selectedContent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Reject Content</h3>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Reason for rejection..."
              className="w-full p-3 border rounded-lg mb-4"
              rows={3}
            />
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  onReject(selectedContent.id, rejectReason, 'miracle' in selectedContent ? 'miracle' : 'prayer_request');
                  setSelectedContent(null);
                  setRejectReason('');
                }}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Reject
              </button>
              <button
                onClick={() => {
                  setSelectedContent(null);
                  setRejectReason('');
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

## 🚀 Implementation Priority

### **Phase 1: Immediate (High Impact, Low Effort)**
1. ✅ **Enhanced text validation** - Add word filtering and pattern detection
2. ✅ **Database triggers** - Server-side content validation
3. ✅ **User reputation system** - Track and adjust based on behavior
4. ✅ **Enhanced form validation** - Real-time user feedback

**Estimated effort**: 2-3 days
**Cost**: Free (basic implementation)

### **Phase 2: Short-term (Medium Impact, Medium Effort)**
1. ✅ **AI content moderation** - Integrate with OpenAI/Google APIs
2. ✅ **Image filtering** - Moderate uploaded photos/videos
3. ✅ **Enhanced reporting** - Better moderation dashboard

**Estimated effort**: 1-2 weeks
**Cost**: $50-200/month (API usage)

### **Phase 3: Long-term (High Impact, High Effort)**
1. ✅ **Machine learning models** - Custom trained models for your content
2. ✅ **Real-time monitoring** - Live content analysis
3. ✅ **Community moderation** - User-powered content review

**Estimated effort**: 1-2 months
**Cost**: $500-2000/month (infrastructure + development)

## 💰 Cost Considerations

### **Free Options**
- Basic word filtering and pattern detection
- Database triggers and constraints
- User reputation system
- Enhanced form validation

### **Low Cost ($10-50/month)**
- Google Vision API: $1.50 per 1000 images
- OpenAI Moderation API: $0.0001 per request
- Basic AI content analysis

### **Medium Cost ($50-200/month)**
- Multiple AI service integrations
- Advanced image analysis
- Real-time content monitoring

### **High Cost ($200+/month)**
- Custom ML models
- Real-time AI processing
- Advanced analytics and reporting

## 🔧 Technical Integration

### **Form Integration**
```typescript
// Update existing forms to include content validation
export default function MiracleForm({ onClose, onSubmit, getTranslation }: MiracleFormProps) {
  const [validationResult, setValidationResult] = useState<ContentFilterResult | null>(null);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check validation result
    if (validationResult && !validationResult.isAppropriate) {
      setError('Content contains inappropriate material. Please review and edit.');
      return;
    }
    
    // Continue with existing submission logic...
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Existing form fields */}
      
      <ContentValidation
        content={{ title: formData.title, description: formData.description }}
        onValidationChange={setValidationResult}
        getTranslation={getTranslation}
      />
      
      {/* Submit button with validation check */}
      <button
        type="submit"
        disabled={!validationResult?.isAppropriate}
        className="btn-miracle"
      >
        Submit
      </button>
    </form>
  );
}
```

### **Database Migration**
```sql
-- Migration file: 20250128000003_add_content_filtering.sql
-- Add content filtering infrastructure

-- Create content violations table
CREATE TABLE IF NOT EXISTS public.content_violations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    content_type TEXT NOT NULL,
    violation_type TEXT NOT NULL,
    flagged_content TEXT,
    content_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_content_violations_user_id ON public.content_violations(user_id);
CREATE INDEX IF NOT EXISTS idx_content_violations_content_type ON public.content_violations(content_type);
CREATE INDEX IF NOT EXISTS idx_content_violations_violation_type ON public.content_violations(violation_type);

-- Add validation function and triggers
-- (Include the validate_content_content function from above)

-- Add user reputation tracking
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS reputation_score INTEGER DEFAULT 100;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS reputation_level TEXT DEFAULT 'new';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS requires_moderation BOOLEAN DEFAULT false;
```

## 📊 Success Metrics

### **Content Quality Metrics**
- Reduction in inappropriate content submissions
- Increase in content approval rate
- Decrease in user reports
- Improvement in content quality scores

### **User Experience Metrics**
- Reduction in content rejection rate
- Faster content approval times
- Improved user satisfaction scores
- Better community engagement

### **System Performance Metrics**
- API response times for content filtering
- False positive/negative rates
- System uptime and reliability
- Cost per content moderation action

## 🎯 Next Steps

1. **Start with Phase 1** - Implement basic text filtering and database validation
2. **Test with real content** - Use existing content to validate filtering rules
3. **Monitor and adjust** - Track effectiveness and refine rules
4. **Gradually add AI services** - Integrate AI moderation as needed
5. **Build moderation tools** - Create admin dashboard for manual review

## 📝 Conclusion

This comprehensive content filtering system will significantly improve the quality and safety of content on the Miracles app. By implementing it in phases, you can start with immediate improvements while building toward a sophisticated AI-powered moderation system.

The system is designed to be:
- **Scalable**: Can handle growing content volume
- **Cost-effective**: Starts free and scales with usage
- **User-friendly**: Provides clear feedback and guidance
- **Maintainable**: Uses existing infrastructure and patterns
- **Flexible**: Can be adjusted based on community needs

**Recommended starting point**: Implement Phase 1 (text filtering + database validation) for immediate protection, then evaluate the need for AI services based on content volume and moderation workload.

