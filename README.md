# Ariful's Canvas

Build this app using the HTML files referenced below. You can hotlink the images referenced in the HTML. The attached images are screenshots of the desired screens. Here are public links to the html of the screens which you should read and use to build the app:

1. https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzAwMDY1YzI1ODAwODcwN2EwMjJkNmFkMGU0MjI4NmM4EgsSBxDSlIywwwwYAZIBJAoKcHJvamVjdF9pZBIWQhQxMTE3MDU1OTM3OTIxMTU1MDk0Nw&filename=&opi=89354086
2. https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzAwMDY1YzI1N2VjMDE3ZWQwMmE5YWEzMDM0MjUxMGRhEgsSBxDSlIywwwwYAZIBJAoKcHJvamVjdF9pZBIWQhQxMTE3MDU1OTM3OTIxMTU1MDk0Nw&filename=&opi=89354086

Act as a senior full-stack software architect and engineer.

Build a production-ready personal portfolio platform for:

Md. Ariful Islam
BBA Student — Army Institute of Business Administration, Sylhet
Current Role: Assistant Organizing Secretary — AIBA Business Club, Sylhet
Location: Sylhet, Bangladesh
Email: md.ariful.2653@gmail.com
Phone: +880 1616-749488
LinkedIn: https://www.linkedin.com/in/mdarifulislam2005

The platform must consist of two connected applications:

1. A public-facing personal portfolio
2. A secure private Admin Dashboard / CMS

The public website must load its content dynamically from the backend/database. I must be able to update the portfolio from the dashboard without changing source code.

==================================================
PRODUCT ARCHITECTURE
==================================================

Public Website
      ↓
Backend / API
      ↓
Database
      ↓
Admin CMS
      ↓
Media Storage

Use a clean, scalable architecture so additional portfolio features can be introduced later.

Recommended stack:

Frontend:
- Next.js
- TypeScript
- Tailwind CSS
- Framer Motion
- Lucide Icons

Backend:
- Next.js API routes / Server Actions

Database:
- PostgreSQL

ORM:
- Prisma

Authentication:
- Secure email/password authentication
- Hashed passwords
- Protected sessions
- Protected /admin routes
- Logout
- Unauthorized-user handling

Storage:
- Cloudinary or Supabase Storage

Deployment:
- Vercel-compatible
- PostgreSQL production database

Store all credentials and secrets in environment variables.

==================================================
PUBLIC WEBSITE — VISUAL DIRECTION
==================================================

The public website should feel like a premium 2026 personal-brand website.

It must NOT resemble:
- a basic student CV
- a generic portfolio template
- a standard developer portfolio
- a Bootstrap-style website

Visual character:

Modern
Premium
Cinematic
Editorial
Minimal
Interactive
Confident
Personal

Use:
- oversized typography
- asymmetrical layouts
- editorial grids
- Bento-style sections
- floating content cards
- thin borders
- subtle glass surfaces
- controlled shadows
- sophisticated gradients
- atmospheric background lighting

Use Framer Motion for tasteful transitions and scroll-based reveals.

Avoid excessive animation or visual clutter.

==================================================
COLOR SYSTEM
==================================================

Color grading should be one of the strongest parts of the design.

Base tones:

- Deep Obsidian
- Near Black
- Graphite
- Warm Off-White

Accent direction:

- Electric Blue
- Deep Indigo
- Violet
- Cyan
- Warm Gold

Use a restrained combination rather than all of them simultaneously.

Possible gradient treatments:

Obsidian → Indigo
Indigo → Violet
Black → Electric Blue

Use gradients for:
- hero lighting
- selected typography
- borders
- cards
- background atmosphere
- CTA emphasis

Avoid:
- rainbow gradients
- excessive neon
- gaming-style glow
- uncontrolled glassmorphism

The primary accent color must be configurable from the Admin Dashboard.

==================================================
HERO
==================================================

The hero should make Md. Ariful Islam's identity immediately clear.

Display a professional profile photograph prominently.

Main name:

"Md. Ariful Islam"

Professional identity:

"BBA Student • Student Leader • Event & Project Coordinator"

Personal statement:

"I enjoy taking responsibility, organizing people and ideas, and turning plans into something that actually works."

Primary actions:

"Explore My Work"
"Let's Connect"

Include LinkedIn.

The profile image must come from the CMS, not be hardcoded.

The admin must be able to:
- upload a new photo
- replace the current photo
- delete the photo
- preview it
- crop it if practical

==================================================
NAVIGATION
==================================================

Public navigation:

Home
About
Experience
Events
Ambassador
Projects
Skills
Contact

Optional:
Resume

Use a sticky navigation bar.

On scroll:
- introduce subtle background opacity
- apply light blur
- show a thin border
- animate smoothly

On mobile, convert the navigation into a clean drawer/hamburger menu.

==================================================
ABOUT
==================================================

Use this initial content:

"BBA student at Army IBA, Sylhet, passionate about leadership, event management, business, and creating meaningful experiences.

Currently building hands-on experience through student leadership, events, ambassador programs, community initiatives, digital operations, and team-based projects."

