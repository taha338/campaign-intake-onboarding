-- Migration: add `clickup_fields` jsonb to the 3 form-submission tables.
--
-- Purpose: each form's /api/submit pre-builds the ClickUp custom_fields[]
-- array ([{ id, value }, ...]) and stores it here. The Cloudflare Worker's
-- reconcileDownstreamFields cron reads this column to gap-fill any field the
-- live submit-time sync dropped. Form-specific fields (PAC Legal Name, PAC
-- Mission, Users JSON, etc.) have no Sales record to heal from, so this
-- column is their only recovery source.
--
-- Safe to run more than once (IF NOT EXISTS). Apply in the Supabase SQL editor
-- on project kbjdrdftvywppdifjkbf.

alter table public.campaign_intakes
  add column if not exists clickup_fields jsonb;

alter table public.brand_submissions
  add column if not exists clickup_fields jsonb;

alter table public.website_content_submissions
  add column if not exists clickup_fields jsonb;
