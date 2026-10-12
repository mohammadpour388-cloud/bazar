// Persian profanity, insult and vulgar words detector & filter
// فیلتر کلمات رکیک، توهین‌آمیز و نامناسب برای نظرات کاربران

const profaneWords: string[] = [
  // Common Persian offensive & vulgar words / roots
  'احمق',
  'بیشعور',
  'بی‌شعور',
  'بی شعور',
  'کثافت',
  'عوضی',
  'پدرسگ',
  'پدر سگ',
  'حرومزاده',
  'حرامزاده',
  'حروم‌زاده',
  'حروم لقمه',
  'حروم‌لقمه',
  'دیوث',
  'بیناموس',
  'بی‌ناموس',
  'بی ناموس',
  'لاشخور',
  'لاشی',
  'کره خر',
  'کره‌خر',
  'تخم سگ',
  'گاومیش',
  'پفیوز',
  'دیوانه',
  'روانی',
  'چرت و پرت',
  'کلاهبردار کثیف',
  'دزد عوضی',
  'سگ پدر',
  'کره سگ',
  'پدرسوخته',
  'پدر سوخته',
  'جاکش',
  'قرمساق',
  'نکبت',
  'خفه شو',
  'گوه',
  'عن',
  'انتر',
  'عنتر',
  'گاگول',
  'اسکل',
  'اوسکول',
  'اسکل پلشت',
  'پلشت',
  'بی شرف',
  'بی‌شرف',
  'بیشرف',
  'خاک بر سر',
  'خاک تو سر',
  'مرتیکه',
  'زنیکه',
];

/**
 * Normalizes Persian string for robust keyword matching
 */
export function normalizePersianText(text: string): string {
  return text
    .toLowerCase()
    .replace(/ي/g, 'ی')
    .replace(/ك/g, 'ک')
    .replace(/[\u200C\u200B\u00A0]/g, ' ') // half-spaces to space
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()؟?،!]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Checks if the text contains any profanity or inappropriate words
 */
export function checkContainsProfanity(text: string): { hasProfanity: boolean; matchedWords: string[] } {
  if (!text || !text.trim()) {
    return { hasProfanity: false, matchedWords: [] };
  }

  const normalized = normalizePersianText(text);
  const matchedWords: string[] = [];

  for (const word of profaneWords) {
    const normWord = normalizePersianText(word);
    // Word boundary or substring matching
    if (normalized.includes(normWord)) {
      matchedWords.push(word);
    }
  }

  return {
    hasProfanity: matchedWords.length > 0,
    matchedWords: Array.from(new Set(matchedWords)),
  };
}

/**
 * Masks profane words with asterisks (e.g., احمق -> ****)
 */
export function maskProfanity(text: string): string {
  let masked = text;
  for (const word of profaneWords) {
    const reg = new RegExp(word.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'gi');
    masked = masked.replace(reg, '***');
  }
  return masked;
}
