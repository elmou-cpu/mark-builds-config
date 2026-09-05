create or replace function public.claim_first_admin()
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  existing int;
begin
  if auth.uid() is null then
    return false;
  end if;
  select count(*) into existing from public.user_roles where role = 'admin';
  if existing > 0 then
    return false;
  end if;
  insert into public.user_roles (user_id, role) values (auth.uid(), 'admin')
  on conflict (user_id, role) do nothing;
  return true;
end
$$;

revoke all on function public.claim_first_admin() from public, anon;
grant execute on function public.claim_first_admin() to authenticated;