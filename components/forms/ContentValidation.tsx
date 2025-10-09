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
        onValidationChange({
          isAppropriate: true,
          confidence: 100,
          flaggedWords: [],
          suggestions: [],
          requiresReview: false
        });
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
        // Fallback to safe result
        const fallbackResult = {
          isAppropriate: true,
          confidence: 100,
          flaggedWords: [],
          suggestions: [],
          requiresReview: false
        };
        setValidationResult(fallbackResult);
        onValidationChange(fallbackResult);
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
      
      {validationResult && validationResult.requiresReview && validationResult.isAppropriate && (
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
