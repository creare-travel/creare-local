import React from 'react';
import Link from 'next/link';
import { LocalizedLegalPage, type LegalPageContent } from '@/features/static-pages/legal';
import { localizePathname } from '@/lib/i18n/pathname';

export const chinesePrivacyContent: LegalPageContent = {
  breadcrumb: '隐私',
  title: '隐私政策',
  lastUpdated: '最后更新：2026 年 3 月 4 日',
  sections: [
    {
      number: 1,
      heading: '我们收集的信息',
      body: '当您就我们的服务提出咨询、报名参加活动或与我们的团队沟通时，CREARE 会收集您直接向我们提供的信息。这些信息可能包括您的姓名、电子邮箱地址、电话号码、公司名称，以及您选择提供的任何其他信息。',
    },
    {
      number: 2,
      heading: '我们如何使用您的信息',
      body: '我们使用所收集的信息来提供、维护和改进我们的服务，就您的咨询及我们提供的服务与您沟通，并了解我们的服务如何被使用。我们不会为第三方的营销目的出售您的个人信息，也不会与第三方共享这些信息。',
    },
    {
      number: 3,
      heading: '数据安全',
      body: '我们采取适当的技术和组织措施，以保护您个人信息的安全。但请注意，任何通过互联网传输或以电子方式存储信息的方法都无法做到绝对安全。',
    },
    {
      number: 4,
      heading: '您的权利',
      body: '您有权随时访问、更新或删除您的个人信息。如需行使这些权利，请直接联系我们。我们将在合理期限内回应您的请求。',
    },
    {
      number: 5,
      heading: '本政策的变更',
      body: '我们可能会不时更新本隐私政策。我们将通过在本页面发布新的隐私政策并更新“最后更新”日期来通知您任何变更。',
    },
    {
      number: 6,
      heading: '联系我们',
      body: '如果您对本隐私政策有任何疑问，请通过我们的联系页面或电子邮件与我们联系。我们致力于解决您对隐私可能存在的任何顾虑。',
    },
  ],
};

export const chineseCookiesContent: LegalPageContent = {
  breadcrumb: 'COOKIE',
  title: 'Cookie 政策',
  lastUpdated: '最后更新：2026 年 3 月 4 日',
  sections: [
    {
      number: 1,
      heading: '什么是 Cookie',
      body: 'Cookie 是您访问我们的网站时存放在您设备上的小型文本文件。它们通过记住您的偏好并帮助我们了解您如何与我们的服务互动，使我们能够为您提供更好的体验。',
    },
    {
      number: 2,
      heading: '我们如何使用 Cookie',
      body: 'CREARE 使用 Cookie 来了解访客如何浏览我们的网站、记住您的语言偏好，并分析网站流量。我们同时使用会话 Cookie（在您关闭浏览器时失效）和持久性 Cookie（在被删除或到期前保留在您的设备上）。',
    },
    {
      number: 3,
      heading: '我们使用的 Cookie 类型',
      body: (
        <>
          <span className="block mb-3">
            <strong>必要 Cookie：</strong>
            这些 Cookie 是网站正常运行所必需的，可支持安全和网络管理等核心功能。
          </span>
          <span className="block mb-3">
            <strong>分析 Cookie：</strong>
            我们使用这些 Cookie 来了解访客如何与网站互动，从而帮助我们改进服务和用户体验。
          </span>
          <span className="block">
            <strong>偏好 Cookie：</strong>
            这些 Cookie 使网站能够记住会改变其运行方式或外观的信息，例如您的首选语言。
          </span>
        </>
      ),
    },
    {
      number: 4,
      heading: '管理 Cookie',
      body: '您可以通过多种方式控制和管理 Cookie。请注意，删除或阻止 Cookie 可能会影响您的使用体验，并可能导致部分功能无法使用。大多数浏览器会自动接受 Cookie，但您通常可以根据需要修改浏览器设置以拒绝 Cookie。',
    },
    {
      number: 5,
      heading: '本政策的变更',
      body: '我们可能会不时更新本 Cookie 政策，以反映技术、法律法规或业务运营方面的变化。我们建议您定期查看本页面，以了解我们 Cookie 使用方式的最新信息。',
    },
  ],
};

