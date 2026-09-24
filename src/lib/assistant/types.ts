export type AssistantLocale = 'tr' | 'en' | 'ru' | 'zh';

export type ConversationStage =
  'discovery' | 'qualification' | 'recommendation' | 'private_briefing' | 'handoff';

export type AssistantState = {
  session_id: string;
  locale: AssistantLocale;
  name: string | null;
  destination: string | null;
  dates: string | null;
  guest_count: number | null;
  interests: string[];
  intention: string | null;
  budget_band: string | null;
  conversation_stage: ConversationStage;
  recommended_experience_ids: string[];
  last_user_message: string | null;
};

export type ExperienceCandidate = {
  id: string;
  title: string;
  slug: string;
  category: 'signature' | 'lab' | 'black' | null;
  short_description: string | null;
  location: string | null;
  duration: string | null;
};

export type HydratedExperience = ExperienceCandidate & {
  url: string;
};

export type AssistantRequest = {
  message: string;
  state_token?: string | null;
  locale?: AssistantLocale;
  name?: string | null;
};

export type ModelStatePatch = Partial<
  Pick<
    AssistantState,
    | 'locale'
    | 'name'
    | 'destination'
    | 'dates'
    | 'guest_count'
    | 'interests'
    | 'intention'
    | 'budget_band'
    | 'conversation_stage'
  >
>;

export type ModelResult = {
  reply: string;
  statePatch: ModelStatePatch;
  recommendedExperienceIds: string[];
  handoffRecommended: boolean;
};
