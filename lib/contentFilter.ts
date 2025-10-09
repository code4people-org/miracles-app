interface ContentFilterResult {
  isAppropriate: boolean;
  confidence: number;
  flaggedWords: string[];
  suggestions: string[];
  requiresReview: boolean;
}

export class ContentFilter {
  private inappropriateWords = new Set([
    // English spam and commercial terms
    'spam', 'scam', 'fake', 'clickbait', 'buy now', 'click here',
    'free money', 'get rich', 'make money fast', 'work from home',
    'crypto investment', 'bitcoin', 'forex trading', 'investment opportunity',
    'guaranteed profit', 'risk-free', 'limited time offer', 'act now',
    'call now', 'text me', 'email me', 'contact me immediately',
    
    // Spanish commercial terms
    'compra', 'vende', 'comprar', 'vender', 'propiedad', 'inmueble',
    'inversión', 'dinero fácil', 'ganar dinero', 'trabajo desde casa',
    'oportunidad de negocio', 'oferta limitada', 'llama ahora',
    'contacta', 'escribeme', 'llamame', 'inversión garantizada',
    
    // French commercial terms
    'acheter', 'vendre', 'propriété', 'immobilier', 'investissement',
    'argent facile', 'gagner de l\'argent', 'travail à domicile',
    'opportunité d\'affaires', 'offre limitée', 'appelez maintenant',
    
    // German commercial terms
    'kaufen', 'verkaufen', 'immobilie', 'investition', 'geld verdienen',
    'arbeit von zuhause', 'geschäftsmöglichkeit', 'begrenztes angebot',
    
    // Italian commercial terms
    'comprare', 'vendere', 'proprietà', 'immobiliare', 'investimento',
    'guadagnare soldi', 'lavoro da casa', 'opportunità di business',
    
    // Portuguese commercial terms
    'comprar', 'vender', 'propriedade', 'imóvel', 'investimento',
    'ganhar dinheiro', 'trabalho em casa', 'oportunidade de negócio',
    
    // Suspicious patterns
    'urgent', 'immediate', 'quick cash', 'easy money',
    
    // Add more as needed based on your community standards
    'mlm', 'pyramid scheme', 'multi level marketing',
    'get rich quick', 'passive income', 'side hustle',
    'affiliate marketing', 'click here now', 'limited time',
    'exclusive offer', 'secret method', 'proven system'
  ]);

  private suspiciousPatterns = [
    /https?:\/\/[^\s]+/g, // URLs
    /@\w+/g, // Mentions
    /\$\d+/g, // Money amounts
    /(buy|sell|purchase|order)\s+\w+/gi, // English commercial language
    /(compra|vende|comprar|vender)\s+\w+/gi, // Spanish commercial language
    /(acheter|vendre)\s+\w+/gi, // French commercial language
    /(kaufen|verkaufen)\s+\w+/gi, // German commercial language
    /(comprare|vendere)\s+\w+/gi, // Italian commercial language
    /(call|text|email)\s+me/gi, // Contact requests
    /(llama|contacta|escribeme|llamame)/gi, // Spanish contact requests
    /(appelez|contactez|écrivez)/gi, // French contact requests
    /\d{3}-\d{3}-\d{4}/g, // Phone numbers
    /[A-Z]{5,}/g, // Excessive caps (potential spam)
    /(click|visit|go to)\s+(here|this|link)/gi, // Clickbait
    /(free|no cost|no charge)\s+(gift|prize|money)/gi, // Free offers
    /(propiedad|inmueble|inversión)/gi, // Spanish real estate terms
    /(propriété|immobilier|investissement)/gi, // French real estate terms
    /(immobilie|investition)/gi, // German real estate terms
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
    if (flaggedWords.some(word => ['buy', 'sell', 'purchase', 'compra', 'vende', 'comprar', 'vender', 'acheter', 'vendre', 'kaufen', 'verkaufen', 'comprare', 'vendere'].includes(word))) {
      suggestions.push('This platform is for sharing miracles and prayer requests, not commercial activities');
    }
    if (flaggedWords.some(word => ['get rich', 'make money', 'free money', 'ganar dinero', 'gagner de l\'argent', 'geld verdienen', 'guadagnare soldi', 'ganhar dinheiro'].includes(word))) {
      suggestions.push('Please avoid financial opportunity content');
    }
    if (flaggedWords.some(word => ['propiedad', 'inmueble', 'inversión', 'propriété', 'immobilier', 'investissement', 'immobilie', 'investition', 'proprietà', 'immobiliare', 'propriedade', 'imóvel'].includes(word))) {
      suggestions.push('Please avoid real estate or investment content');
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

export type { ContentFilterResult };