export const chineseTermsContent: LegalPageContent = {
  breadcrumb: '条款',
  title: '使用条款',
  lastUpdated: '最后更新：2026 年 3 月 4 日',
  sections: [
    {
      number: 1,
      heading: '接受条款',
      body: '访问并使用 CREARE 网站及沟通渠道，即表示您接受并同意受本协议条款和规定的约束。如果您不同意这些条款，请勿使用本网站，也请勿继续提出合作咨询。',
    },
    {
      number: 2,
      heading: '合作服务的使用',
      body: 'CREARE 为特定客户提供体验设计、私享文化通达策划及相关战略合作服务。合作通常在私下沟通之后，以邀请或咨询为基础进行评估。我们保留随时拒绝或终止任何合作请求或服务关系的权利。',
    },
    {
      number: 3,
      heading: '知识产权',
      body: '本网站的全部内容，包括文字、图形、标识、图像和软件，均为 CREARE 的财产，并受国际版权法和商标法保护。未经明确书面许可，您不得复制、分发我们的内容，也不得基于这些内容创作衍生作品。',
    },
    {
      number: 4,
      heading: '保密',
      body: 'CREARE 以最高标准审慎处理保密事宜。所有客户信息、咨询、合作详情及与通达相关的信息均被严格保密。对于我们的专有方法和商业实践，我们也期待客户保持同等程度的审慎与保密。',
    },
    {
      number: 5,
      heading: '责任限制',
      body: '对于因您使用或无法使用本网站或我们的合作服务而造成的任何间接、附带、特殊、后果性或惩罚性损害，CREARE 不承担责任。对于因您使用本网站或我们的合作服务而产生的任何索赔，我们对您承担的责任总额不超过您为相关服务支付的金额。',
    },
    {
      number: 6,
      heading: '条款的修改',
      body: '我们保留随时修改这些条款的权利。变更自发布至本页面之时起立即生效。在任何此类变更后继续使用本网站或我们的合作服务，即表示您接受新的条款。',
    },
    {
      number: 7,
      heading: '适用法律',
      body: '这些条款应受适用的国际法律管辖并依其解释。因这些条款或您使用本网站或我们的合作服务而产生的任何争议，应按照国际仲裁规则通过具有约束力的仲裁解决。',
    },
    {
      number: 8,
      heading: '联系信息',
      body: '如果您对本使用条款有任何疑问，请通过我们的官方联系渠道与我们联系。我们致力于及时、专业地处理您的顾虑。',
    },
  ],
};

export function ChineseLegalPage({ content }: { content: LegalPageContent }) {
  return (
    <LocalizedLegalPage
      locale="zh"
      content={content}
      breadcrumbAriaLabel="面包屑导航"
      homeLabel="首页"
    />
  );
}

