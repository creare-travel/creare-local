import type { SiteLocale } from '@/lib/i18n/config';

export interface ExperienceEditorialSupplement {
  expectedTitle: string;
  expectedCategory: 'signature' | 'lab' | 'black';
  shortDescription: string;
  groupSizeNote: string;
  programmeNote: string;
  ctaHeading: string;
  ctaSupportingText: string;
  ctaAccessLine: string;
  openGraphDescription: string;
  heroAltText: string;
}

const EXPERIENCE_EDITORIAL_SUPPLEMENTS = {
  'silk-road-istanbul': {
    en: {
      expectedTitle: 'Silk Road Istanbul™',
      expectedCategory: 'signature',
      shortDescription:
        'A cultural journey through Istanbul shaped around the final traces of the Silk Road, connecting Chinese heritage, Ottoman history, and the living atmosphere of the city.',
      groupSizeNote: 'Larger private groups can be accommodated upon request.',
      programmeNote: '',
      ctaHeading: 'Reserve Silk Road Istanbul™',
      ctaSupportingText:
        'Share your preferred date, group profile, and cultural interests; we will plan the journey around suitable visiting conditions and access.',
      ctaAccessLine: 'Limited access.',
      openGraphDescription:
        'Trace the final echoes of the Silk Road through Istanbul’s historic spaces, trade memory, and cultural continuities.',
      heroAltText:
        'Private group exploring the Silk Road narrative across Istanbul’s historic peninsula.',
    },
    tr: {
      expectedTitle: 'İpek Yolu: İstanbul™',
      expectedCategory: 'signature',
      shortDescription:
        'Çin ile İstanbul arasındaki görünmez bağları ticaret, saray kültürü ve ortak medeniyet hafızası üzerinden izleyen küratöryel bir kültür yolculuğu.',
      groupSizeNote: 'Daha büyük özel gruplar talep üzerine planlanabilir.',
      programmeNote: '',
      ctaHeading: 'İpek Yolu: İstanbul™ Deneyimini Rezerve Edin',
      ctaSupportingText:
        'Tercih ettiğiniz tarihi, grup profilinizi ve kültürel ilgi alanlarınızı paylaşın; yolculuğu uygun ziyaret koşulları ve erişim doğrultusunda planlayalım.',
      ctaAccessLine: 'Erişim sınırlıdır.',
      openGraphDescription:
        'İstanbul’un tarihî mekânlarında İpek Yolu’nun son izlerini, ticaret hafızasını ve kültürel sürekliliğini keşfedin.',
      heroAltText:
        'İstanbul’un tarihî yarımadasında İpek Yolu anlatısını keşfeden özel grup konukları.',
    },
    zh: {
      expectedTitle: 'Silk Road Istanbul™',
      expectedCategory: 'signature',
      shortDescription:
        '一段循着丝绸之路最后痕迹展开的伊斯坦布尔文化旅程，将中华文化遗产、奥斯曼历史与这座城市鲜活的气息相连。',
      groupSizeNote: '人数更多的私人团体可应要求另行安排。',
      programmeNote: '',
      ctaHeading: '预订 Silk Road Istanbul™',
      ctaSupportingText:
        '请告知您偏好的日期、团队构成与文化兴趣；我们将结合适宜的参观条件与通达安排来规划旅程。',
      ctaAccessLine: '名额有限。',
      openGraphDescription:
        '循着伊斯坦布尔的历史空间、贸易记忆与文化延续，追寻丝绸之路最后的回响。',
      heroAltText: '私人团体在伊斯坦布尔历史半岛探索丝绸之路叙事。',
    },
  },
  'istanbul-through-the-lens': {
    en: {
      expectedTitle: 'Istanbul Through the Lens™',
      expectedCategory: 'signature',
      shortDescription:
        'A bespoke visual exploration of Istanbul led by a documentary photographer with years of experience documenting the city and navigating its lesser-known neighbourhoods, spaces, and everyday rhythms.',
      groupSizeNote: '',
      programmeNote: '',
      ctaHeading: 'Make a Private Inquiry for Istanbul Through the Lens™',
      ctaSupportingText:
        'Share your group’s interests, photographic approach, preferred duration, and equipment requirements; we will compose the route accordingly.',
      ctaAccessLine: 'Arranged privately.',
      openGraphDescription:
        'Explore Istanbul through light, rhythm, neighbourhoods, and everyday life with a professional documentary photographer.',
      heroAltText:
        'Private group working with a documentary photographer on the streets of Istanbul.',
    },
    tr: {
      expectedTitle: 'Istanbul Through the Lens™',
      expectedCategory: 'signature',
      shortDescription:
        'İstanbul’u uzun yıllardır belgeleyen ve şehrin az bilinen mahalleleri, mekânları ve gündelik yaşam katmanları konusunda güçlü saha deneyimine sahip bir belgesel fotoğrafçısı eşliğinde; tarihi çevrelerden kıyı hatlarına, çarşılardan çağdaş kent dokusuna uzanabilen, gruba özel tasarlanmış görsel bir İstanbul keşfi.',
      groupSizeNote: '',
      programmeNote: '',
      ctaHeading: 'Istanbul Through the Lens™ İçin Özel Talep Oluşturun',
      ctaSupportingText:
        'Grubunuzun ilgi alanlarını, fotoğraf yaklaşımını, tercih ettiğiniz süreyi ve ekipman ihtiyaçlarını paylaşın; rotayı buna göre kurgulayalım.',
      ctaAccessLine: 'Özel olarak düzenlenir.',
      openGraphDescription:
        'İstanbul’u ışık, ritim, mahalleler ve gündelik yaşam üzerinden profesyonel bir belgesel fotoğrafçısıyla keşfedin.',
      heroAltText:
        'İstanbul sokaklarında belgesel fotoğrafçısı eşliğinde çalışan özel grup konukları.',
    },
    zh: {
      expectedTitle: 'Istanbul Through the Lens™',
      expectedCategory: 'signature',
      shortDescription:
        '由一位长期记录伊斯坦布尔、熟悉其鲜为人知的街区、空间与日常节奏的纪实摄影师带领，展开一场为宾客量身设计的城市视觉探索。',
      groupSizeNote: '',
      programmeNote: '',
      ctaHeading: '就 Istanbul Through the Lens™ 提交私人咨询',
      ctaSupportingText: '请告知团队兴趣、摄影方式、偏好时长与器材需求；我们将据此构成路线。',
      ctaAccessLine: '私人安排。',
      openGraphDescription: '与专业纪实摄影师一起，透过光线、节奏、街区与日常生活探索伊斯坦布尔。',
      heroAltText: '私人团体在伊斯坦布尔街头与纪实摄影师共同创作。',
    },
  },
  'floating-salon-d-opera': {
    en: {
      expectedTitle: 'Floating Salon d’Opera™',
      expectedCategory: 'signature',
      shortDescription:
        'A floating baroque salon experience staged on the water in Istanbul or Bodrum, where opera, chamber music, dining, and live performance are composed around the setting, the group, and the character of the evening.',
      groupSizeNote: '',
      programmeNote: '',
      ctaHeading: 'Make a Private Inquiry for Floating Salon d’Opera™',
      ctaSupportingText:
        'Share your destination, group size, artistic direction, and preferred hospitality format; we will compose the evening around your brief.',
      ctaAccessLine: 'Arranged privately.',
      openGraphDescription:
        'A baroque-inspired evening on the water shaped around opera, chamber music, and bespoke hospitality.',
      heroAltText: 'Opera and chamber music performance aboard a private vessel at night.',
    },
    tr: {
      expectedTitle: 'Floating Salon d’Opera™',
      expectedCategory: 'signature',
      shortDescription:
        'İstanbul veya Bodrum’da su üzerinde kurgulanan; opera, oda müziği, gastronomi ve canlı performansı gecenin mekânı, konukları ve ritmi etrafında bir araya getiren Barok esintili yüzen salon deneyimi.',
      groupSizeNote: '',
      programmeNote: '',
      ctaHeading: 'Floating Salon d’Opera™ İçin Özel Talep Oluşturun',
      ctaSupportingText:
        'Destinasyonunuzu, grup büyüklüğünüzü, sanatsal yaklaşımınızı ve tercih ettiğiniz ağırlama formatını paylaşın; geceyi brief’iniz etrafında oluşturalım.',
      ctaAccessLine: 'Özel olarak düzenlenir.',
      openGraphDescription:
        'Su üzerinde opera, oda müziği ve kişiye özel ağırlama etrafında tasarlanan Barok esintili bir gece.',
      heroAltText: 'Gece ışığında özel bir teknede gerçekleşen opera ve oda müziği performansı.',
    },
    zh: {
      expectedTitle: 'Floating Salon d’Opera™',
      expectedCategory: 'signature',
      shortDescription:
        '一场在伊斯坦布尔或博德鲁姆水上呈现的漂浮巴洛克沙龙体验，歌剧、室内乐、餐饮与现场表演围绕场景、团队与夜晚的气质共同构成。',
      groupSizeNote: '',
      programmeNote: '',
      ctaHeading: '就 Floating Salon d’Opera™ 提交私人咨询',
      ctaSupportingText:
        '请告知目的地、团队规模、艺术方向与偏好的待客形式；我们将围绕您的需求简报构成这个夜晚。',
      ctaAccessLine: '私人安排。',
      openGraphDescription: '一场受巴洛克启发的水上夜晚，以歌剧、室内乐与定制待客形式共同构成。',
      heroAltText: '夜间私人船只上的歌剧与室内乐演出。',
    },
  },
  'culinary-arena-bodrum': {
    en: {
      expectedTitle: 'Culinary Arena™',
      expectedCategory: 'signature',
      shortDescription:
        'A high-energy culinary experience staged in the open-air setting of a Bodrum restaurant recognized by the Michelin Guide in 2025 and 2026, shaped around teamwork, creativity, improvisation, and gastronomic competition.',
      groupSizeNote: '',
      programmeNote: '',
      ctaHeading: 'Plan Culinary Arena™',
      ctaSupportingText:
        'Share your group profile, team objectives, and preferred challenge structure; we will compose the arena around your brief.',
      ctaAccessLine: 'By arrangement.',
      openGraphDescription:
        'Teams compete across professional kitchen stations through creativity, improvisation, and gastronomic challenges.',
      heroAltText: 'Corporate teams competing at open-air culinary workstations in Bodrum.',
    },
    tr: {
      expectedTitle: 'Culinary Arena™',
      expectedCategory: 'signature',
      shortDescription:
        'Bodrum’da 2025 ve 2026 Michelin Guide seçkisinde yer alan bir restoranın açık hava ortamında; ekip uyumu, yaratıcılık, doğaçlama ve gastronomik rekabet etrafında kurgulanan yüksek enerjili bir mutfak deneyimi.',
      groupSizeNote: '',
      programmeNote: '',
      ctaHeading: 'Culinary Arena™ Deneyimini Planlayın',
      ctaSupportingText:
        'Grup profilinizi, takım hedeflerinizi ve tercih ettiğiniz challenge yapısını paylaşın; arenayı brief’inize göre kurgulayalım.',
      ctaAccessLine: 'Önceden planlanır.',
      openGraphDescription:
        'Takımlar profesyonel mutfak istasyonlarında yaratıcılık, doğaçlama ve gastronomik rekabet etrafında buluşur.',
      heroAltText: 'Bodrum’da açık hava mutfak istasyonlarında yarışan kurumsal ekipler.',
    },
    zh: {
      expectedTitle: 'Culinary Arena™',
      expectedCategory: 'signature',
      shortDescription:
        '一场在博德鲁姆某餐厅露天场地举行的高能量美食体验；该餐厅于2025及2026年获《米其林指南》收录，体验围绕团队协作、创意、即兴与美食竞赛展开。',
      groupSizeNote: '',
      programmeNote: '',
      ctaHeading: '规划 Culinary Arena™',
      ctaSupportingText:
        '请告知团队构成、团队目标与偏好的挑战结构；我们将围绕您的需求简报构成竞技场。',
      ctaAccessLine: '须提前安排。',
      openGraphDescription: '团队在专业厨房工作台上，以创意、即兴与美食挑战展开竞赛。',
      heroAltText: '企业团队在博德鲁姆露天美食工作台前展开竞赛。',
    },
  },
  'the-salon-of-hands': {
    en: {
      expectedTitle: 'The Sound of Clay™',
      expectedCategory: 'signature',
      shortDescription:
        'An artist-led ceramic encounter in Bodrum exploring how clay moves from form to sound through hands-on making, material knowledge, and ceramic percussion.',
      groupSizeNote: '',
      programmeNote: '',
      ctaHeading: 'Reserve The Sound of Clay™',
      ctaSupportingText:
        'Share your preferred date, group profile, and any optional requirements for completing the works.',
      ctaAccessLine: 'Limited access.',
      openGraphDescription:
        'Explore how clay moves from form to sound through artist-led ceramic making and rhythm in Bodrum.',
      heroAltText:
        'Guests working with clay and ceramic percussion inside an artist’s Bodrum studio.',
    },
    tr: {
      expectedTitle: 'The Sound of Clay™',
      expectedCategory: 'signature',
      shortDescription:
        'Bodrum’da sanatçının kendi atölyesinde, kilin formdan sese dönüşümünü; seramik üretimi, malzeme bilgisi ve perküsyon üzerinden keşfeden, sanatçı eşliğinde kurgulanmış bir deneyim.',
      groupSizeNote: '',
      programmeNote: '',
      ctaHeading: 'The Sound of Clay™ Deneyimini Rezerve Edin',
      ctaSupportingText:
        'Tercih ettiğiniz tarihi, grup profilinizi ve eserlerin tamamlanmasına yönelik opsiyonel taleplerinizi paylaşın.',
      ctaAccessLine: 'Erişim sınırlıdır.',
      openGraphDescription:
        'Kilin formdan sese dönüşümünü sanatçı eşliğinde uygulamalı seramik ve ritim üzerinden keşfedin.',
      heroAltText:
        'Bodrum’daki sanatçı atölyesinde kil ve seramik perküsyon üzerinde çalışan konuklar.',
    },
    zh: {
      expectedTitle: 'The Sound of Clay™',
      expectedCategory: 'signature',
      shortDescription:
        '一场由艺术家带领的博德鲁姆陶艺相遇，通过亲手创作、材料知识与陶瓷打击乐，探索黏土如何从形态走向声音。',
      groupSizeNote: '',
      programmeNote: '',
      ctaHeading: '预订 The Sound of Clay™',
      ctaSupportingText: '请告知偏好的日期、团队构成，以及完成作品所需的任何可选服务。',
      ctaAccessLine: '名额有限。',
      openGraphDescription:
        '在博德鲁姆，由艺术家带领陶瓷创作与节奏探索，感受黏土如何从形态走向声音。',
      heroAltText: '宾客在艺术家的博德鲁姆工作室内制作陶艺并体验陶瓷打击乐。',
    },
  },
  'golden-horn-regatta': {
    en: {
      expectedTitle: 'Golden Horn Regatta™',
      expectedCategory: 'signature',
      shortDescription:
        'A private rowing regatta on Istanbul’s Golden Horn, transforming rhythm, coordination, and team competition into a high-energy shared experience.',
      groupSizeNote: '',
      programmeNote: '',
      ctaHeading: 'Plan Golden Horn Regatta™',
      ctaSupportingText:
        'Share your group size, team structure, and preferred race format; we will plan the regatta around your brief.',
      ctaAccessLine: 'By arrangement.',
      openGraphDescription:
        'Teams combine rhythm, coordination, and race strategy in a genuine rowing regatta on Istanbul’s Golden Horn.',
      heroAltText: 'Corporate rowing teams racing in four-person boats on the Golden Horn.',
    },
    tr: {
      expectedTitle: 'Golden Horn Regatta™',
      expectedCategory: 'signature',
      shortDescription:
        'Haliç’in tarihî su hattını; ritim, koordinasyon ve takım rekabeti etrafında yapılandırılmış özel bir kürek regattasına dönüştüren yüksek enerjili bir takım deneyimi.',
      groupSizeNote: '',
      programmeNote: '',
      ctaHeading: 'Golden Horn Regatta™ Deneyimini Planlayın',
      ctaSupportingText:
        'Grup büyüklüğünüzü, takım yapınızı ve tercih ettiğiniz yarış formatını paylaşın; regattayı brief’inize göre planlayalım.',
      ctaAccessLine: 'Önceden planlanır.',
      openGraphDescription:
        'Takımlar Haliç üzerinde ritim, koordinasyon ve yarış stratejisini gerçek bir kürek regattasında birleştirir.',
      heroAltText: 'Haliç üzerinde dört kişilik teknelerle yarışan kurumsal kürek takımları.',
    },
    zh: {
      expectedTitle: 'Golden Horn Regatta™',
      expectedCategory: 'signature',
      shortDescription:
        '一场在伊斯坦布尔金角湾举行的私人赛艇竞赛，将节奏、协作与团队竞争转化为充满能量的共同体验。',
      groupSizeNote: '',
      programmeNote: '',
      ctaHeading: '规划 Golden Horn Regatta™',
      ctaSupportingText:
        '请告知团队规模、队伍结构与偏好的竞赛形式；我们将围绕您的需求简报规划竞赛。',
      ctaAccessLine: '须提前安排。',
      openGraphDescription: '各队在伊斯坦布尔金角湾的真实赛艇竞赛中结合节奏、协作与竞赛策略。',
      heroAltText: '企业赛艇团队在金角湾驾驶四人艇竞赛。',
    },
  },
  'princes-islands-regatta': {
    en: {
      expectedTitle: 'Princes’ Islands Regatta™',
      expectedCategory: 'lab',
      shortDescription:
        'A private sailing regatta off Istanbul, combining hands-on training, an island stop, and team racing aboard a fleet of same-class, performance-matched sailing yachts.',
      groupSizeNote: '',
      programmeNote: '',
      ctaHeading: 'Plan Princes’ Islands Regatta™',
      ctaSupportingText:
        'Share your group size, participant profile, and preferred level of competition; we will compose the fleet and flow around your brief.',
      ctaAccessLine: 'By arrangement.',
      openGraphDescription:
        'Crews take on real sailing roles across training, an island stop, and a regatta aboard matched yachts.',
      heroAltText: 'Private group teams racing matched sailing yachts off the Princes’ Islands.',
    },
    tr: {
      expectedTitle: 'Princes’ Islands Regatta™',
      expectedCategory: 'lab',
      shortDescription:
        'İstanbul açıklarında, aynı sınıf ve performans açısından dengelenmiş yelkenli teknelerle gerçekleştirilen; eğitim, ada molası ve takım yarışını bir araya getiren özel bir sailing regatta deneyimi.',
      groupSizeNote: '',
      programmeNote: '',
      ctaHeading: 'Princes’ Islands Regatta™ Deneyimini Planlayın',
      ctaSupportingText:
        'Grup büyüklüğünüzü, katılımcı profilinizi ve tercih ettiğiniz yarış seviyesini paylaşın; filo ve akışı brief’inize göre oluşturalım.',
      ctaAccessLine: 'Önceden planlanır.',
      openGraphDescription:
        'Ekipler aynı sınıf yelkenlilerle eğitim, ada molası ve regatta boyunca gerçek sailing görevlerini üstlenir.',
      heroAltText: 'Prens Adaları açıklarında aynı sınıf yelkenlilerle yarışan özel grup ekipleri.',
    },
    zh: {
      expectedTitle: 'Princes’ Islands Regatta™',
      expectedCategory: 'lab',
      shortDescription:
        '一场在伊斯坦布尔近海举行的私人帆船赛，宾客乘坐同一船型、性能匹配的帆船船队，结合亲手训练、岛上停留与团队竞赛。',
      groupSizeNote: '',
      programmeNote: '',
      ctaHeading: '规划 Princes’ Islands Regatta™',
      ctaSupportingText:
        '请告知团队规模、参与者构成与偏好的竞赛强度；我们将围绕您的需求简报构成船队与流程。',
      ctaAccessLine: '须提前安排。',
      openGraphDescription: '船员在性能匹配的帆船上承担真实职责，经历训练、岛上停留与帆船竞赛。',
      heroAltText: '私人团体驾驶性能匹配的帆船在王子群岛近海竞赛。',
    },
  },
  'the-studio-session': {
    en: {
      expectedTitle: 'The Studio Session™',
      expectedCategory: 'lab',
      shortDescription:
        'A private, hands-on art experience inside a working Istanbul atelier, inviting guests to create alongside professional artists across multiple disciplines while discovering materials, techniques, and the creative process from within.',
      groupSizeNote: '',
      programmeNote: '',
      ctaHeading: 'Plan The Studio Session™',
      ctaSupportingText:
        'Share your group profile, preferred disciplines, and half- or full-day format; we will compose the atelier flow around your brief.',
      ctaAccessLine: 'By arrangement.',
      openGraphDescription:
        'Guests enter the creative process across disciplines from ceramics to textile alongside professional artists.',
      heroAltText:
        'Private group creating across multiple disciplines inside an active Beykoz atelier in Istanbul.',
    },
    tr: {
      expectedTitle: 'The Studio Session™',
      expectedCategory: 'lab',
      shortDescription:
        'İstanbul’da çalışan bir sanat atölyesinin içine girerek; farklı disiplinlerden profesyonel sanatçılarla birlikte üretmeye, malzemeyi keşfetmeye ve yaratıcı sürecin parçası olmaya davet eden özel bir sanat deneyimi.',
      groupSizeNote: '',
      programmeNote: '',
      ctaHeading: 'The Studio Session™ Deneyimini Planlayın',
      ctaSupportingText:
        'Grup profilinizi, tercih ettiğiniz disiplinleri ve yarım ya da tam gün formatını paylaşın; atölye akışını brief’inize göre oluşturalım.',
      ctaAccessLine: 'Önceden planlanır.',
      openGraphDescription:
        'Konuklar profesyonel sanatçılarla seramikten tekstile uzanan disiplinlerde aktif üretim sürecine katılır.',
      heroAltText:
        'İstanbul Beykoz’daki aktif atölyede farklı sanat disiplinlerinde çalışan özel grup.',
    },
    zh: {
      expectedTitle: 'The Studio Session™',
      expectedCategory: 'lab',
      shortDescription:
        '一场在伊斯坦布尔真实运作的工作室内举行的私人动手艺术体验，宾客与不同领域的专业艺术家共同创作，从内部认识材料、技法与创作过程。',
      groupSizeNote: '',
      programmeNote: '',
      ctaHeading: '规划 The Studio Session™',
      ctaSupportingText:
        '请告知团队构成、偏好的艺术领域，以及半天或全天形式；我们将围绕您的需求简报构成工作室流程。',
      ctaAccessLine: '须提前安排。',
      openGraphDescription: '宾客与专业艺术家并肩，从陶瓷到纺织，跨越不同领域进入创作过程。',
      heroAltText: '私人团体在伊斯坦布尔一间持续运作的贝伊科兹工作室内跨领域创作。',
    },
  },
  'bodrum-beach-games-rhythm-competition-celebration': {
    en: {
      expectedTitle: 'Bodrum Beach Games™ — Rhythm, Competition & Celebration',
      expectedCategory: 'lab',
      shortDescription:
        'A flexible coastal team experience in Bitez combining professionally guided rowing, paddleboarding, and windsurfing around coordination, shared rhythm, and friendly competition.',
      groupSizeNote:
        'Larger groups can be accommodated subject to programme design and operational planning.',
      programmeNote:
        'Programme Note: The sequence and delivery of activities may be adapted according to the client brief, group size, participant profile, weather, and sea conditions.',
      ctaHeading: 'Plan Bodrum Beach Games™',
      ctaSupportingText:
        'Share your group profile and programme objectives with us. We will compose the experience around your preferred pace, format, and level of competition.',
      ctaAccessLine: 'By arrangement.',
      openGraphDescription:
        'Professionally guided rowing, paddleboarding, and windsurfing in Bitez, composed as a team competition or a relaxed coastal experience.',
      heroAltText:
        'Teams taking part in professionally guided water activities along the Bitez shoreline in Bodrum.',
    },
    tr: {
      expectedTitle: 'Bodrum Beach Games™ — Rhythm, Competition & Celebration',
      expectedCategory: 'lab',
      shortDescription:
        'Bitez kıyısında profesyonel eğitmenler eşliğinde gerçekleştirilen rowing, paddleboarding ve windsurfing aktivitelerini; takım rekabeti, koordinasyon ve ortak ritim etrafında bir araya getiren esnek bir sahil deneyimi.',
      groupSizeNote:
        'Daha büyük gruplar, program tasarımı ve operasyonel planlamaya bağlı olarak ağırlanabilir.',
      programmeNote:
        'Program Notu: Aktivitelerin sırası ve uygulama biçimi; müşteri brief’i, grup büyüklüğü, katılımcı profili ile hava ve deniz koşullarına göre uyarlanabilir.',
      ctaHeading: 'Bodrum Beach Games™ Deneyimini Planlayın',
      ctaSupportingText:
        'Grup profilinizi ve program hedeflerinizi paylaşın; deneyimi tercih ettiğiniz tempo, format ve rekabet seviyesi etrafında kurgulayalım.',
      ctaAccessLine: 'Önceden planlanır.',
      openGraphDescription:
        'Bitez’de profesyonel yönlendirmeli üç su disiplini, takım rekabeti veya rahat bir kıyı deneyimi olarak kurgulanır.',
      heroAltText:
        'Bodrum Bitez kıyısında profesyonel yönlendirmeli su aktivitelerine katılan takımlar.',
    },
    zh: {
      expectedTitle: 'Bodrum Beach Games™ — Rhythm, Competition & Celebration',
      expectedCategory: 'lab',
      shortDescription:
        '一场在比泰兹海岸举行的灵活团队体验，由专业人员带领赛艇、桨板与帆板活动，围绕协作、共同节奏与友好竞争展开。',
      groupSizeNote: '人数更多的团队可在节目设计与运营规划允许时安排。',
      programmeNote:
        '节目说明：活动顺序与执行方式可根据客户需求简报、团队规模、参与者构成、天气及海况调整。',
      ctaHeading: '规划 Bodrum Beach Games™',
      ctaSupportingText:
        '请告知团队构成与节目目标。我们将围绕您偏好的节奏、形式与竞争强度构成体验。',
      ctaAccessLine: '须提前安排。',
      openGraphDescription:
        '在比泰兹由专业人员带领赛艇、桨板与帆板活动，可构成为团队竞赛或松弛的海岸体验。',
      heroAltText: '各团队在博德鲁姆比泰兹海岸参加由专业人员带领的水上活动。',
    },
  },
  'table-to-farm-bodrum': {
    en: {
      expectedTitle: 'Farm-to-Table Bodrum™',
      expectedCategory: 'signature',
      shortDescription:
        'A private sunset dining experience inside a working farm in Bodrum, beginning with cheese and wine overlooking the Aegean before moving to a chef-prepared dinner among the olive trees.',
      groupSizeNote: '',
      programmeNote:
        'Programme Note: The menu and precise flow of the evening may vary according to season, available produce, and operating conditions at the farm.',
      ctaHeading: 'Reserve Farm-to-Table Bodrum™',
      ctaSupportingText:
        'This experience is arranged privately for a maximum of eight guests. Availability is limited and subject to the farm’s seasonal and operational calendar.',
      ctaAccessLine: 'Access is limited.',
      openGraphDescription:
        'Begin with cheese and wine overlooking the Aegean before moving to a private chef-prepared dinner among the olive trees.',
      heroAltText: 'Private sunset table inside an olive farm in Bodrum overlooking the Aegean.',
    },
    tr: {
      expectedTitle: 'Farm-to-Table Bodrum™',
      expectedCategory: 'signature',
      shortDescription:
        'Bodrum’da aktif çalışan bir çiftliğin içinde gerçekleşen; Ege manzarasına karşı peynir ve şarapla başlayıp zeytin ağaçları arasında şefin hazırladığı özel akşam yemeğiyle devam eden gün batımı deneyimi.',
      groupSizeNote: '',
      programmeNote:
        'Program Notu: Menü ve akşamın kesin akışı; mevsime, mevcut ürünlere ve çiftliğin operasyon koşullarına göre değişebilir.',
      ctaHeading: 'Farm-to-Table Bodrum™ Deneyimini Rezerve Edin',
      ctaSupportingText:
        'Bu deneyim en fazla sekiz konuk için özel olarak düzenlenir. Müsaitlik sınırlıdır ve çiftliğin mevsimsel ve operasyonel takvimine bağlıdır.',
      ctaAccessLine: 'Erişim sınırlıdır.',
      openGraphDescription:
        'Ege manzarasına karşı peynir ve şarapla başlayan akşam, zeytin ağaçları arasında şefin hazırladığı özel yemekle devam eder.',
      heroAltText: 'Bodrum’da Ege manzarasına bakan zeytinlik içindeki özel gün batımı sofrası.',
    },
    zh: {
      expectedTitle: 'Farm-to-Table Bodrum™',
      expectedCategory: 'signature',
      shortDescription:
        '一场在博德鲁姆真实运作的农场内举行的私人日落晚餐体验，从俯瞰爱琴海的奶酪与葡萄酒开始，随后转入橄榄树间由主厨准备的晚餐。',
      groupSizeNote: '',
      programmeNote: '节目说明：菜单与当晚具体流程可能根据季节、可用物产及农场运营条件而变化。',
      ctaHeading: '预订 Farm-to-Table Bodrum™',
      ctaSupportingText: '本体验为最多八位宾客私人安排。名额有限，并取决于农场的季节与运营日程。',
      ctaAccessLine: '名额有限。',
      openGraphDescription: '先在爱琴海景前享用奶酪与葡萄酒，再转入橄榄树间的主厨私人晚餐。',
      heroAltText: '博德鲁姆橄榄农场内俯瞰爱琴海的私人日落餐桌。',
    },
  },
  'cocktail-atelier-mix-move-connect': {
    en: {
      expectedTitle: 'Cocktail Atelier™ — Mix, Move, Connect',
      expectedCategory: 'signature',
      shortDescription:
        'A hands-on social cocktail experience staged in a private group area at a Bodrum venue selected according to group size, where each guest creates three cocktails under the guidance of a professional mixologist.',
      groupSizeNote: '',
      programmeNote:
        'Programme Note: The precise flow, number of stations, and delivery format are adapted according to the client brief, group size, and selected venue. Competition is included only when requested.',
      ctaHeading: 'Plan Cocktail Atelier™',
      ctaSupportingText:
        'Share your group profile, preferred atmosphere, and programme objectives with us. We will compose the venue, workstation plan, and experience flow around your brief.',
      ctaAccessLine: 'This experience is privately arranged. Availability is limited.',
      openGraphDescription:
        'A professional mixologist, private bar stations, and three cocktails per guest in a social Bodrum atelier composed for private groups.',
      heroAltText:
        'Guests creating cocktails at private bar stations under the guidance of a professional mixologist in Bodrum.',
    },
    tr: {
      expectedTitle: 'Kokteyl Atölyesi™ — Karıştır, Hareket Et, Bağ Kur',
      expectedCategory: 'signature',
      shortDescription:
        'Bodrum’da grup büyüklüğüne göre seçilen bir mekânda, yalnızca gruba ayrılmış özel bir alanda gerçekleştirilen; profesyonel miksolojist eşliğinde her konuğun üç kokteyl hazırladığı uygulamalı ve sosyal bir kokteyl deneyimi.',
      groupSizeNote: '',
      programmeNote:
        'Program Notu: Kesin akış, istasyon sayısı ve uygulama düzeni; müşteri brief’i, grup büyüklüğü ve seçilen mekâna göre uyarlanır. Yarışma formatı yalnızca talep edilmesi halinde programa dahil edilir.',
      ctaHeading: 'Kokteyl Atölyesi™ Deneyimini Planlayın',
      ctaSupportingText:
        'Grup profilinizi, tercih ettiğiniz atmosferi ve program hedeflerinizi paylaşın. Mekânı, istasyon düzenini ve deneyim akışını brief’inize göre kurgulayalım.',
      ctaAccessLine: 'Bu deneyim özel olarak düzenlenir. Müsaitlik sınırlıdır.',
      openGraphDescription:
        'Profesyonel miksolojist, özel bar istasyonları ve her konuk için üç kokteyl; Bodrum’da gruba özel sosyal bir atölye.',
      heroAltText:
        'Bodrum’da özel bar istasyonlarında profesyonel miksolojist eşliğinde kokteyl hazırlayan konuklar.',
    },
    zh: {
      expectedTitle: 'Cocktail Atelier™ — Mix, Move, Connect',
      expectedCategory: 'signature',
      shortDescription:
        '一场在博德鲁姆根据团队规模选定的场地私人区域举行的动手社交鸡尾酒体验，每位宾客在专业调酒师指导下创作三款鸡尾酒。',
      groupSizeNote: '',
      programmeNote:
        '节目说明：具体流程、工作站数量与执行形式会根据客户需求简报、团队规模及所选场地调整。只有在明确提出时才会加入竞赛。',
      ctaHeading: '规划 Cocktail Atelier™',
      ctaSupportingText:
        '请告知团队构成、偏好氛围与节目目标。我们将围绕您的需求简报构成场地、工作站规划与体验流程。',
      ctaAccessLine: '本体验为私人安排。名额有限。',
      openGraphDescription:
        '专业调酒师、私人吧台工作站，以及每位宾客三款鸡尾酒，共同构成为私人团体设计的博德鲁姆社交工作坊。',
      heroAltText: '宾客在博德鲁姆私人吧台工作站接受专业调酒师指导并创作鸡尾酒。',
    },
  },
  'imperial-flavors-culinary-atelier': {
    en: {
      expectedTitle: 'Imperial Flavors™ — Culinary Atelier',
      expectedCategory: 'signature',
      shortDescription:
        'A private culinary atelier hosted at a Michelin-recognized restaurant in Istanbul, where guests work alongside the chef to prepare a fixed three-course heritage menu interpreting the tradition of Ottoman palace cuisine through cooking, plating, and a shared table.',
      groupSizeNote: '',
      programmeNote:
        'Programme Note: The core experience lasts three hours. Dietary restrictions and allergies must be communicated in advance. When the Food Photography Workshop is selected as an add-on, the total programme duration is extended; the precise additional time is determined by the agreed workshop format.',
      ctaHeading: 'Private Inquiry — Imperial Flavors™',
      ctaSupportingText:
        'This experience is arranged privately for up to 12 guests. Share your group profile, dietary requirements, and interest in the photography workshop, and we will compose the programme around your request.',
      ctaAccessLine: 'Arranged privately.',
      openGraphDescription:
        'Explore Ottoman palace culinary tradition through a chef-guided three-course menu, hands-on preparation, plating, and a shared table.',
      heroAltText:
        'Private group guests plating dishes under the guidance of a professional chef in Istanbul.',
    },
    tr: {
      expectedTitle: 'İmparatorluk Lezzetleri™ — Mutfak Atölyesi',
      expectedCategory: 'signature',
      shortDescription:
        'İstanbul’da, Michelin Rehberi tarafından tanınan bir restoranda gerçekleştirilen; konukların şefle birlikte sabit üç tabaklı bir miras menüsü hazırladığı, Osmanlı saray mutfağı geleneğini uygulama, tabaklama ve ortak sofra üzerinden yorumlayan özel bir mutfak atölyesi.',
      groupSizeNote: '',
      programmeNote:
        'Program Notu: Ana deneyim üç saattir. Beslenme kısıtları ve alerjiler önceden bildirilmelidir. Yemek Fotoğrafçılığı Atölyesi add-on olarak seçildiğinde toplam program süresi uzar; kesin ek süre, üzerinde anlaşılan atölye formatına göre belirlenir.',
      ctaHeading: 'İmparatorluk Lezzetleri™ için Özel Talep',
      ctaSupportingText:
        'Bu deneyim, en fazla 12 konuk için özel olarak düzenlenir. Grup profilinizi, beslenme gereksinimlerinizi ve fotoğraf atölyesi tercihinizi paylaşın; programı talebinize göre planlayalım.',
      ctaAccessLine: 'Özel olarak düzenlenir.',
      openGraphDescription:
        'Osmanlı saray mutfağı geleneğini şefle birlikte hazırlanan üç tabaklı menü, tabaklama ve ortak sofra üzerinden keşfedin.',
      heroAltText:
        'İstanbul’da profesyonel şef eşliğinde hazırladıkları yemekleri tabaklayan özel grup konukları.',
    },
    zh: {
      expectedTitle: 'Imperial Flavors™ — Culinary Atelier',
      expectedCategory: 'signature',
      shortDescription:
        '一场在伊斯坦布尔获《米其林指南》认可的餐厅举行的私人美食工作坊；宾客与主厨并肩准备固定的三道式传统菜单，通过烹饪、摆盘与共享餐桌诠释奥斯曼宫廷饮食传统。',
      groupSizeNote: '',
      programmeNote:
        '节目说明：核心体验时长为三小时。饮食限制与过敏必须提前说明。若选择美食摄影工作坊作为附加项目，总时长会相应延长；具体增加时间由约定的工作坊形式决定。',
      ctaHeading: '私人咨询 — Imperial Flavors™',
      ctaSupportingText:
        '本体验为最多12位宾客私人安排。请告知团队构成、饮食需求及对摄影工作坊的兴趣，我们将围绕您的要求构成节目。',
      ctaAccessLine: '私人安排。',
      openGraphDescription:
        '通过主厨指导的三道式菜单、动手准备、摆盘与共享餐桌，探索奥斯曼宫廷饮食传统。',
      heroAltText: '私人团体宾客在伊斯坦布尔由专业主厨指导摆盘。',
    },
  },
  'driven-by-performance': {
    en: {
      expectedTitle: 'Driven by Performance™',
      expectedCategory: 'signature',
      shortDescription:
        'A full-day high-performance driving experience on a fully private racing circuit in Istanbul, where corporate teams compete across drift, slalom, reaction, emergency-braking, and timed performance modules under professional instruction.',
      groupSizeNote: '',
      programmeNote:
        'Programme Note: The core experience runs for a full day of 6–8 hours and can be adapted to the client brief. Participants must be at least 18 years old and hold a valid driving licence; final driving eligibility is confirmed before the programme. Alcoholic beverages are not served to driving participants before or during any driving activity.',
      ctaHeading: 'Private Inquiry — Driven by Performance™',
      ctaSupportingText:
        'Share your group profile, driver-to-spectator split, team objectives, and preferred optional layers, and we will compose the circuit, vehicle, and competition format around your brief.',
      ctaAccessLine: 'Arranged privately.',
      openGraphDescription:
        'Corporate teams compete across drift, slalom, reaction, emergency braking, and timed laps on a fully private racing circuit in Istanbul.',
      heroAltText:
        'Corporate team participating in a high-performance driving module with a professional instructor on a private racing circuit in Istanbul.',
    },
    tr: {
      expectedTitle: 'Performansın İzinde™',
      expectedCategory: 'signature',
      shortDescription:
        'İstanbul’da tamamen gruba özel bir yarış pistinde gerçekleştirilen; takımların profesyonel eğitmenler eşliğinde drift, slalom, reaksiyon, acil frenleme ve zamanlı performans turlarında birleşik puan üzerinden yarıştığı tam günlük yüksek performans sürüş deneyimi.',
      groupSizeNote: '',
      programmeNote:
        'Program Notu: Ana deneyim tam gün 6–8 saat sürer ve müşteri brief’ine göre uyarlanabilir. En az 18 yaş ve geçerli sürücü belgesi şartı uygulanır; nihai sürüş uygunluğu program öncesinde doğrulanır. Sürüş yapacak katılımcılara sürüş öncesinde veya sırasında alkollü içecek servisi yapılmaz.',
      ctaHeading: 'Performansın İzinde™ için Özel Talep',
      ctaSupportingText:
        'Grup profilinizi, sürücü ve izleyici dağılımını, takım hedeflerinizi ve tercih ettiğiniz opsiyonel katmanları paylaşın; pist, araç ve yarışma kurgusunu brief’inize göre planlayalım.',
      ctaAccessLine: 'Özel olarak düzenlenir.',
      openGraphDescription:
        'Drift, slalom, reaksiyon, acil frenleme ve zamanlı turlarda birleşik puanla yarışan takımlar için tamamen özel bir İstanbul pist deneyimi.',
      heroAltText:
        'İstanbul’da özel yarış pistinde profesyonel eğitmen eşliğinde yüksek performans sürüş modülüne katılan kurumsal ekip.',
    },
    zh: {
      expectedTitle: 'Driven by Performance™',
      expectedCategory: 'signature',
      shortDescription:
        '一场在伊斯坦布尔完全私人包用赛道举行的全天高性能驾驶体验；企业团队在专业指导下，于漂移、绕桩、反应、紧急制动与计时表现模块中竞争。',
      groupSizeNote: '',
      programmeNote:
        '节目说明：核心体验为6至8小时全天节目，并可依据客户需求简报调整。参与者须年满18岁并持有效驾驶执照；最终驾驶资格会在节目开始前确认。任何驾驶活动开始前或进行期间，不向驾驶参与者提供酒精饮品。',
      ctaHeading: '私人咨询 — Driven by Performance™',
      ctaSupportingText:
        '请告知团队构成、驾驶者与观众比例、团队目标及偏好的可选层次；我们将围绕您的需求简报构成赛道、车辆与竞赛形式。',
      ctaAccessLine: '私人安排。',
      openGraphDescription:
        '企业团队在伊斯坦布尔完全私人赛道上，于漂移、绕桩、反应、紧急制动与计时圈中竞争。',
      heroAltText: '企业团队在伊斯坦布尔私人赛道上，与专业教练共同完成高性能驾驶模块。',
    },
  },
  'beylerbeyi-1869-empire-interrupted': {
    en: {
      expectedTitle: 'Beylerbeyi 1869™ — Empire, Interrupted',
      expectedCategory: 'signature',
      shortDescription:
        'A private historical decision experience inside Beylerbeyi Palace, where guests interpret the diplomatic world of 1869 through four real historical perspectives, role dossiers, spatial evidence, and guided decision prompts.',
      groupSizeNote: '',
      programmeNote:
        'Programme Note: The core experience inside the palace lasts three hours; private arrival and return transfer times are excluded. The programme operates during normal public visiting hours, within current palace rules and the permitted visitor route. Group size is limited to eight guests.',
      ctaHeading: 'Reserve Beylerbeyi 1869™ — Empire, Interrupted',
      ctaSupportingText:
        'Share the profile of your group of up to eight guests, your preferred programme language, and whether you would like to add the palace garden café programme; we will plan the experience around suitable dates and current visiting conditions.',
      ctaAccessLine: 'Access is limited.',
      openGraphDescription:
        'Interpret the palace diplomacy of 1869 through the perspectives of Sultan Abdülaziz, Empress Eugénie, Pertevniyal Valide Sultan, and Count Nikolai Ignatiev.',
      heroAltText:
        'Private group guests interpreting the diplomacy of 1869 through historical role dossiers inside Beylerbeyi Palace.',
    },
    tr: {
      expectedTitle: 'Beylerbeyi 1869™ — İmparatorluğun Kırılma Anı',
      expectedCategory: 'signature',
      shortDescription:
        'Beylerbeyi Sarayı’nın 1869’daki diplomatik dünyasını dört gerçek tarihsel perspektif üzerinden ele alan; konukların rol dosyaları, mekânsal ipuçları ve karar soruları aracılığıyla güç, temsil ve kırılganlık arasındaki ilişkiyi yeniden kurduğu özel bir tarihsel karar deneyimi.',
      groupSizeNote: '',
      programmeNote:
        'Program Notu: Saray içindeki ana deneyim üç saattir; gidiş ve dönüş transfer süreleri bu süreye dahil değildir. Program normal ziyaret saatlerinde, yürürlükteki saray kuralları ve izin verilen ziyaret rotası içinde gerçekleştirilir. Grup en fazla sekiz konuktan oluşur.',
      ctaHeading: 'Beylerbeyi 1869™ — İmparatorluğun Kırılma Anı Deneyimini Rezerve Edin',
      ctaSupportingText:
        'En fazla sekiz konuktan oluşan grubunuzun profilini, tercih ettiğiniz program dilini ve saray bahçesi kafe programı talebinizi paylaşın; deneyimi uygun tarih ve ziyaret koşullarına göre planlayalım.',
      ctaAccessLine: 'Erişim sınırlıdır.',
      openGraphDescription:
        'Sultan Abdülaziz, İmparatoriçe Eugénie, Pertevniyal Valide Sultan ve Kont Nikolay İgnatyev’in perspektifleriyle 1869 saray diplomasisini yeniden yorumlayın.',
      heroAltText:
        'Beylerbeyi Sarayı’nda tarihsel rol dosyalarıyla 1869 diplomasisini yorumlayan özel grup konukları.',
    },
    zh: {
      expectedTitle: 'Beylerbeyi 1869™ — Empire, Interrupted',
      expectedCategory: 'signature',
      shortDescription:
        '一场在贝勒贝伊宫内举行的私人历史决策体验；宾客通过四个真实历史人物的视角、角色档案、空间证据与引导式决策问题，解读1869年的外交世界。',
      groupSizeNote: '',
      programmeNote:
        '节目说明：宫内核心体验为三小时；私人往返接送时间不计入。节目在正常公众开放时间内，遵循现行宫殿规则及允许的参观路线进行。团队最多八位宾客。',
      ctaHeading: '预订 Beylerbeyi 1869™ — Empire, Interrupted',
      ctaSupportingText:
        '请告知最多八位宾客的团队构成、偏好的节目语言，以及是否希望加入宫殿花园咖啡厅节目；我们将结合适宜日期与当前参观条件进行规划。',
      ctaAccessLine: '名额有限。',
      openGraphDescription:
        '从苏丹阿卜杜勒阿齐兹、欧仁妮皇后、佩尔特夫尼亚尔苏丹太后与尼古拉·伊格纳季耶夫伯爵的视角，解读1869年的宫廷外交。',
      heroAltText: '私人团体宾客在贝勒贝伊宫内通过历史角色档案解读1869年的外交世界。',
    },
  },
} as const satisfies Record<string, Record<SiteLocale, ExperienceEditorialSupplement>>;

