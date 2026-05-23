# CREARE GA4 Explore Operationalization Guide

This document translates the executive analytics architecture into step-by-step GA4 Explore build guidance.

It is operational guidance only.

- No GTM changes are made by this guide.
- No GA4 changes are made by this guide.
- No Looker Studio assets are created automatically.

## Operating assumptions

- Use external traffic only once internal and developer traffic filters are verified.
- Use `contact_submit` as the canonical inquiry outcome.
- Use `Qualified Human Visitors` as the preferred denominator for executive reporting where possible.
- Treat `Qualified Intent Score` as a decision-support heuristic, not a deterministic lead model.

## Explore template 1: Experience Interest

- Explore type:
  - `Free form`
- Purpose:
  - identify which experiences attract sustained attention and meaningful engagement
- Dimensions to import:
  - `experience_slug`
  - `experience_title`
  - `experience_category`
  - `page_path`
  - `page_title`
  - `source`
- Metrics to import:
  - `Users`
  - `Sessions`
  - `Event count`
  - `Views`
  - `Engaged sessions`
  - `Average engagement time`
- Filters:
  - `Event name exactly matches experience_view`
  - exclude internal traffic when available
  - exclude developer traffic when available
- Comparisons:
  - current period vs previous period
  - top 5 experience slugs vs all others
- Segments:
  - `External Qualified Visitors`
  - `High Intent Visitors`
  - `Experience Category = signature / lab / black`
- Tab configuration:
  - rows:
    - `experience_slug`
    - `experience_title`
  - values:
    - `Users`
    - `Engaged sessions`
    - `Average engagement time`
    - `Event count`
  - optional breakdown:
    - `experience_category`
- Recommended date range:
  - last `28 days`
- Recommended visualization:
  - table plus bar chart
- Interpretation logic:
  - high views + low engagement means attention without resonance
  - high engagement + later inquiry behavior indicates commercially meaningful fit

## Explore template 2: Inquiry Funnel

- Explore type:
  - `Funnel exploration`
- Purpose:
  - understand where experience-led inquiry momentum is lost or converted
- Dimensions to import:
  - `experience_slug`
  - `experience_title`
  - `experience_category`
  - `inquiry_source`
  - `cta_label`
  - `form_id`
- Metrics to import:
  - `Users`
  - `Sessions`
  - `Event count`
- Filters:
  - external traffic only when available
  - optionally focus on a single experience slug
- Funnel steps:
  1. `experience_view`
  2. `inquiry_click`
  3. `form_start`
  4. `form_submit`
  5. `contact_submit`
- Comparisons:
  - compare `signature` vs `lab` vs `black`
- Segments:
  - `External Qualified Visitors`
  - `High Intent Visitors`
  - by `inquiry_source`
- Tab configuration:
  - open funnel first
  - then rerun as closed funnel for strict path review
- Recommended date range:
  - last `28 days`
- Recommended visualization:
  - funnel chart
- Interpretation logic:
  - drop between `inquiry_click` and `form_start` suggests CTA-destination or form-entry friction
  - drop between `form_submit` and `contact_submit` suggests completion-state or event-quality issue

## Explore template 3: Cultural World Engagement

- Explore type:
  - `Free form`
- Purpose:
  - understand whether cultural-world content is generating substantive discovery
- Dimensions to import:
  - `page_path`
  - `page_title`
  - `source`
  - `content_context`
- Metrics to import:
  - `Users`
  - `Sessions`
  - `Engaged sessions`
  - `Event count`
  - `Average engagement time`
- Filters:
  - `Event name exactly matches cultural_world_view`
- Comparisons:
  - sessions with later `experience_view`
  - sessions without later `experience_view`
- Segments:
  - `External Qualified Visitors`
  - `Cultural World -> Experience Sessions`
  - `Cultural World -> Inquiry Sessions`
- Tab configuration:
  - rows:
    - `page_title`
    - `page_path`
  - values:
    - `Users`
    - `Engaged sessions`
    - `Average engagement time`
- Recommended date range:
  - last `28 days`
- Recommended visualization:
  - table plus time series
- Interpretation logic:
  - this explore separates pure editorial reading from discovery that later enters the commercial experience layer

## Explore template 4: Outbound Curiosity Map

- Explore type:
  - `Free form`
- Purpose:
  - understand where external curiosity is concentrated and whether it supports or distracts from intent
- Dimensions to import:
  - `outbound_domain`
  - `outbound_url`
  - `page_path`
  - `page_title`
  - `source`
- Metrics to import:
  - `Event count`
  - `Users`
  - `Sessions`
  - `Engaged sessions`
- Filters:
  - `Event name exactly matches outbound_click`
- Comparisons:
  - curiosity from experience pages vs non-experience pages
  - curiosity from high-intent sessions vs all sessions
- Segments:
  - `External Qualified Visitors`
  - `High Intent Visitors`
- Tab configuration:
  - rows:
    - `outbound_domain`
    - `outbound_url`
  - values:
    - `Event count`
    - `Users`
    - `Engaged sessions`
  - optional breakdown:
    - `page_title`
- Recommended date range:
  - last `28 days`
- Recommended visualization:
  - domain-first table
- Interpretation logic:
  - outbound clicks can mean validation, comparison, or distraction
  - always read this with inquiry behavior, never as a standalone performance KPI

## Explore template 5: High Intent Sessions

- Explore type:
  - `Free form`
- Purpose:
  - isolate sessions that represent meaningful commercial-cultural demand
- Dimensions to import:
  - `experience_slug`
  - `experience_title`
  - `experience_category`
  - `inquiry_source`
  - `session_origin`
  - `cta_position`
- Metrics to import:
  - `Sessions`
  - `Users`
  - `Engaged sessions`
  - `Event count`
  - `Key events`