export function ChinesePhilosophyPage() {
  return (
    <main className="min-h-screen bg-black">
      <section className="flex min-h-[86vh] items-center px-8 sm:min-h-[92vh] sm:px-16 lg:min-h-screen lg:px-24">
        <div className="max-w-[680px]">
          <p className="mb-12 font-body text-[0.7rem] uppercase tracking-[0.22em] text-white/15">
            CREARE / 理念
          </p>
          <h1 className="font-display font-light leading-[1.18] text-white text-[clamp(2rem,4.6vw,4.4rem)]">
            我们相信，最非凡的体验
            <br />
            无法被购买。
            <br />
            <span className="text-white/60">只能被精心构筑。</span>
          </h1>
        </div>
      </section>

      <section className="mx-auto max-w-[660px] px-8 pb-40 sm:px-16 lg:px-0">
        <div className="flex flex-col gap-32">
          <div>
            <p className="text-white/16 font-body text-[0.7rem] tracking-[0.2em] uppercase mb-9">
              01
            </p>
            <h2 className="font-display font-light text-white text-3xl md:text-4xl mb-12">
              反对行程表
            </h2>
            <div className="flex flex-col gap-8 text-white/60 font-body font-light text-base leading-[2]">
              <p>几十年来，这个行业一直在完善行程表——一套预先打包的景点、餐饮与接送序列。</p>
              <p>它让人穿行于一个个地方，却从未让人真正抵达。</p>
              <p>这不是我们所从事的事。</p>
              <p>
                CREARE
                为真正的相遇创造条件——人与地方、宾客与文化世界、一个时刻与其完整意义之间的相遇。
              </p>
            </div>
          </div>

          <div className="pt-24 md:pt-28">
            <p className="text-white/16 font-body text-[0.7rem] tracking-[0.2em] uppercase mb-9">
              02
            </p>
            <h2 className="font-display font-light text-white text-3xl md:text-4xl mb-12">构筑</h2>
            <div className="flex flex-col gap-8 text-white/60 font-body font-light text-base leading-[2]">
              <p>我们有意使用“构筑”一词。</p>
              <p>作曲家创造的是情感，而非序列。</p>
              <p>他们理解静默与声响、期待与抵达。</p>
              <p>我们的工作方式亦然。</p>
              <p className="leading-[2.4]">
                最好的体验并非最昂贵，也并非最排他——
                <br />
                而是在恰当的时刻，
                <br />
                以恰当的形式，
                <br />
                为恰当的人呈现。
              </p>
            </div>
          </div>

          <div className="border-t border-white/6 pt-24 md:pt-28">
            <p className="text-white/16 font-body text-[0.7rem] tracking-[0.2em] uppercase mb-9">
              03
            </p>
            <h2 className="font-display font-light text-white text-3xl md:text-4xl mb-12">
              通达即责任
            </h2>
            <div className="flex flex-col gap-8 text-white/60 font-body font-light text-base leading-[2]">
              <p>通达不是商品，而是一份托付。</p>
              <p>
                它由那些向我们敞开大门的人交付——
                <span className="text-white/80 italic">不是为了曝光，而是因为彼此契合。</span>
              </p>
              <p>我们郑重对待这份信任。</p>
              <p>
                每一次体验的设计，都应让一个地方比我们初见时更好——
                <br />
                加深人与文化之间的关系，
                <span className="block mt-4">而非从中索取。</span>
              </p>
            </div>
          </div>

          <div className="pt-24 md:pt-28">
            <p className="text-white/16 font-body text-[0.7rem] tracking-[0.2em] uppercase mb-9">
              04
            </p>
            <h2 className="font-display font-light text-white text-3xl md:text-4xl mb-12">客户</h2>
            <div className="flex flex-col gap-8 text-white/60 font-body font-light text-base leading-[2]">
              <p>每年，我们只与少数客户合作。</p>
              <p>真正的构筑需要专注——而专注无法规模化。</p>
              <p>我们的客户已经看过世界。</p>
              <p>他们已准备以不同的方式与它相遇。</p>
              <p className="leading-[2.4]">
                好奇。
                <br />
                审慎。
                <br />
                愿意接受意外。
              </p>
              <p>
                他们理解，最好的体验始于一场对话——
                <span className="block mt-4 text-white/40">而不是一本目录。</span>
              </p>
            </div>
          </div>
        </div>

        <div className="mt-28">
          <p className="mb-4 font-body text-[0.7rem] uppercase tracking-[0.2em] text-white/18">
            洞见
          </p>
          <Link
            href={localizePathname('/insights', 'zh')}
            className="inline-flex font-body text-xs uppercase tracking-[0.14em] text-white/34 transition-colors hover:text-white/70"
          >
            继续阅读 →
          </Link>
        </div>
      </section>

      <section className="border-t border-white/10 bg-black" aria-label="理念联系行动">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-12 sm:px-10 sm:py-14 lg:flex-row lg:items-center lg:justify-between lg:px-16 lg:py-16">
          <h2
            className="font-display font-light leading-tight text-white"
            style={{ fontSize: 'clamp(1.45rem, 2.2vw, 2rem)' }}
          >
            若这一理念与您产生共鸣，
            <br />
            我们应当谈谈。
          </h2>
          <Link
            href={localizePathname('/contact', 'zh')}
            className="inline-flex min-h-11 items-center justify-center self-start border border-white/16 px-7 py-3 font-body text-[0.62rem] uppercase tracking-[0.28em] text-white/72 transition-colors duration-300 hover:border-white/32 hover:text-white"
          >
            私享咨询
          </Link>
        </div>
      </section>
    </main>
  );
}
