#!/bin/sh
set -eu

EXPECTED_ASSISTANT_COMMIT='c198aee969bc199a81dd401c57d36c7bd4b65228'
EXPECTED_BUBBLE_COMMIT='d5626722b8c105a3ff6134a7159c5d92d639d7fe'
EXPECTED_PUBLIC_ID='creare-assistant'
TYPEBOT_ID='cmufapz3700000agmskmdsvaz'

fail() { echo "FAIL: $1" >&2; exit 1; }
pass() { echo "PASS: $1"; }

git merge-base --is-ancestor "$EXPECTED_ASSISTANT_COMMIT" HEAD || fail 'assistant source commit missing'
pass 'assistant source commit present'
git merge-base --is-ancestor "$EXPECTED_BUBBLE_COMMIT" HEAD || fail 'bubble source commit missing'
pass 'website bubble source commit present'

grep -q "TYPEBOT_PUBLIC_ID = '$EXPECTED_PUBLIC_ID'" src/components/CreareAssistantBubble.tsx || fail 'bubble publicId mismatch'
pass 'bubble publicId correct'

for f in \
  src/app/api/assistant/route.ts \
  src/lib/assistant/guardrails.ts \
  src/lib/assistant/recommendation.ts \
  src/lib/assistant/lead.ts \
  src/lib/assistant/metrics.ts; do
  test -f "$f" || fail "missing $f"
done
pass 'assistant release modules present'

if grep -R -nE 'localhost\.run|\.lhr\.life' src >/dev/null 2>&1; then
  fail 'temporary local tunnel reference found in application source'
fi
pass 'no temporary tunnel URL in application source'

if [ -z "${TYPEBOT_API_TOKEN:-}" ]; then
  echo 'SKIP: Typebot cloud checks; TYPEBOT_API_TOKEN is not set'
  exit 0
fi

tmp_typebot=$(mktemp)
tmp_pub=$(mktemp)
trap 'rm -f "$tmp_typebot" "$tmp_pub"' EXIT

curl -fsS -H "Authorization: Bearer $TYPEBOT_API_TOKEN" -H 'Accept: application/json' \
  "https://app.typebot.com/api/v1/typebots/$TYPEBOT_ID" > "$tmp_typebot"
curl -fsS -H "Authorization: Bearer $TYPEBOT_API_TOKEN" -H 'Accept: application/json' \
  "https://app.typebot.com/api/v1/typebots/$TYPEBOT_ID/publishedTypebot" > "$tmp_pub"

public_id=$(jq -r '.typebot.publicId' "$tmp_typebot")
[ "$public_id" = "$EXPECTED_PUBLIC_ID" ] || fail "Typebot publicId mismatch: $public_id"
pass 'Typebot publicId correct'

for required in \
  'data.reply' 'YapayZekaCevabi' \
  'data.state_token' 'AssistantStateToken' \
  'data.stage' 'AssistantStage' \
  'data.handoff_recommended' 'AssistantHandoff' \
  'data.ticket_no' 'ReferansNo' \
  'data.handoff_summary' 'SohbetGecmisi' \
  'data.handoff_transcript' 'HandoffTranscript' \
  'data.handoff_control_notes' 'HandoffControlNotes' \
  'data.handoff_email_prompt' 'HandoffEmailPrompt' \
  'data.handoff_confirmation' 'HandoffConfirmation' \
  'data.guest_email_subject' 'GuestEmailSubject' \
  'data.guest_email_body' 'GuestEmailBody' \
  'data.lead_quality' 'LeadQuality' \
  'data.lead_priority' 'LeadPriority' \
  'data.lead_urgency_reason' 'LeadUrgencyReason' \
  'data.lead_missing_information' 'LeadMissingInformation' \
  'data.lead_next_action' 'LeadNextAction'; do
  grep -q "$required" "$tmp_typebot" || fail "Typebot requirement missing: $required"
done
pass 'Typebot response paths and variables present'

webhook=$(jq -r '[.typebot.groups[].blocks[]? | .options.webhook.url? | select(. != null and contains("/api/assistant"))][0] // "missing"' "$tmp_typebot")
published=$(jq -r 'if .publishedTypebot then "true" else "false" end' "$tmp_pub")
echo "INFO: Typebot webhook currently $webhook"
echo "INFO: production webhook target https://crearetravel.com/api/assistant"
echo "INFO: Typebot published=$published"
