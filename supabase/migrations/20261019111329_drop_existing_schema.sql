drop trigger if exists on_auth_user_created on auth.users;
drop trigger if exists guard_profile_role on profiles;
drop trigger if exists on_assignment_created on assignments;

drop table if exists notifications cascade;
drop table if exists submissions cascade;
drop table if exists assignments cascade;
drop table if exists class_members cascade;
drop table if exists classes cascade;
drop table if exists profiles cascade;

drop function if exists handle_new_user() cascade;
drop function if exists notify_class_on_assignment() cascade;
drop function if exists guard_profile_role() cascade;
drop function if exists is_class_teacher(uuid) cascade;
drop function if exists is_class_member(uuid) cascade;
drop function if exists class_of_assignment(uuid) cascade;
drop function if exists join_class(text) cascade;
drop function if exists notify_new_assignment() cascade;
