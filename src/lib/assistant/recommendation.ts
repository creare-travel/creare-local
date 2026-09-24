import type { AssistantState, ExperienceCandidate } from './types';

export type RankedExperience = ExperienceCandidate & {
  score: number;
  match_reasons: string[];
};

const STOP_WORDS = new Set([
  'with',
  'from',
  'into',
  'this',
  'that',
  'have',
  'want',
  'would',
  'like',
  'private',
  'experience',
  'journey',
  'guest',
  'guests',
  'days',
  'day',
  'around',
  'about',
  'something',
  'really',
  'very',
  'calm',
  'quiet',
  'format',
  'ile',
  'icin',
  'için',
  'biz',
  'bir',
  'çok',
  'daha',
  'gibi',
  'özel',
  'seyahat',
  'yolculuk',
  'misafir',
]);

const CONCEPTS: Record<string, string[]> = {
  art: [
    'art',
    'arts',
    'artist',
    'studio',
    'gallery',
    'contemporary',
    'sanat',
    'sanatçı',
    'искусств',
    'худож',
    '艺术',
    '艺术家',
    '画廊',
  ],
  history: [
    'history',
    'historic',
    'heritage',
    'ottoman',
    'empire',
    'tarih',
    'tarihi',
    'miras',
    'истор',
    'осман',
    '历史',
    '奥斯曼',
    '文化遗产',
  ],
  architecture: [
    'architecture',
    'architectural',
    'design',
    'mimari',
    'mimarlık',
    'архитект',
    '建筑',
    '设计',
  ],
  food: [
    'food',
    'culinary',
    'gastronomy',
    'chef',
    'restaurant',
    'wine',
    'yemek',
    'gastronomi',
    'şef',
    'mutfak',
    'кухн',
    'гастроном',
    '美食',
    '餐厅',
    '葡萄酒',
  ],
  culture: [
    'culture',
    'cultural',
    'local makers',
    'craft',
    'kültür',
    'zanaat',
    'культур',
    'ремес',
    '文化',
    '手工',
  ],
  nature: [
    'nature',
    'landscape',
    'sunrise',
    'outdoor',
    'coast',
    'sea',
    'rural',
    'doğa',
    'manzara',
    'kırsal',
    'природ',
    'пейзаж',
    '自然',
    '景观',
  ],
  sailing: [
    'sailing',
    'yacht',
    'boat',
    'regatta',
    'yelken',
    'tekne',
    'яхт',
    'парус',
    '帆船',
    '游艇',
  ],
  wellness: [
    'wellness',
    'spa',
    'retreat',
    'wellbeing',
    'well-being',
    'sağlık',
    'wellness',
    'спа',
    '疗愈',
    '康养',
  ],
  family: ['family', 'children', 'kids', 'child', 'aile', 'çocuk', 'семь', 'дет', '家庭', '孩子'],
  romance: [
    'anniversary',
    'honeymoon',
    'romantic',
    'couple',
    'celebration',
    'yıldönümü',
    'balayı',
    'çift',
    'роман',
    'медов',
    '周年',
    '蜜月',
    '情侣',
  ],
};

function normalize(value: string) {
  return value
    .toLocaleLowerCase('en-US')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/стамбул[а-я]*/gu, ' istanbul ')
    .replace(/伊斯坦布尔/gu, ' istanbul ')
    .replace(/бодрум[а-я]*/gu, ' bodrum ')
    .replace(/博德鲁姆/gu, ' bodrum ')
    .replace(/каппадоки[а-я]*/gu, ' cappadocia ')
    .replace(/卡帕多奇亚/gu, ' cappadocia ');
}

function containsSignal(text: string, rawSignal: string) {
  const signal = normalize(rawSignal).trim();
  if (!signal) return false;
  if (/^[a-z0-9-]{2,4}$/i.test(signal)) {
    return text.split(/[^\p{L}\p{N}-]+/u).includes(signal);
  }
  return text.includes(signal);
}

function meaningfulTokens(value: string) {
  return normalize(value)
    .split(/[^\p{L}\p{N}]+/u)
    .filter((token) => token.length >= 3 && !STOP_WORDS.has(token))
    .slice(0, 40);
}

function detectedConcepts(value: string) {
  const normalized = normalize(value);
  return Object.entries(CONCEPTS)
    .filter(([, signals]) => signals.some((signal) => containsSignal(normalized, signal)))
    .map(([concept]) => concept);
}

export function rankExperienceCandidates(
  catalog: ExperienceCandidate[],
  state: AssistantState,
  message: string,
  limit = 6
): RankedExperience[] {
  const destination = normalize(state.destination || '').trim();
  const intentText = [state.intention, ...state.interests, state.profile, message]
    .filter(Boolean)
    .join(' ');
  const tokens = meaningfulTokens(intentText);
  const concepts = detectedConcepts(intentText);

  return catalog
    .map((candidate) => {
      const title = normalize(candidate.title);
      const location = normalize(candidate.location || '');
      const description = normalize(candidate.short_description || '');
      const category = normalize(candidate.category || '');
      const haystack = `${title} ${location} ${description} ${category}`;
      let score = 0;
      const reasons: string[] = [];

      if (destination) {
        if (location.includes(destination)) {
          score += 50;
          reasons.push('destination_exact');
        } else if (title.includes(destination) || description.includes(destination)) {
          score += 30;
          reasons.push('destination_context');
        } else {
          return { ...candidate, score: 0, match_reasons: ['destination_mismatch'] };
        }
      }

      for (const concept of concepts) {
        const signals = CONCEPTS[concept] || [];
        if (signals.some((signal) => containsSignal(haystack, signal))) {
          score += 18;
          reasons.push(`concept:${concept}`);
        }
      }

      const specializedConcepts = ['food', 'sailing', 'wellness', 'family', 'romance'];
      for (const concept of specializedConcepts) {
        if (concepts.includes(concept)) continue;
        const signals = CONCEPTS[concept] || [];
        if (signals.some((signal) => containsSignal(title, signal))) {
          score -= 18;
          reasons.push(`specialty_mismatch:${concept}:title`);
        } else if (signals.some((signal) => containsSignal(description, signal))) {
          score -= 8;
          reasons.push(`specialty_mismatch:${concept}:description`);
        }
      }

      let tokenMatches = 0;
      const destinationTokens = new Set(destination.split(/[^\p{L}\p{N}]+/u).filter(Boolean));
      for (const token of tokens) {
        if (destinationTokens.has(token) || /^\d+$/.test(token)) continue;
        if (title.includes(token)) score += 4;
        else if (description.includes(token)) score += 1;
        else if (category.includes(token)) score += 1;
        if (haystack.includes(token)) tokenMatches += 1;
      }
      if (tokenMatches) reasons.push(`semantic_tokens:${tokenMatches}`);

      if (state.service_path === 'signature' && candidate.category === 'signature') {
        score += 2;
        reasons.push('signature_category');
      }

      return { ...candidate, score, match_reasons: reasons };
    })
    .filter((candidate) => candidate.score >= (destination ? 50 : 12))
    .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title))
    .slice(0, limit);
}
