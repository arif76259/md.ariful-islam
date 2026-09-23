-- ===== roles =====
create type public.app_role as enum ('admin');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;
create policy "own roles readable" on public.user_roles for select to authenticated using (user_id = auth.uid());

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select public.has_role(auth.uid(), 'admin')
$$;

-- one-time bootstrap: first signed-in user may claim admin if none exists
create or replace function public.claim_admin()
returns boolean language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid();
begin
  if uid is null then return false; end if;
  if exists (select 1 from public.user_roles where role = 'admin') then
    return public.has_role(uid, 'admin');
  end if;
  insert into public.user_roles (user_id, role) values (uid, 'admin') on conflict do nothing;
  return true;
end;
$$;
grant execute on function public.claim_admin() to authenticated;
grant execute on function public.is_admin() to authenticated, anon;
grant execute on function public.has_role(uuid, public.app_role) to authenticated;

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

-- ===== profile =====
create table public.profile (
  id uuid primary key default gen_random_uuid(),
  name text not null default '',
  headline text not null default '',
  statement text not null default '',
  bio text not null default '',
  email text not null default '',
  phone text not null default '',
  location text not null default '',
  education text not null default '',
  current_role_title text not null default '',
  focus text not null default '',
  linkedin text not null default '',
  photo_url text,
  resume_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.profile to anon;
grant select, insert, update, delete on public.profile to authenticated;
grant all on public.profile to service_role;
alter table public.profile enable row level security;
create policy "profile public read" on public.profile for select to anon, authenticated using (true);
create policy "profile admin write" on public.profile for all to authenticated using (public.is_admin()) with check (public.is_admin());
create trigger t_profile before update on public.profile for each row execute function public.touch_updated_at();

-- ===== experiences =====
create table public.experiences (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  organization text not null default '',
  category text not null default 'experience',
  start_date text not null default '',
  end_date text not null default '',
  is_current boolean not null default false,
  description text not null default '',
  responsibilities text[] not null default '{}',
  skills text[] not null default '{}',
  image_url text,
  featured boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.experiences to anon;
grant select, insert, update, delete on public.experiences to authenticated;
grant all on public.experiences to service_role;
alter table public.experiences enable row level security;
create policy "exp public read" on public.experiences for select to anon, authenticated using (true);
create policy "exp admin write" on public.experiences for all to authenticated using (public.is_admin()) with check (public.is_admin());
create index idx_exp_order on public.experiences (sort_order);
create trigger t_exp before update on public.experiences for each row execute function public.touch_updated_at();

-- ===== ambassadors =====
create table public.ambassadors (
  id uuid primary key default gen_random_uuid(),
  brand text not null,
  role_title text not null default '',
  period text not null default '',
  description text not null default '',
  highlights text[] not null default '{}',
  logo_url text,
  featured boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.ambassadors to anon;
grant select, insert, update, delete on public.ambassadors to authenticated;
grant all on public.ambassadors to service_role;
alter table public.ambassadors enable row level security;
create policy "amb public read" on public.ambassadors for select to anon, authenticated using (true);
create policy "amb admin write" on public.ambassadors for all to authenticated using (public.is_admin()) with check (public.is_admin());
create trigger t_amb before update on public.ambassadors for each row execute function public.touch_updated_at();

-- ===== projects =====
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  tagline text not null default '',
  description text not null default '',
  status text not null default 'Concept',
  category text not null default '',
  cover_url text,
  gallery text[] not null default '{}',
  features text[] not null default '{}',
  tools text[] not null default '{}',
  external_link text,
  github_link text,
  featured boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.projects to anon;
grant select, insert, update, delete on public.projects to authenticated;
grant all on public.projects to service_role;
alter table public.projects enable row level security;
create policy "proj public read" on public.projects for select to anon, authenticated using (true);
create policy "proj admin write" on public.projects for all to authenticated using (public.is_admin()) with check (public.is_admin());
create trigger t_proj before update on public.projects for each row execute function public.touch_updated_at();

-- ===== skills =====
create table public.skills (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  group_name text not null default 'General',
  level int not null default 80,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.skills to anon;
grant select, insert, update, delete on public.skills to authenticated;
grant all on public.skills to service_role;
alter table public.skills enable row level security;
create policy "skill public read" on public.skills for select to anon, authenticated using (true);
create policy "skill admin write" on public.skills for all to authenticated using (public.is_admin()) with check (public.is_admin());
create trigger t_skill before update on public.skills for each row execute function public.touch_updated_at();

-- ===== community impact =====
create table public.community_impacts (
  id uuid primary key default gen_random_uuid(),
  metric text not null default '',
  label text not null,
  description text not null default '',
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.community_impacts to anon;
grant select, insert, update, delete on public.community_impacts to authenticated;
grant all on public.community_impacts to service_role;
alter table public.community_impacts enable row level security;
create policy "ci public read" on public.community_impacts for select to anon, authenticated using (true);
create policy "ci admin write" on public.community_impacts for all to authenticated using (public.is_admin()) with check (public.is_admin());
create trigger t_ci before update on public.community_impacts for each row execute function public.touch_updated_at();

-- ===== case study steps (QR ticketing workflow) =====
create table public.case_steps (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.case_steps to anon;
grant select, insert, update, delete on public.case_steps to authenticated;
grant all on public.case_steps to service_role;
alter table public.case_steps enable row level security;
create policy "cs public read" on public.case_steps for select to anon, authenticated using (true);
create policy "cs admin write" on public.case_steps for all to authenticated using (public.is_admin()) with check (public.is_admin());
create trigger t_cs before update on public.case_steps for each row execute function public.touch_updated_at();

-- ===== social links =====
create table public.social_links (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  url text not null,
  icon text not null default 'link',
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.social_links to anon;
grant select, insert, update, delete on public.social_links to authenticated;
grant all on public.social_links to service_role;
alter table public.social_links enable row level security;
create policy "sl public read" on public.social_links for select to anon, authenticated using (true);
create policy "sl admin write" on public.social_links for all to authenticated using (public.is_admin()) with check (public.is_admin());
create trigger t_sl before update on public.social_links for each row execute function public.touch_updated_at();

-- ===== media =====
create table public.media (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  url text not null,
  path text not null default '',
  kind text not null default 'image',
  size_bytes bigint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.media to anon;
grant select, insert, update, delete on public.media to authenticated;
grant all on public.media to service_role;
alter table public.media enable row level security;
create policy "media public read" on public.media for select to anon, authenticated using (true);
create policy "media admin write" on public.media for all to authenticated using (public.is_admin()) with check (public.is_admin());
create trigger t_media before update on public.media for each row execute function public.touch_updated_at();

-- ===== site settings (SEO + appearance) =====
create table public.site_settings (
  id uuid primary key default gen_random_uuid(),
  seo_title text not null default '',
  seo_description text not null default '',
  og_title text not null default '',
  og_description text not null default '',
  og_image text,
  keywords text not null default '',
  theme_preset text not null default 'Obsidian',
  primary_accent text not null default '#7C7CFF',
  secondary_accent text not null default '#22D3EE',
  background_tone text not null default '#0B0B0F',
  border_intensity int not null default 14,
  gradient_intensity int not null default 60,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.site_settings to anon;
grant select, insert, update, delete on public.site_settings to authenticated;
grant all on public.site_settings to service_role;
alter table public.site_settings enable row level security;
create policy "ss public read" on public.site_settings for select to anon, authenticated using (true);
create policy "ss admin write" on public.site_settings for all to authenticated using (public.is_admin()) with check (public.is_admin());
create trigger t_ss before update on public.site_settings for each row execute function public.touch_updated_at();

-- ===== SEED =====
insert into public.profile (name, headline, statement, bio, email, phone, location, education, current_role_title, focus, linkedin)
values (
 'Md. Ariful Islam',
 'BBA Student • Student Leader • Event & Project Coordinator',
 'I enjoy taking responsibility, organizing people and ideas, and turning plans into something that actually works.',
 'BBA student at Army IBA, Sylhet, passionate about leadership, event management, business, and creating meaningful experiences.

Currently building hands-on experience through student leadership, events, ambassador programs, community initiatives, digital operations, and team-based projects.',
 'md.ariful.2653@gmail.com',
 '+880 1616-749488',
 'Sylhet, Bangladesh',
 'BBA — Army Institute of Business Administration, Sylhet',
 'Assistant Organizing Secretary — AIBA Business Club, Sylhet',
 'Leadership • Event Management • Project Coordination • Digital Operations',
 'https://www.linkedin.com/in/mdarifulislam2005'
);

insert into public.site_settings (seo_title, seo_description, og_title, og_description, keywords)
values (
 'Md. Ariful Islam | BBA Student & Student Leader',
 'Personal portfolio of Md. Ariful Islam — BBA student at Army IBA Sylhet, student leader, event and project coordinator.',
 'Md. Ariful Islam | BBA Student & Student Leader',
 'Leadership, event management, project coordination and digital operations.',
 'Md. Ariful Islam, BBA, Army IBA Sylhet, student leader, event management, portfolio'
);

insert into public.social_links (label, url, icon, sort_order) values
 ('LinkedIn','https://www.linkedin.com/in/mdarifulislam2005','linkedin',1),
 ('Email','mailto:md.ariful.2653@gmail.com','mail',2),
 ('Phone','tel:+8801616749488','phone',3);

insert into public.experiences (title, organization, category, start_date, end_date, is_current, description, responsibilities, skills, featured, sort_order) values
('Assistant Organizing Secretary','AIBA Business Club, Sylhet','Leadership','2026','Present',true,'Leading organizational planning, executive coordination and event operations for the club.',
 array['Event and organizational activity planning','Executive and volunteer coordination','Task delegation and follow-up','Event operations','Member engagement','Organizational planning','Operational efficiency'],
 array['Leadership','Coordination','Planning'],true,1),
('Senior Executive – IT','AIBA Business Club, Sylhet','Leadership','Approx. 6 months','',false,'Handled IT and digital operations supporting club events and registrations.',
 array['IT and digital operations','Google Sheets and Excel workflows','Event registration and participant data','Ticket-related information management','Spreadsheet-based solutions','Technical and operational support'],
 array['Excel','Google Sheets','Data Management'],true,2),
('Bijoyer Kuasha Utsob 2025','Army IBA','Event','16 December 2025','',false,'Ticketing and verification operations for a large-scale campus festival with approximately 1,000 attendees.',
 array['Ticketing and verification operations','Excel-based ticket verification','Ticket distribution','Entry verification','Attendee-flow coordination','Approximately 1,000 attendees','Real-time operational problem solving'],
 array['Event Operations','Ticketing','Excel'],true,3),
('ShowCase 1.0','National Business Case Competition','Event','2026','',false,'Planning and execution support for a national business case competition.',
 array['Planning and execution support','Participant coordination','Registration','Communication','Event logistics','Cross-functional teamwork'],
 array['Event Management','Communication'],true,4),
('AXIOM Season 1','National Research Poster Competition','Event','2026','',false,'Event operations and participant engagement for a national research poster competition.',
 array['Event operations','Participant engagement','Student/university outreach','Registration coordination','Event workflow support','Participant communication'],
 array['Outreach','Operations'],false,5),
('Microsoft Word & Excel Workshop','AIBA Business Club','Event','','',false,'Organized and facilitated practical Microsoft Office training sessions.',
 array['Workshop organization','Facilitation','Practical Word and Excel sessions','Participant communication','Workshop logistics'],
 array['Facilitation','Excel','Word'],false,6),
('CEO','ZERO Organization','Community','2021','2022',false,'Led a community organization delivering six community projects.',
 array['Organization leadership','Team coordination','Community initiatives','Six community projects','Resource management'],
 array['Leadership','Community Work'],true,7),
('Rover Scout','Crystal Open Scouts','Scouting','2022','Present',true,'Active Rover Scout engaged in field discipline and community service.',
 array['Field logistics','Community service','Team discipline'],
 array['Discipline','Teamwork'],false,8),
('Assistant Patrol Leader','Motijheel Model School & College Scout Group','Scouting','2020','',false,'Led a scout patrol with responsibility for coordination and discipline.',
 array['Patrol coordination','Discipline','Camp logistics'],
 array['Leadership','Teamwork'],false,9);

insert into public.ambassadors (brand, role_title, period, description, highlights, featured, sort_order) values
('Tickify','Student Ambassador','September 2026 – Present','Representing a ticketing technology platform across the campus network.',
 array['Selected through a process involving 1,000+ applicants from 83 universities','One of 67 onboarded student ambassadors','Campus engagement','Student communication','Promotional activities'],true,1),
('Spike Story','Campus Ambassador','April 2026 – Present','Campus representation and student engagement for a youth-focused platform.',
 array['Campus representation','Student engagement','Promotional activities','Program/opportunity promotion','Campus outreach'],true,2);

insert into public.projects (name, tagline, description, status, category, features, tools, featured, sort_order) values
('On Time','Don''t Wait. Know.','A real-time transportation information platform built around the problem of delayed buses and trains in Bangladesh.','Concept / Project Development','Product Concept',
 array['Real-time vehicle tracking','Live map','ETA','Route information','Delay status','Journey alerts','Bus/train seat availability','Remaining seat availability for delayed vehicles','Ticket-booking integration concept','Campaign: 100 Early Customers'],
 array['Product Design','Research','Presentation'],true,1),
('Smart RelaxationHub','A project currently being developed and explored','An ongoing project being developed and explored — not a completed product.','Ongoing / Growing','Project',
 array['Concept development','Iterative exploration','Feature planning'],
 array['Planning','Research'],true,2),
('Nexa Campus','University Management System concept','A University Management System concept focused on student and academic management.','Project Concept','Concept',
 array['Student management','Academic management','Feature planning','Business model concept','Pricing concept','Presentation development'],
 array['Business Modelling','Presentation'],true,3);

insert into public.skills (name, group_name, level, sort_order) values
('Microsoft Excel','Digital Operations',92,1),
('Google Sheets','Digital Operations',90,2),
('Google Forms','Digital Operations',88,3),
('Google Apps Script','Digital Operations',70,4),
('Microsoft Word','Digital Operations',90,5),
('QR-based ticketing systems','Digital Operations',85,6),
('Data management','Digital Operations',85,7),
('Workflow automation','Digital Operations',78,8),
('Event promotion','Marketing & Communication',88,9),
('Promotional content and captions','Marketing & Communication',84,10),
('Student outreach','Marketing & Communication',90,11),
('Participant engagement','Marketing & Communication',88,12),
('Competition promotion','Marketing & Communication',82,13),
('Workshop promotion','Marketing & Communication',82,14),
('Campus campaigns','Marketing & Communication',85,15),
('Ambassador promotion','Marketing & Communication',86,16),
('Professional communication','Marketing & Communication',90,17),
('Corporate outreach','Marketing & Communication',80,18),
('Sponsorship communication','Marketing & Communication',80,19),
('Leadership','Core',92,20),
('Event management','Core',90,21),
('Project coordination','Core',88,22);

insert into public.case_steps (title, description, sort_order) values
('Registration','Participants register through a structured online form feeding a central sheet.',1),
('Unique Ticket','Each registration is issued a unique ticket identifier.',2),
('QR Code','A QR code is generated and attached to the ticket record.',3),
('Confirmation','Confirmation is shared with the participant with entry details.',4),
('Verification','At the gate, the ticket is verified against the master sheet.',5),
('Event Entry','Verified attendees are admitted and the record is marked used.',6);

insert into public.community_impacts (metric, label, description, sort_order) values
('11','Blankets distributed','Winter relief distribution for people in need.',1),
('31','Street children supported with clothing','Clothing support initiative for street children.',2),
('13+','People supported financially','Direct financial support to individuals in need.',3),
('10','People supported with winter clothing','Winter clothing support initiative.',4),
('15','Disadvantaged people in an Iftar initiative','Community Iftar initiative during Ramadan.',5);