import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { queries } from "@/lib/cms";
import { SiteNav } from "@/components/site/SiteNav";
import { PageviewTracker } from "@/components/site/PageviewTracker";
import { RecommendationsSection } from "@/components/site/Recommendations";
import {
  About,
  AmbassadorSection,
  CommunitySection,
  ContactSection,
  DigitalOps,
  EventsSection,
  ExperienceSection,
  Hero,
  ProjectsSection,
  SiteFooter,
  SkillsSection,
} from "@/components/site/Sections";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Md. Ariful Islam | BBA Student & Student Leader" },
      {
        name: "description",
        content:
          "BBA student at Army IBA Sylhet. Student leader, event and project coordinator working across leadership, events, ambassador programs and digital operations.",
      },
      { property: "og:title", content: "Md. Ariful Islam | BBA Student & Student Leader" },
      {
        property: "og:description",
        content:
          "Leadership, event management, project coordination and digital operations — the work of Md. Ariful Islam.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Index,
});

function Index() {
  const profile = useQuery(queries.profile);
  const experiences = useQuery(queries.experiences);
  const ambassadors = useQuery(queries.ambassadors);
  const projects = useQuery(queries.projects);
  const skills = useQuery(queries.skills);
  const community = useQuery(queries.community);
  const caseSteps = useQuery(queries.caseSteps);
  const social = useQuery(queries.social);
  const settings = useQuery(queries.settings);
  const recommendations = useQuery(queries.recommendations);

  if (!profile.data) {
    return (
      <div className="grid min-h-screen place-items-center">
        <p className="label-mono text-muted-foreground">
          {profile.isError ? "Content unavailable" : "Loading"}
        </p>
      </div>
    );
  }

  const p = profile.data;
  const seo = settings.data;

  return (
    <>
      {seo && (
        <>
          <title>{seo.seo_title}</title>
          <meta name="description" content={seo.seo_description} />
          <meta property="og:title" content={seo.og_title} />
          <meta property="og:description" content={seo.og_description} />
          {seo.keywords && <meta name="keywords" content={seo.keywords} />}
          {seo.og_image && <meta property="og:image" content={seo.og_image} />}
        </>
      )}
      <SiteNav
        name={p.name}
        role={p.headline.split("•")[0]?.trim() || "Portfolio"}
        logoUrl={p.logo_url}
        monogram={p.monogram}
      />

      <main>
        <Hero profile={p} />
        <About profile={p} />
        <ExperienceSection items={experiences.data ?? []} />
        <EventsSection items={experiences.data ?? []} />
        <AmbassadorSection items={ambassadors.data ?? []} />
        <DigitalOps steps={caseSteps.data ?? []} skills={skills.data ?? []} />
        <ProjectsSection items={projects.data ?? []} />
        <CommunitySection items={community.data ?? []} />
        <SkillsSection items={skills.data ?? []} />
        <RecommendationsSection items={recommendations.data ?? []} />
        <ContactSection profile={p} social={social.data ?? []} />
      </main>
      <SiteFooter profile={p} />
      <PageviewTracker />
    </>
  );
}
