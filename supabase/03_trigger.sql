-- ШАГ 3: Триггер автосоздания профиля + функция admin

create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, name)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', new.email))
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Вспомогательная функция для назначения администратора
-- Использование: select set_user_role('uuid-пользователя', 'admin');
create or replace function set_user_role(target_user_id uuid, new_role text)
returns void as $$
begin
  update profiles set role = new_role where id = target_user_id;
end;
$$ language plpgsql security definer;
