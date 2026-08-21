import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import trDictionary from '@/locales/tr.json';
import {
  turkishCookiesContent,
  turkishPrivacyContent,
  turkishTermsContent,
} from '@/features/static-pages/legal';
import {
  buildLocaleSwitchCandidate,
  createLocaleSwitchPlan,
  finalizeLocaleSwitchTarget,
} from './locale-switch';
import {
  getFooterNavigationRoutes,
  getLegalNavigationRoutes,
  getPrimaryNavigationRoutes,
  getPrivateInquiryHref,
} from './static-routes';

function readSource(filePath: string): string {
  return readFileSync(join(process.cwd(), filePath), 'utf8');
}

function readContactSource(): string {
  const overridePath = process.env.CONTACT_VALIDATION_SOURCE_FILE;

  if (overridePath) {
    return readFileSync(overridePath, 'utf8');
  }

  return readSource('src/app/contact/ContactPageClient.tsx');
}

function getValidateBody(source: string): string {
  const validateStart = source.indexOf('const validate = (): boolean => {');
  assert.notEqual(validateStart, -1, 'Contact validate function must exist');

  const bodyStart = source.indexOf('{', validateStart);
  assert.notEqual(bodyStart, -1, 'Contact validate function body must start');

  let depth = 0;
  for (let index = bodyStart; index < source.length; index += 1) {
    const character = source[index];

    if (character === '{') {
      depth += 1;
    }

    if (character === '}') {
      depth -= 1;

      if (depth === 0) {
        return source.slice(bodyStart + 1, index);
      }
    }
  }

  assert.fail('Contact validate function body must close');
}

