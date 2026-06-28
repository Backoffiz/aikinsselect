-- Aikins Select — scheduled product sync (Supabase Cron)
-- Run this once in the Supabase SQL editor AFTER deploying the product-sync function.
-- Replace <PROJECT_REF> and <SYNC_SECRET> with real values.

-- 1) Required extensions
create extension if not exists pg_cron;
create extension if not exists pg_net;

-- 2) Daily refresh (09:00 UTC) — re-check price/stock/image for all published products.
--    PA-API ToS requires displayed prices to be <=24h old, so this must run daily.
select cron.schedule(
  'product-refresh-daily',
  '0 9 * * *',
  $$
  select net.http_post(
    url     := 'https://<PROJECT_REF>.supabase.co/functions/v1/product-sync?mode=refresh',
    headers := jsonb_build_object('Authorization','Bearer <SYNC_SECRET>','Content-Type','application/json'),
    body    := '{}'::jsonb,
    timeout_milliseconds := 280000
  );
  $$
);

-- 3) Weekly gather (Mondays 10:00 UTC) — discover + insert new products per category.
select cron.schedule(
  'product-gather-weekly',
  '0 10 * * 1',
  $$
  select net.http_post(
    url     := 'https://<PROJECT_REF>.supabase.co/functions/v1/product-sync?mode=gather',
    headers := jsonb_build_object('Authorization','Bearer <SYNC_SECRET>','Content-Type','application/json'),
    body    := '{}'::jsonb,
    timeout_milliseconds := 280000
  );
  $$
);

-- Useful management queries:
--   select * from cron.job;                                   -- list schedules
--   select * from cron.job_run_details order by start_time desc limit 20;  -- run history
--   select cron.unschedule('product-refresh-daily');          -- remove a schedule
