import type { AssistantState } from './types';

export type LeadAssessment = {
  quality: 'A' | 'B' | 'C';
  priority: 'urgent' | 'high' | 'normal';
  urgency_reason: string;
  missing_information: string[];
  next_action: string;
};

function missingFields(state: AssistantState) {
  const missing: string[] = [];
  if (!state.destination) missing.push('destination');
  if (!state.dates) missing.push('timing');
  if (!state.guest_count && !state.profile) missing.push('guest/profile');
  if (!state.intention && state.interests.length === 0) missing.push('intention/interests');
  if (state.service_path === 'lab') {
    if (!state.emotional_goal) missing.push('emotional goal');
    if (state.preferred_environments.length === 0) missing.push('preferred environments');
    if ((state.guest_count ?? 0) > 2 && !state.group_dynamics) missing.push('group dynamics');
    if (!state.budget_band) missing.push('budget range');
  }
  return missing;
}

function detectUrgency(state: AssistantState) {
  const text = `${state.dates || ''} ${state.last_user_message || ''}`.toLocaleLowerCase('en-US');
  const urgentSignals = [
    'tomorrow',
    'today',
    'tonight',
    '24 hour',
    '24-hour',
    '48 hour',
    '48-hour',
    'this weekend',
    'next 2 days',
    'next two days',
    'yarın',
    'bugün',
    'bu hafta sonu',
    'завтра',
    'сегодня',
    'на выходных',
    '明天',
    '今天',
    '本周末',
  ];
  if (urgentSignals.some((signal) => text.includes(signal))) {
    return { priority: 'urgent' as const, reason: 'Near-term timing signal in the visitor brief' };
  }
  if (state.service_path === 'black') {
    return { priority: 'high' as const, reason: 'BLACK / discretion-sensitive request' };
  }
  if (state.service_path === 'corporate') {
    return { priority: 'high' as const, reason: 'Corporate / professional opportunity' };
  }
  if (state.dates && state.destination && (state.guest_count || state.profile)) {
    return {
      priority: 'high' as const,
      reason: 'Qualified request with specific timing and traveller context',
    };
  }
  return { priority: 'normal' as const, reason: 'No immediate urgency signal detected' };
}

export function assessLead(state: AssistantState): LeadAssessment {
  const missing = missingFields(state);
  const urgency = detectUrgency(state);
  const coreComplete = Boolean(
    state.destination &&
    state.dates &&
    (state.guest_count || state.profile) &&
    (state.intention || state.interests.length)
  );
  const quality: LeadAssessment['quality'] =
    coreComplete && missing.length === 0 ? 'A' : coreComplete || missing.length <= 2 ? 'B' : 'C';
  const nextAction =
    state.conversation_stage === 'private_briefing'
      ? state.service_path === 'black'
        ? 'Senior Travel Architect: review discreetly and contact the guest using the ticket reference.'
        : 'Senior Travel Architect: review transcript against structured brief and continue the Private Briefing.'
      : state.conversation_stage === 'recommendation'
        ? 'Review recommendation fit; intervene only if the guest requests bespoke design or human support.'
        : `Continue qualification; next missing information: ${missing[0] || 'none'}.`;

  return {
    quality,
    priority: urgency.priority,
    urgency_reason: urgency.reason,
    missing_information: missing,
    next_action: nextAction,
  };
}