function assertContactValidationParity(source: string): void {
  const validateBody = getValidateBody(source);

  assert.equal(
    validateBody.includes('if (!formData.name.trim())'),
    true,
    'Name must remain a required client-side field'
  );
  assert.equal(
    validateBody.includes('newErrors.name = copy.requiredName'),
    true,
    'Name required error must remain locale-copy backed'
  );
  assert.equal(
    validateBody.includes('if (!formData.email.trim())'),
    true,
    'Email must remain a required client-side field'
  );
  assert.equal(
    validateBody.includes('newErrors.email = copy.requiredEmail'),
    true,
    'Email required error must remain locale-copy backed'
  );
  assert.equal(
    validateBody.includes('validateEmail(formData.email)'),
    true,
    'Email-format validation must remain present'
  );
  assert.equal(
    validateBody.includes('newErrors.email = copy.invalidEmail'),
    true,
    'Invalid-email error must remain locale-copy backed'
  );
  assert.equal(
    /newErrors\.message\s*=/.test(validateBody),
    false,
    'Message must remain optional in EN and TR client-side validation'
  );
  assert.equal(
    /newErrors\.intent\s*=/.test(validateBody),
    false,
    'Intent must remain optional in EN and TR client-side validation'
  );
  assert.equal(
    /locale\s*={0,3}\s*['"]tr['"]/.test(validateBody),
    false,
    'Locale conditions must not alter Contact required-field policy'
  );
  assert.equal(
    /locale\s*={0,3}\s*['"]en['"]/.test(validateBody),
    false,
    'Locale conditions must not alter Contact required-field policy'
  );
}

function walkFiles(directory: string): string[] {
  return readdirSync(directory).flatMap((entry) => {
    const fullPath = join(directory, entry);
    const stats = statSync(fullPath);

    if (stats.isDirectory()) {
      return walkFiles(fullPath);
    }

    return fullPath;
  });
}

function assertExists(filePath: string): void {
  assert.equal(existsSync(join(process.cwd(), filePath)), true, `Missing route file: ${filePath}`);
}

[
  'src/app/(tr)/tr/philosophy/page.tsx',
  'src/app/(tr)/tr/contact/page.tsx',
  'src/app/(tr)/tr/privacy/page.tsx',
  'src/app/(tr)/tr/terms/page.tsx',
  'src/app/(tr)/tr/cookies/page.tsx',
].forEach(assertExists);

const philosophySource = readSource('src/features/static-pages/philosophy.tsx');
[
  'BİZ, STRATEJİK BİR',
  'DENEYİM TASARIM',
  'STÜDYOSUYUZ.',
  'Deneyimleri ölçülülük, hassasiyet ve disiplinli uygulamayla yapılandırıyoruz.',
  'Deneyimleri çoğaltmıyoruz.',
  'Onları rafine ediyoruz.',
  'Yolculuk, en yüksek hâlinde hareket değildir.',
  'Bir mimaridir.',
  'Herkes bir destinasyonu düzenleyebilir.',
  'Çok az kişi bir deneyimi tasarlayabilir.',
  'Biz deneyimler tasarlıyoruz.',
  'CREARE deneyiminde hiçbir şey tesadüfi değildir.',
  'Niyet, güzergahtan önce gelir.',
  'Erişim, görünürlükten önce gelir.',
  'Akış, gösteriden önce gelir.',
  'Uygulama, ifadeden önce gelir.',
  'Lüks fazlalık değildir.',
  'Kontroldür.',
  'Sürtüşmenin yokluğu asla tesadüf değildir.',
  'Tasarlanır.',
  'Bilinçle.',
].forEach((copy) => {
  assert.equal(philosophySource.includes(copy), true, `Missing locked Philosophy copy: ${copy}`);
});

['Stratejik Seyahat Tasarım Stüdyosuyuz', 'Pozlamadan önce erişim', 'Kasıtlı olarak'].forEach(
  (forbidden) => {
    assert.equal(
      philosophySource.includes(forbidden),
      false,
      `Forbidden old Philosophy phrase must not appear: ${forbidden}`
    );
  }
);

const contactSource = readContactSource();
[
  'Özel Talepler',
  'Kişisel olarak yanıt veriyoruz.',
  'Stratejik çalışmalar, özel tasarım talepleri ve gizlilik gerektiren iş birlikleri için.',
  'DOĞRUDAN HAT',
  'Özel talepler için doğrudan iletişim.',
  'ÖZEL MESAJ HATTI',
  'Özel ve güvenli mesajlaşma.',
  'E-POSTA',
  'Özel talepler, yapılandırılmış öneriler ve stratejik iş birlikleri için.',
  'KONUM',
  'Görüşmeler yalnızca randevu ile gerçekleştirilir.',
  'CREARE™ ile Görüşün',
  'AD SOYAD',
  'Adınız ve soyadınız',
  'TALEBİN NİTELİĞİ',
  'Özel Deneyim Tasarımı',
  'Kurumsal ve Marka Deneyimi',
  'Kültürel Deneyim',
  'Ultra Özel Erişim',
  'Uzun Vadeli İş Birliği',
  'MESAJ',
  'Vizyonunuzu ve aradığınız yapıyı paylaşın...',
  'Hedefinizi paylaşın. Yapıyı biz tasarlayalım.',
  'TALEBİ GÖNDER →',
  'Tüm talepler kişisel olarak incelenir ve kesin gizlilikle ele alınır.',
  'Gönderiliyor…',
  'Teşekkür ederiz.',
  'Talebinizi aldık. Sizinle en kısa sürede iletişime geçeceğiz.',
  'Lütfen adınızı ve soyadınızı girin.',
  'Lütfen e-posta adresinizi girin.',
  'Lütfen geçerli bir e-posta adresi girin.',
  'Lütfen talebinizle ilgili kısa bir açıklama paylaşın.',
  'Talebiniz şu anda gönderilemedi. Lütfen tekrar deneyin veya bizimle doğrudan iletişime geçin.',
  'KÜRESEL UYGULAMA KAPASİTESİ',
  'Sınır ötesi deneyim uygulaması • Marka ve kurum iş birlikleri • Çoklu pazar koordinasyonu • Yüksek güvenlik gerektiren çalışmalar',
  'Uluslararası ölçekte çalışıyoruz.',
  'İstanbul ve Bodrum kökleriyle.',
  'Deneyim kapsamı ve zaman planı gizlilik içinde görüşülür.',
  'İstanbul • Bodrum • Uluslararası',
].forEach((copy) => {
  assert.equal(contactSource.includes(copy), true, `Missing locked Contact copy: ${copy}`);
});

[
  '+90 541 220 3000',
  'direct@crearetravel.com',
  'CREARE Travel Consultancy Limited Co.',
  'Ferko Signature Plaza',
  'Buyukdere Cd. No.175',
  'WhatsApp',
  'WeChat',
].forEach((protectedValue) => {
  assert.equal(
    contactSource.includes(protectedValue),
    true,
    `Protected contact value must remain exact: ${protectedValue}`
  );
});

assert.equal(
  contactSource.includes("fetch('/api/contact'"),
  true,
  'Contact API endpoint preserved'
);
assert.equal(contactSource.includes('trackFormStart'), true, 'Form analytics start preserved');
assert.equal(contactSource.includes('trackFormSubmit'), true, 'Form analytics submit preserved');
assert.equal(contactSource.includes('trackFormSuccess'), true, 'Form analytics success preserved');
assert.equal(contactSource.includes('trackFormError'), true, 'Form analytics error preserved');
assert.equal(
  contactSource.includes('aria-pressed={isSelected}'),
  true,
  'Intent buttons expose aria-pressed'
);
assert.equal(
  contactSource.includes("formStatus === 'loading' || isSubmitting.current"),
  true,
  'Double-submit guard preserved'
);
assertContactValidationParity(contactSource);

assert.equal(turkishPrivacyContent.sections.length, 6, 'Privacy section count must match EN');
assert.equal(turkishTermsContent.sections.length, 8, 'Terms section count must match EN');
assert.equal(turkishCookiesContent.sections.length, 5, 'Cookies section count must match EN');
assert.equal(turkishPrivacyContent.lastUpdated, 'Son Güncelleme: 4 Mart 2026');
assert.equal(turkishTermsContent.sections[0].heading, 'Koşulların Kabulü');
assert.equal(turkishCookiesContent.sections[2].heading, 'Kullandığımız Çerez Türleri');

assert.deepEqual(
  getPrimaryNavigationRoutes('tr').map((route) => route.href),
  ['/tr/cultural-worlds', '/tr/experiences', '/tr/insights', '/tr/philosophy', '/tr/contact'],
  'TR Header links must include Philosophy and Contact'
);
assert.deepEqual(
  getFooterNavigationRoutes('tr').map((route) => route.href),
  ['/tr/cultural-worlds', '/tr/experiences', '/tr/insights', '/tr/philosophy', '/tr/contact'],
  'TR Footer links must include Philosophy and Contact'
);
assert.deepEqual(
  getLegalNavigationRoutes('tr').map((route) => route.href),
  ['/tr/privacy', '/tr/cookies', '/tr/terms'],
  'TR Footer legal links must be restored'
);

assert.equal(trDictionary.home.cta.label, 'ÖZEL TALEP');
assert.equal(trDictionary.home.cta.labelWithArrow, 'ÖZEL TALEP →');
assert.equal(trDictionary.home.cta.contact, 'ÖZEL TALEP');
assert.equal(trDictionary.common.beginPrivateConversation, 'ÖZEL TALEP');
assert.equal(getPrivateInquiryHref('tr'), '/tr/contact');
assert.equal(
  getPrivateInquiryHref('tr', '?source=experience&slug=test'),
  '/tr/contact?source=experience&slug=test'
);

['/philosophy', '/contact', '/privacy', '/terms', '/cookies'].forEach((path) => {
  const trPath = `/tr${path}`;
  assert.equal(buildLocaleSwitchCandidate(path, 'tr'), trPath, `EN to TR mapping failed: ${path}`);
  assert.equal(
    buildLocaleSwitchCandidate(trPath, 'en'),
    path,
    `TR to EN mapping failed: ${trPath}`
  );
  assert.equal(
    finalizeLocaleSwitchTarget(createLocaleSwitchPlan(path, 'tr'), true).targetPath,
    trPath
  );
  assert.equal(
    finalizeLocaleSwitchTarget(createLocaleSwitchPlan(trPath, 'en'), true).targetPath,
    path
  );
});

[
  ['src/app/(tr)/tr/philosophy/page.tsx', 'Felsefemiz — Creare', '/tr/philosophy'],
  ['src/app/(tr)/tr/contact/page.tsx', 'Özel Talepler — Creare', '/tr/contact'],
  ['src/app/(tr)/tr/privacy/page.tsx', 'Gizlilik Politikası — Creare', '/tr/privacy'],
  ['src/app/(tr)/tr/terms/page.tsx', 'Kullanım Koşulları — Creare', '/tr/terms'],
  ['src/app/(tr)/tr/cookies/page.tsx', 'Çerez Politikası — Creare', '/tr/cookies'],
].forEach(([filePath, title, path]) => {
  const source = readSource(filePath);
  const unprefixedPath = path.replace(/^\/tr/, '') || '/';
  assert.equal(source.includes(title), true, `TR metadata title missing: ${filePath}`);
  assert.equal(
    source.includes(`localizePathname('${unprefixedPath}', 'tr')`),
    true,
    `TR metadata canonical path missing: ${filePath}`
  );
  assert.equal(
    source.includes('buildTurkishStaticPageMetadata'),
    true,
    `TR metadata helper missing: ${filePath}`
  );
});

const runtimeSources = walkFiles(join(process.cwd(), 'src')).filter(
  (filePath) => /\.(ts|tsx)$/.test(filePath) && !filePath.endsWith('tr-static-pages.assertions.ts')
);

runtimeSources.forEach((filePath) => {
  const source = readFileSync(filePath, 'utf8');
  assert.equal(
    source.includes('tr-static-pages.assertions'),
    false,
    `tr-static-pages.assertions must not be imported by runtime source: ${filePath}`
  );
});

console.info('TR static pages assertions passed');
