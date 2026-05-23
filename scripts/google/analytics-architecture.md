# CREARE Executive Analytics Architecture

This document defines the next analytics intelligence layer for CREARE using the current GTM and GA4 event model.

It is planning scaffolding only.

- No GTM changes are made by this document.
- No GA4 changes are made by this document.
- No Looker Studio assets are created automatically.

## Current analytics surface

### Core events

- `page_view`
- `experience_view`
- `inquiry_click`
- `contact_submit`
- `outbound_click`
- `cultural_world_view`
- `form_start`
- `form_submit`
- `form_success`
- `form_error`

### Available dimensions

- `page_path`
- `page_title`
- `page_location`
- `experience_slug`
- `experience_title`
- `experience_category`
- `inquiry_source`
- `cta_label`
- `form_id`
- `form_status`
- `outbound_url`
- `outbound_domain`
- `content_context`
- `session_origin`
- `intent_level`
- `cta_position`
- `source`

## Executive KPI layer

### Qualified Human Visitors

- Purpose: Estimate real external human traffic with meaningful behavioral value.
- Definition:
  - users or sessions that are not internal/developer traffic
  - and show at least one meaningful engagement or intent event
- Suggested first rule:
  - session contains one of:
    - `experience_view`
    - `cultural_world_view`
    - `inquiry_click`
    - `form_start`
    - `contact_submit`
    - `outbound_click`
- Notes:
  - strongest once internal/developer filters are verified
  - should be used as the main denominator instead of raw users

### Real Inquiry Count

- Purpose: Count serious human inquiry outcomes.
- Definition:
  - count of `contact_submit`
  - filtered to external traffic only
- Notes:
  - `contact_submit` should remain the canonical inquiry KPI
  - `form_submit` and `form_success` remain supporting diagnostics

### Experience Intent Rate

- Purpose: Measure how often experience attention turns into inquiry behavior.
- Definition:
  - sessions with `inquiry_click` divided by sessions with `experience_view`
- Notes:
  - can also be cut by `experience_slug` or `experience_category`

### Inquiry Conversion Depth

- Purpose: Measure funnel progression from interest to contact submission.
- Definition:
  - step-through from:
    - `experience_view`
    - `inquiry_click`
    - `form_start`
    - `form_submit`
    - `contact_submit`
- Notes:
  - best used as a funnel, not a single raw metric

### Cultural World Engagement Rate

- Purpose: Understand whether cultural-world content is driving substantive discovery.
- Definition:
  - sessions with `cultural_world_view` divided by qualified sessions
- Notes:
  - useful as an editorial discovery KPI

### Outbound Curiosity Rate

- Purpose: Measure curiosity-driven behavior toward external references, partners, or supporting destinations.
- Definition:
  - sessions with `outbound_click` divided by qualified sessions
- Notes:
  - should be segmented by `outbound_domain`
  - high values are not always positive and need editorial interpretation

### High Intent Sessions

- Purpose: Identify sessions showing strong conversion or research intent.
- Definition:
  - sessions whose Qualified Intent Score exceeds threshold
  - or contain `contact_submit`
- Suggested first threshold:
  - score >= 50

## GA4 Explore templates

## 1. Experience Interest

- Purpose:
  - measure which experiences attract sustained attention
- Dimensions:
  - `experience_slug`
  - `experience_title`
  - `experience_category`
  - `page_path`
- Metrics:
  - users
  - sessions
  - event count
  - views
  - average engagement time
  - engaged sessions
- Filters:
  - event name = `experience_view`
  - exclude internal traffic when verified
  - exclude developer traffic when verified
- Segments:
  - external qualified visitors
  - high intent visitors
  - by experience category
- Recommended visualization:
  - table sorted by engaged sessions
  - secondary bar chart by experience category
- Interpretation notes:
  - high views with low engagement suggests curiosity without resonance
  - high engagement with strong inquiry progression indicates strong commercial-cultural fit

## 2. Inquiry Funnel

- Purpose:
  - measure how experience interest progresses toward inquiry
- Dimensions:
  - `experience_slug`
  - `experience_title`
  - `inquiry_source`
  - `cta_label`
  - `form_id`
- Metrics:
  - funnel step completion
  - users
  - sessions
  - event count