export const EXPERIENCE_EDITORIAL_SLUGS = Object.freeze(
  Object.keys(EXPERIENCE_EDITORIAL_SUPPLEMENTS)
);

const EXPERIENCE_EDITORIAL_ALIASES: Readonly<Record<string, string>> = {
  'beylerbeyi-1869': 'beylerbeyi-1869-empire-interrupted',
  'beylerbeyi-1869tm-empire-interrupted': 'beylerbeyi-1869-empire-interrupted',
  'imperial-flavors': 'imperial-flavors-culinary-atelier',
};

export function findExperienceEditorialSupplement(
  slug: string,
  locale: SiteLocale
): ExperienceEditorialSupplement | null {
  const canonicalSlug = EXPERIENCE_EDITORIAL_ALIASES[slug] ?? slug;
  return (
    EXPERIENCE_EDITORIAL_SUPPLEMENTS[
      canonicalSlug as keyof typeof EXPERIENCE_EDITORIAL_SUPPLEMENTS
    ]?.[locale] ?? null
  );
}

export function getExperienceEditorialSupplement(
  slug: string,
  locale: SiteLocale
): ExperienceEditorialSupplement {
  const localized = findExperienceEditorialSupplement(slug, locale);
  if (!localized) {
    throw new Error(`Missing Experience editorial supplement for ${locale}:${slug}`);
  }
  return localized;
}
