import type { AssistantState, ConversationStage, ServicePath } from './types';

export type ConversationPolicy = {
  servicePath: ServicePath;
  stage: ConversationStage;
  nextQuestionFocus:
    | 'destination'
    | 'timing'
    | 'guest_profile'
    | 'intention'
    | 'emotional_goal'
    | 'preferred_environment'
    | 'group_dynamics'
    | 'budget'
    | 'private_briefing'
    | 'none';
  mayRecommendPublishedExperiences: boolean;
  shouldOfferPrivateBriefing: boolean;
  shouldAvoidBudgetQuestion: boolean;
};

const hasIntent = (state: AssistantState) =>
  Boolean(state.intention?.trim()) || state.interests.length > 0;

const broadDestinations = new Set(['turkey', 'türkiye', 'turkiye', 'турция', '土耳其']);

function hasSpecificDestination(state: AssistantState) {
  if (!state.destination?.trim()) return false;
  return !broadDestinations.has(state.destination.trim().toLocaleLowerCase('en-US'));
}

export function deriveConversationPolicy(state: AssistantState): ConversationPolicy {
  const servicePath = state.service_path;

  if (!hasSpecificDestination(state)) {
    return {
      servicePath,
      stage: 'discovery',
      nextQuestionFocus: 'destination',
      mayRecommendPublishedExperiences: false,
      shouldOfferPrivateBriefing: false,
      shouldAvoidBudgetQuestion: true,
    };
  }

  if (!state.dates) {
    return {
      servicePath,
      stage: 'qualification',
      nextQuestionFocus: 'timing',
      mayRecommendPublishedExperiences: false,
      shouldOfferPrivateBriefing: false,
      shouldAvoidBudgetQuestion: true,
    };
  }

  if (!state.guest_count && !state.profile) {
    return {
      servicePath,
      stage: 'qualification',
      nextQuestionFocus: 'guest_profile',
      mayRecommendPublishedExperiences: false,
      shouldOfferPrivateBriefing: false,
      shouldAvoidBudgetQuestion: true,
    };
  }

  if (servicePath === 'black') {
    return {
      servicePath,
      stage: 'private_briefing',
      nextQuestionFocus: state.emotional_goal ? 'private_briefing' : 'emotional_goal',
      mayRecommendPublishedExperiences: false,
      shouldOfferPrivateBriefing: true,
      shouldAvoidBudgetQuestion: true,
    };
  }

  if (servicePath === 'corporate') {
    return {
      servicePath,
      stage: 'private_briefing',
      nextQuestionFocus: 'private_briefing',
      mayRecommendPublishedExperiences: false,
      shouldOfferPrivateBriefing: true,
      shouldAvoidBudgetQuestion: true,
    };
  }

  if (!hasIntent(state)) {
    return {
      servicePath,
      stage: 'qualification',
      nextQuestionFocus: 'intention',
      mayRecommendPublishedExperiences: false,
      shouldOfferPrivateBriefing: false,
      shouldAvoidBudgetQuestion: true,
    };
  }

  if (servicePath === 'lab') {
    if (!state.emotional_goal) {
      return {
        servicePath,
        stage: 'qualification',
        nextQuestionFocus: 'emotional_goal',
        mayRecommendPublishedExperiences: false,
        shouldOfferPrivateBriefing: false,
        shouldAvoidBudgetQuestion: true,
      };
    }
    if (state.preferred_environments.length === 0) {
      return {
        servicePath,
        stage: 'qualification',
        nextQuestionFocus: 'preferred_environment',
        mayRecommendPublishedExperiences: false,
        shouldOfferPrivateBriefing: false,
        shouldAvoidBudgetQuestion: true,
      };
    }
    if (!state.group_dynamics && (state.guest_count ?? 0) > 2) {
      return {
        servicePath,
        stage: 'qualification',
        nextQuestionFocus: 'group_dynamics',
        mayRecommendPublishedExperiences: false,
        shouldOfferPrivateBriefing: false,
        shouldAvoidBudgetQuestion: true,
      };
    }
    if (!state.budget_band) {
      return {
        servicePath,
        stage: 'qualification',
        nextQuestionFocus: 'budget',
        mayRecommendPublishedExperiences: false,
        shouldOfferPrivateBriefing: false,
        shouldAvoidBudgetQuestion: false,
      };
    }
    return {
      servicePath,
      stage: 'private_briefing',
      nextQuestionFocus: 'private_briefing',
      mayRecommendPublishedExperiences: false,
      shouldOfferPrivateBriefing: true,
      shouldAvoidBudgetQuestion: false,
    };
  }

  return {
    servicePath,
    stage: 'recommendation',
    nextQuestionFocus: 'none',
    mayRecommendPublishedExperiences: true,
    shouldOfferPrivateBriefing: false,
    shouldAvoidBudgetQuestion: true,
  };
}