Also show:

Education:
BBA — Army Institute of Business Administration, Sylhet

Current Role:
Assistant Organizing Secretary — AIBA Business Club, Sylhet

Location:
Sylhet, Bangladesh

Focus:
Leadership • Event Management • Project Coordination • Digital Operations

Every field must be editable through the CMS.

==================================================
EXPERIENCE CMS
==================================================

Build a dynamic experience section using timeline cards and featured case studies.

Initial content:

1. Assistant Organizing Secretary
AIBA Business Club, Sylhet
2026 – Present

Responsibilities:
- Event and organizational activity planning
- Executive and volunteer coordination
- Task delegation and follow-up
- Event operations
- Member engagement
- Organizational planning
- Operational efficiency

2. Senior Executive – IT
AIBA Business Club, Sylhet
Approximately 6 months

Responsibilities:
- IT and digital operations
- Google Sheets and Excel workflows
- Event registration and participant data
- Ticket-related information management
- Spreadsheet-based solutions
- Technical and operational support

3. Bijoyer Kuasha Utsob 2025
16 December 2025
Army IBA

Include:
- Ticketing and verification operations
- Excel-based ticket verification
- Ticket distribution
- Entry verification
- Attendee-flow coordination
- Approximately 1,000 attendees
- Real-time operational problem solving

4. ShowCase 1.0
National Business Case Competition
2026

Include:
- Planning and execution support
- Participant coordination
- Registration
- Communication
- Event logistics
- Cross-functional teamwork

5. AXIOM Season 1
National Research Poster Competition
2026

Include:
- Event operations
- Participant engagement
- Student/university outreach
- Registration coordination
- Event workflow support
- Participant communication

6. Microsoft Word & Excel Workshop
AIBA Business Club

Include:
- Workshop organization
- Facilitation
- Practical Word and Excel sessions
- Participant communication
- Workshop logistics

7. CEO
ZERO Organization
2021 – 2022

Include:
- Organization leadership
- Team coordination
- Community initiatives
- Six community projects
- Resource management

8. Rover Scout
Crystal Open Scouts
2022 – Present

9. Assistant Patrol Leader
Motijheel Model School & College Scout Group
2020

Each experience record must support:

- Title
- Organization
- Start date
- End date
- Current-position toggle
- Description
- Responsibilities
- Skills
- Image
- Featured toggle
- Display order

Provide complete CRUD functionality:
Create
Read
Update
Delete

Allow drag-and-drop ordering if practical.

==================================================
AMBASSADOR EXPERIENCE
==================================================

Create a dedicated section.

Tickify
Student Ambassador
September 2026 – Present

Initial information:
- Selected through a process involving 1,000+ applicants from 83 universities
- One of 67 onboarded student ambassadors
- Campus engagement
- Student communication
- Promotional activities

Spike Story
Campus Ambassador
April 2026 – Present

Initial information:
- Campus representation
- Student engagement
- Promotional activities
- Program/opportunity promotion
- Campus outreach

The admin must be able to add, edit, remove, reorder and feature ambassador roles.

==================================================
TECHNICAL EXPERIENCE
==================================================

Present Ariful's technical work as practical digital/automation experience, not as professional software-engineering employment.

Include:

- Microsoft Excel
- Google Sheets
- Google Forms
- Google Apps Script
- Microsoft Word
- QR-based ticketing systems
- Data management
- Workflow automation

Create a visual case study for the QR ticketing workflow:

Registration
→ Unique Ticket
→ QR Code
→ Confirmation
→ Verification
→ Event Entry

This entire case study must be editable through the dashboard.

==================================================
MARKETING & COMMUNICATION
==================================================

Include experience with:

- Event promotion
- Promotional content and captions
- Student outreach
- Participant engagement
- Competition promotion
- Workshop promotion
- Campus campaigns
- Ambassador promotion
- Professional communication
- Corporate outreach
- Sponsorship communication

Do not display specific company names.

==================================================
PROJECTS
==================================================

Create a dynamic project showcase.

PROJECT 01 — ON TIME

Status:
Concept / Project Development

Description:
A real-time transportation information platform built around the problem of delayed buses and trains in Bangladesh.

Features:
- Real-time vehicle tracking
- Live map
- ETA
- Route information
- Delay status
- Journey alerts
- Bus/train seat availability
- Remaining seat availability for delayed vehicles
- Ticket-booking integration concept

Campaign:
"Don't Wait. Know."

"100 Early Customers"

---

PROJECT 02 — SMART RELAXATIONHUB

Status:
Ongoing / Growing

Important:
Do not represent this as a completed project.

Present it as a project currently being developed and explored.

The CMS must allow the status to be changed later.

---

PROJECT 03 — NEXA CAMPUS

Status:
Project Concept

Description:
A University Management System concept focused on student and academic management.

Include:
- Student management
- Academic management
- Feature planning
- Business model concept
- Pricing concept
- Presentation development

Every project should support:

- Name
- Description
- Status
- Category
- Cover image
- Image gallery
- Features
- Tools/technologies
- External link
- GitHub link
- Featured toggle
- Display order

