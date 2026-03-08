export interface BrandVoice {
  tone: string;
  audience: string;
  themes: string[];
  communicationStyle: string;
  ctaStyle: string;
  summaryPoints: string[]; // 3-4 bullet points summary
}

export interface Tweet {
  id: string;
  text: string;
  style: 'promotional' | 'witty' | 'conversational' | 'informative';
  characterCount: number;
}

export interface BrandInput {
  name: string;
  industry: string;
  objective: string;
  productInfo: string;
  keywords?: string;
  targetAudience?: string;
  styleNotes?: string;
  referenceLinks?: string;
}

export interface GenerationConfig {
  toneValue: number; // 0: playful, 100: professional
  creativity: 'low' | 'medium' | 'high';
}
