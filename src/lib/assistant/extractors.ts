export function extractLiteralDestination(message: string) {
  const destinations: Array<[string, RegExp]> = [
    ['Istanbul', /\bistanbul\b|\bстамбул[а-я]*\b|伊斯坦布尔/iu],
    ['Bodrum', /\bbodrum\b|\bбодрум[а-я]*\b|博德鲁姆/iu],
    ['Cappadocia', /\bcappadocia\b|\bkapadokya\b|\bкаппадоки[а-я]*\b|卡帕多奇亚/iu],
    ['Puglia', /\bpuglia\b/iu],
    ['Aegean', /\baegean\b|\bege\b|爱琴海/iu],
    ['Turkey', /\bturkey\b|\btürkiye\b|\bturkiye\b|\bтурция\b|土耳其/iu],
  ];
  for (const [destination, pattern] of destinations) {
    if (pattern.test(message)) return destination;
  }
  return null;
}

export function extractLiteralDates(message: string) {
  const patterns = [
    /\b(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+\d{1,2}\s*(?:-|–|—|to)\s*\d{1,2}\b/i,
    /\b\d{1,2}\s*(?:-|–|—|to)\s*\d{1,2}\s+(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\b/i,
    /\b(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\b/i,
    /\b(?:tomorrow|today|tonight|this weekend|next weekend|next spring|next summer|next autumn|next fall|next winter)\b/i,
    /\b\d{1,2}[.–-]\d{1,2}[.–-](?:\d{2}|\d{4})\b/u,
    /\b\d{1,2}\s*(?:-|–|—)\s*\d{1,2}\s+(?:ocak|şubat|mart|nisan|mayıs|haziran|temmuz|ağustos|eylül|ekim|kasım|aralık)\b/iu,
    /\d{1,2}\s*[–—-]\s*\d{1,2}\s+(?:января|февраля|марта|апреля|мая|июня|июля|августа|сентября|октября|ноября|декабря)/iu,
    /\b(?:завтра|сегодня|на выходных|следующей весной|следующим летом)\b/iu,
    /\d{1,2}月\d{1,2}日(?:至|到|[-–—])\d{1,2}日/u,
    /(?:明天|今天|本周末|下周末|明年春天|明年夏天)/u,
  ];
  for (const pattern of patterns) {
    const match = message.match(pattern);
    if (match?.[0]) return match[0].trim();
  }
  return null;
}

const NUMBER_WORDS: Record<string, number> = {
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
  twelve: 12,
  fifteen: 15,
  twenty: 20,
  thirty: 30,
  bir: 1,
  iki: 2,
  üç: 3,
  dort: 4,
  dört: 4,
  bes: 5,
  beş: 5,
  alti: 6,
  altı: 6,
};

export function extractGuestCount(message: string) {
  const numeric = message.match(
    /\b(\d{1,3})\s*(?:guests?|people|persons?|travellers?|travelers?|misafir|kişi|человек|гост(?:я|ей)?|位客人|人)\b/iu
  );
  if (numeric) return Math.max(1, Math.min(100, Number(numeric[1])));
  const word = message
    .toLocaleLowerCase('en-US')
    .match(
      /\b(one|two|three|four|five|six|seven|eight|nine|ten|twelve|fifteen|twenty|thirty|bir|iki|üç|dort|dört|bes|beş|alti|altı)\s+(?:guests?|people|travellers?|travelers?|misafir|kişi)\b/iu
    );
  if (word) return NUMBER_WORDS[word[1]] ?? null;
  if (/\b(?:нас двое|мы вдвоем|мы вдвоём|двое гостей|два гостя)\b/iu.test(message)) return 2;
  if (/\b(?:трое гостей|три гостя)\b/iu.test(message)) return 3;
  if (/\b(?:четверо гостей|четыре гостя)\b/iu.test(message)) return 4;
  const zh = message.match(/(?:我们)?([一二两三四五六七八九十])位客人/u);
  if (zh) {
    const map: Record<string, number> = {
      一: 1,
      二: 2,
      两: 2,
      三: 3,
      四: 4,
      五: 5,
      六: 6,
      七: 7,
      八: 8,
      九: 9,
      十: 10,
    };
    return map[zh[1]] ?? null;
  }
  return null;
}

export function detectServicePathSignal(message: string) {
  const text = message.toLocaleLowerCase('en-US');
  const blackSignals = [
    'absolute discretion',
    'no publicity',
    'no social media',
    'confidential',
    'private after-hours',
    'after-hours access',
    'invitation-only',
    'off-market access',
    'tam gizlilik',
    'mahrem',
    'gizli erişim',
    'м полн',
    'конфиденциаль',
    'без публикац',
    '绝对保密',
    '不公开',
    '保密',
  ];
  if (blackSignals.some((signal) => text.includes(signal))) return 'black' as const;

  const corporateSignals = [
    'corporate',
    'board retreat',
    'board meeting',
    'executives',
    'executive team',
    'leadership retreat',
    'company retreat',
    'team retreat',
    'brand activation',
    'client activation',
    'client hospitality',
    'incentive group',
    'incentive trip',
    'şirket',
    'yönetim kurulu',
    'kurumsal',
    'marka etkinliği',
    'корпоратив',
    'совет директоров',
    'руководител',
    'бренд',
    '企业',
    '董事会',
    '高管',
    '品牌活动',
  ];
  if (corporateSignals.some((signal) => text.includes(signal))) return 'corporate' as const;

  return null;
}