==================================================
COMMUNITY EXPERIENCE
==================================================

ZERO Organization

CEO
2021 – 2022

Display the verified community activities:

11 blankets distributed
31 street children supported with clothing
13+ people supported financially
10 people supported with winter clothing
15 disadvantaged people included in an Iftar initiative

All numbers and descriptions must be editable from the dashboard.

==================================================
ADMIN DASHBOARD
==================================================

Create a completely separate private area.

Routes:

/admin/login
/admin/dashboard

Do not expose the dashboard as a normal public navigation item.

==================================================
ADMIN LOGIN
==================================================

Create a polished secure login page.

Branding:

MD. ARIFUL ISLAM
Portfolio Admin

Fields:

Email
Password

Controls:

Remember me
Login

Requirements:

- Secure authentication
- Password hashing
- Protected sessions
- Protected routes
- Logout
- Unauthorized users redirected to login
- Rate limiting if practical
- Never expose credentials or secrets to the client

==================================================
DASHBOARD DESIGN
==================================================

The dashboard should look like a premium modern SaaS product.

Sidebar:

Dashboard
Profile
Experience
Events
Ambassadors
Projects
Skills
Community
Media
Appearance
SEO
Settings

Top navigation:

Admin profile
View Website
Notifications placeholder
Logout

Dashboard overview:

"Welcome back, Ariful."

Display:

Experience Entries
Projects
Events
Ambassador Roles
Media Files

Also include:

Recent Updates
Quick Actions

Quick action buttons:

Add Experience
Add Project
Upload Photo
Edit Profile

==================================================
PROFILE MANAGEMENT
==================================================

The admin must be able to modify:

- Name
- Profile photo
- Short title
- Bio
- Email
- Phone
- Location
- Education
- Current role
- LinkedIn
- Social links

Image management must support:

Upload
Preview
Replace
Delete
Crop if practical

==================================================
MEDIA LIBRARY
==================================================

Create a dedicated media manager.

Support:

- Profile images
- Event photos
- Project covers
- Gallery images

Features:

Upload
Preview
Replace
Delete
Search
Filter
Copy image URL

Use cloud storage.

==================================================
APPEARANCE CONTROL
==================================================

Allow the admin to modify:

- Primary accent
- Secondary accent
- Background tone
- Border intensity
- Gradient intensity
- Light/dark mode if implemented

Provide preset themes:

Obsidian
Midnight
Indigo
Electric
Minimal

The admin should be able to see the effect of visual changes without editing code.

==================================================
LIVE PREVIEW / PUBLISHING
==================================================

This is a major requirement.

Editing flow:

Admin Login
→ Edit Content
→ Live Preview
→ Save Draft
→ Preview
→ Publish

When the admin edits:

- Name
- Bio
- Photo
- Experience
- Project
- Colors

show an immediate preview of the public website.

Support:

SAVE CHANGES
PREVIEW
PUBLISH

If a draft system is implemented, clearly distinguish Draft and Published states.

==================================================
DATABASE
==================================================

Suggested models:

AdminUser
Profile
Experience
Event
Ambassador
Project
Skill
CommunityImpact
Media
SiteSettings
SocialLink

Every model should have:

id
createdAt
updatedAt

Use relational structure and appropriate indexes.

==================================================
SEO MANAGEMENT
==================================================

Allow SEO settings to be changed from the dashboard:

Page title
Meta description
OG title
OG description
OG image
Keywords

Default title:

"Md. Ariful Islam | BBA Student & Student Leader"

==================================================
VALIDATION
==================================================

All CMS forms must provide:

- Required-field validation
- Character limits
- Image-size validation
- Supported image formats
- Loading states
- Error states
- Success notifications
- Delete confirmation

Use clear toast notifications.

==================================================
PERFORMANCE
==================================================

Optimize for:

- Lighthouse
- Core Web Vitals
- Mobile performance
- Image optimization
- Lazy loading
- Server-side rendering where appropriate
- Minimal client-side JavaScript

==================================================
RESPONSIVE BEHAVIOR
==================================================

Both the public website and admin dashboard must work correctly on:

- Desktop
- Laptop
- Tablet
- Mobile

The dashboard should transform tables into card-based layouts on smaller screens.

==================================================
EXTENSIBILITY
==================================================

Keep the architecture ready for future additions such as:

- Blog
- Testimonials
- Certifications
- Resume upload
- Contact form
- Analytics
- Visitor statistics
- Newsletter
- Detailed case studies

Do not build unnecessary features now.

==================================================
FINAL PRODUCT PRINCIPLE
==================================================

The portfolio should communicate:

Md. Ariful Islam is a young professional developing real-world experience through leadership, events, technology, communication and projects.

The website should be visually impressive but credible.

Never invent achievements or transform student experience into unsupported corporate experience.

Most importantly, the owner must be able to change his:

Name
Photo
Bio
Experience
Events
Ambassador roles
Projects
Skills
Community work
Social links
SEO
Colors
Images

without touching the source code.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/f491285b-f837-4d28-a018-b7afb71fbea7).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