- Filters:
  - include sessions containing:
    - `inquiry_click`
    - or `form_start`
    - or `contact_submit`
- Comparisons:
  - sessions with `contact_submit`
  - sessions without `contact_submit`
- Segments:
  - `High Intent Visitors`
  - `Returning Engaged Sessions` when available
- Tab configuration:
  - rows:
    - `experience_slug`
    - `inquiry_source`
  - values:
    - `Sessions`
    - `Users`
    - `Engaged sessions`
    - `Key events`
- Recommended date range:
  - last `28 days`
- Recommended visualization:
  - table with optional comparison chart
- Interpretation logic:
  - this is the best pre-inquiry-completion proxy for real human demand

## Explore template 6: Qualified Human Visitors

- Explore type:
  - `Free form`
- Purpose:
  - establish the clean denominator for executive review
- Dimensions to import:
  - `page_path`
  - `page_title`
  - `source`
  - `session_origin`
- Metrics to import:
  - `Users`
  - `Sessions`
  - `Engaged sessions`
  - `Average engagement time`
- Filters:
  - exclude internal traffic when available
  - exclude developer traffic when available
  - include meaningful event-bearing sessions
- Comparisons:
  - current period vs previous period
  - qualified vs all traffic
- Segments:
  - `External Qualified Visitors`
  - `Internal Traffic`
  - `Supplier/Partner Traffic` when taxonomy exists
- Tab configuration:
  - scorecard:
    - `Users`
    - `Sessions`
    - `Engaged sessions`
  - supporting table by `page_title`
- Recommended date range:
  - last `28 days`
- Recommended visualization:
  - scorecards plus trendline
- Interpretation logic:
  - use this as the denominator for weekly executive KPI discussion

## Segment definitions for GA4 operational use

### External Qualified Visitors

- Exclude internal traffic
- Exclude developer/debug traffic
- Include sessions with at least one of:
  - `experience_view`
  - `cultural_world_view`
  - `inquiry_click`
  - `form_start`
  - `contact_submit`
  - `outbound_click`

### Internal / Team Traffic

- Use GA4 internal traffic filter when verified

### Debug / Developer Traffic

- Use GA4 developer traffic filter when verified

### High Intent Visitors

- First operational proxy:
  - sessions containing `inquiry_click`, `form_start`, or `contact_submit`
- Future stronger proxy:
  - sessions whose Qualified Intent Score >= 50

## Executive weekly review flow

1. Open `Qualified Human Visitors` and confirm denominator trend.
2. Review `Real Inquiry Count` and `High Intent Sessions`.
3. Open `Experience Interest` to see which experiences drove quality attention.
4. Open `Inquiry Funnel` and check for material drop-offs.
5. Open `Cultural World Engagement` to verify editorial discovery is feeding experience demand.
6. Open `Outbound Curiosity Map` and check whether curiosity is supporting or diluting intent.
7. Record:
  - strongest experience
  - weakest conversion step
  - biggest anomaly
  - one action for the next week

## Founder KPI review flow

1. Start with:
  - Qualified Human Visitors
  - Real Inquiry Count
  - High Intent Sessions
2. Compare current 28 days vs previous 28 days.
3. Inspect top 5 experience slugs by:
  - engagement
  - inquiry rate
  - conversion depth
4. Check whether cultural-world content is acting as an upstream discovery engine.
5. Review outbound behavior only after inquiry performance, not before.
6. End with a single conclusion:
  - demand is growing
  - demand is stable
  - demand is weakening

## Anomaly detection checklist

- Did Qualified Human Visitors move materially week-over-week?
- Did Real Inquiry Count move in the same direction?
- Did one experience suddenly gain views without gaining inquiry behavior?
- Did one inquiry source suddenly dominate or disappear?
- Did form events shift in ratio:
  - `form_start`
  - `form_submit`
  - `contact_submit`
- Did outbound clicks spike from one page or one domain?
- Did internal or developer traffic filtering change?
- Did event counts change because of instrumentation rather than behavior?

## False-positive interpretation risks

- More outbound clicks do not always mean more interest.
- More experience views do not always mean better-fit audience.
- Editorial engagement can be high without commercial relevance.
- `page_view` noise can distort executive interpretation if treated like a primary KPI.
- Debug or internal traffic can inflate apparent demand if filters are not verified.

## Qualified Intent Score operationalization

### Manual calculation logic

For a session, sum:

- `experience_view` = 10
- `cultural_world_view` = 8
- `outbound_click` = 6
- `inquiry_click` = 22
- `form_start` = 18
- `contact_submit` = 36
- engaged session modifier = 8
- returning session modifier = 6

Then:

- cap at `100`
- classify:
  - `0-19` low intent
  - `20-49` qualified interest
  - `50-79` high intent
  - `80-100` inquiry ready

### GA4-compatible approximation logic

In GA4 Explore, approximate High Intent Sessions as sessions containing:

- `inquiry_click`
- or `form_start`
- or `contact_submit`

Approximate Qualified Interest as sessions containing:

- `experience_view`
- or `cultural_world_view`
- or `outbound_click`

This is not a true numeric session score, but it is a workable first operational layer.

### Future Looker Studio implementation path

1. Export or model event/session data in a downstream table.
2. Aggregate events at session level.
3. Apply the score weights in calculated fields or upstream SQL.
4. Bucket sessions into the four score bands.
5. Build scorecard views for:
  - High Intent Sessions
  - Inquiry Ready Sessions
  - Experience-level weighted demand

### Confidence caveats

- This score is heuristic.
- It should guide prioritization, not replace human judgment.
- It depends on traffic filtering quality.
- It is stronger at trend and cohort level than at single-session interpretation.
