import crypto from 'node:crypto';
import type { AssistantState, ModelUsage } from './types';

export function sessionHash(sessionId: string) {
  return crypto.createHash('sha256').update(sessionId).digest('hex').slice(0, 12);
}

export function logAssistantMetric(input: {
  state: AssistantState;
  event: 'model_turn' | 'handoff' | 'guardrail';
  durationMs: number;
  candidateCount?: number;
  recommendationCount?: number;
  usage?: ModelUsage | null;
  guardrail?: string;
  ranking?: Array<{ id: string; score?: number; reasons?: string[] }>;
}) {
  console.info(
    '[assistant.metric]',
    JSON.stringify({
      event: input.event,
      session: sessionHash(input.state.session_id),
      locale: input.state.locale,
      stage: input.state.conversation_stage,
      service_path: input.state.service_path,
      candidate_count: input.candidateCount ?? 0,
      recommendation_count: input.recommendationCount ?? 0,
      prompt_tokens: input.usage?.promptTokens ?? 0,
      output_tokens: input.usage?.outputTokens ?? 0,
      total_tokens: input.usage?.totalTokens ?? 0,
      duration_ms: input.durationMs,
      guardrail: input.guardrail ?? null,
      ranking: input.ranking ?? null,
    })
  );
}