- Filters:
  - include events:
    - `experience_view`
    - `inquiry_click`
    - `form_start`
    - `form_submit`
    - `contact_submit`
- Segments:
  - external qualified visitors
  - high intent visitors
  - by inquiry source
- Recommended visualization:
  - funnel exploration
- Interpretation notes:
  - large drop from `inquiry_click` to `form_start` suggests CTA or destination mismatch
  - large drop from `form_submit` to `contact_submit` suggests form or success-state issues

## 3. Cultural World Engagement

- Purpose:
  - measure the editorial role of cultural worlds in discovery
- Dimensions:
  - `page_path`
  - `page_title`
  - `source`
  - `content_context`
- Metrics:
  - users
  - sessions
  - engaged sessions
  - event count
  - average engagement time
- Filters:
  - event name = `cultural_world_view`
- Segments:
  - external qualified visitors
  - sessions that later hit `experience_view`
  - sessions that later hit `inquiry_click`
- Recommended visualization:
  - path table plus supporting time series
- Interpretation notes:
  - this template helps distinguish pure editorial reading from intent-generating discovery

## 4. Outbound Curiosity Map

- Purpose:
  - understand what external references attract curiosity
- Dimensions:
  - `outbound_domain`
  - `outbound_url`
  - `page_path`
  - `page_title`
- Metrics:
  - event count
  - users
  - sessions
  - engaged sessions
- Filters:
  - event name = `outbound_click`
- Segments:
  - external qualified visitors
  - high intent visitors
  - by source page type
- Recommended visualization:
  - table by `outbound_domain`
  - drilldown table by `outbound_url`
- Interpretation notes:
  - outbound behavior can indicate trust, comparison, or distraction
  - read this alongside inquiry behavior, not in isolation

## 5. High Intent Sessions

- Purpose:
  - isolate sessions most likely to represent serious human opportunity
- Dimensions:
  - `experience_slug`
  - `experience_title`
  - `experience_category`
  - `inquiry_source`
  - `session_origin`
- Metrics:
  - sessions
  - users
  - engaged sessions
  - contact submits
- Filters:
  - sessions containing:
    - `inquiry_click`
    - or `form_start`
    - or `contact_submit`
- Segments:
  - high intent visitor
  - returning engaged sessions if available
- Recommended visualization:
  - free-form table with score bucket breakout
- Interpretation notes:
  - this is the best executive proxy for meaningful demand before inquiry completion

## 6. Qualified Human Visitors

- Purpose:
  - create the clean denominator for executive reporting
- Dimensions:
  - `page_path`
  - `page_title`
  - `source`
  - `session_origin`
- Metrics:
  - users
  - sessions
  - engaged sessions
  - average engagement time
- Filters:
  - exclude internal traffic when verified
  - exclude developer traffic when verified
  - include sessions with at least one meaningful content or intent event
- Segments:
  - external qualified visitor
  - internal/team traffic
  - supplier/partner traffic when future taxonomy exists
- Recommended visualization:
  - scorecard plus trendline
- Interpretation notes:
  - use this as the top-level denominator across the executive dashboard

## Segmentation model

### External qualified visitor

- not internal traffic
- not developer/debug traffic
- has meaningful engagement or intent behavior

### Internal/team traffic

- GA4 internal traffic rule marks event or session as internal
- keep excluded until the filter is validated and activated

### Supplier/partner traffic

- future segmentation
- likely based on UTM or source taxonomy rather than inferred behavior alone

### Debug/developer traffic

- traffic observed in Tag Assistant or debug-mode workflows
- should be excluded by GA4 developer traffic filtering when verified

### High intent visitor

- visitor or session with Qualified Intent Score above threshold
- or session containing `contact_submit`

## Recommended visualization stack

### GA4 Explore

- use for:
  - funnel exploration
  - ad hoc segmentation
  - validating event quality

### Looker Studio

- use later for:
  - executive scorecards
  - weekly leadership dashboard
  - experience-level comparison views

## Implementation notes

- Internal traffic and developer traffic must be verified before executive numbers are treated as clean.
- `page_view` is currently a key event in GA4. That may add reporting noise and should be reviewed separately.
- `outbound_click` should be interpreted as curiosity, not conversion.
- Qualified Intent Score is a first decision-support model, not a perfect attribution model.
