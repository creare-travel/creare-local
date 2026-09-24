export type AssistantLocale = 'tr' | 'en' | 'ru' | 'zh';

export type ConversationStage =
  'discovery' | 'qualification' | 'recommendation' | 'private_briefing' | 'handoff';

export type ServicePath = 'undetermined' | 'signature' | 'lab' | 'black' | 'corporate';

export type ConversationTurn = {
  role: 'visitor' | 'assistant';
  text: string;
};

export type AssistantState = {
  session_id: string;
  locale: AssistantLocale;
  name: string | null;
  destination: string | null;
  dates: string | null;
  guest_count: number | null;
  interests: string[];
  intention: string | null;
  profile: string | null;
  mindset: string | null;
  emotional_goal: string | null;
  preferred_environments: string[];
  group_dynamics: string | null;
  service_path: ServicePath;
  ticket_no: string | null;
  budget_band: string | null;
  conversation_stage: ConversationStage;
  recommended_experience_ids: string[];
  last_user_message: string | null;
  conversation_history: ConversationTurn[];
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
    | 'profile'
    | 'mindset'
    | 'emotional_goal'
    | 'preferred_environments'
    | 'group_dynamics'
    | 'service_path'
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
