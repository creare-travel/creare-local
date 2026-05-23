# CREARE Executive Review Checklist

This checklist supports recurring analytics review without changing GTM, GA4, or dashboards automatically.

## Weekly analytics review checklist

- Confirm the reporting date range is the same across all Explores.
- Confirm internal traffic and developer traffic filters are behaving as expected.
- Review `Qualified Human Visitors`.
- Review `Real Inquiry Count`.
- Review `High Intent Sessions`.
- Review `Experience Interest` for top and bottom performers.
- Review `Inquiry Funnel` for the biggest drop-off.
- Check whether `contact_submit` moved in line with `inquiry_click`.
- Review `Cultural World Engagement` for editorial discovery impact.
- Review `Outbound Curiosity Map` for unusual domain spikes.
- Record one insight and one action.

## Monthly intent review checklist

- Compare last 28 days vs prior 28 days.
- Rank experiences by:
  - engagement quality
  - inquiry behavior
  - contact submission depth
- Identify which experience categories:
  - attract attention
  - generate intent
  - convert into inquiry
- Review whether cultural worlds are feeding experience interest.
- Review which inquiry sources drive the strongest intent.
- Review whether outbound curiosity is supportive or distracting.
- Reassess the threshold logic for `High Intent Sessions`.
- Decide whether Qualified Intent Score weights need refinement.

## GEO / AI traffic observation checklist

- Watch for unusual shifts in:
  - `source`
  - `page_path`
  - `page_title`
- Check whether top landing pages changed materially.
- Check for traffic surges with low downstream intent.
- Separate curiosity traffic from conversion-bearing traffic.
- Note any new AI, assistant, or search-surface referral patterns if they appear in source taxonomy.
- Do not treat raw visit growth as meaningful without qualified-session or intent confirmation.

## Outbound behavior review checklist

- Rank top `outbound_domain` values.
- Identify which pages generate the most outbound clicks.
- Compare outbound-heavy sessions against inquiry-heavy sessions.
- Flag pages where outbound curiosity rises while inquiry intent falls.
- Distinguish:
  - validation behavior
  - research behavior
  - distraction behavior
- Review whether specific external domains are consistently associated with higher or lower inquiry depth.

## Executive interpretation guardrails

- Do not lead with raw page views.
- Use `Qualified Human Visitors` as the preferred denominator where possible.
- Treat `contact_submit` as the canonical inquiry outcome.
- Read `outbound_click` as curiosity, not conversion.
- Review score-driven signals as directional, not absolute.
- Investigate anomalies before treating them as strategy signals.
