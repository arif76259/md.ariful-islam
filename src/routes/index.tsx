import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { queries } from "@/lib/cms";
import { getPublicSeo } from "@/lib/team.functions";
import { SiteNav } from "@/components/site/SiteNav";
import { PageviewTracker } from "@/components/site/PageviewTracker";
import { PortfolioAssistant } from "@/components/site/PortfolioAssistant";
import { RecommendationsSection } from "@/components/site/Recommendations";
import { InsightsSection } from "@/components/site/Insights";
import { ContactHub } from "@/components/site/ContactHub";
import {
  About,
  AmbassadorSection,
  CommunitySection,
  EducationSection,
  DigitalOps,
  EventsSection,
  ExperienceSection,
  Hero,
  ProjectsSection,
  SiteFooter,
  SkillsSection,
} from "@/components/site/Sections";


const DEF_TITLE = "Md. Ariful Islam | BBA Student & Student Leader";
const DEF_DESC =
  "BBA student at Army IBA Sylhet. Student leader, event and project coordinator working across leadership, events, ambassador programs and digital operations.";

export const Route = createFileRoute("/")({
  loader: () => getPublicSeo(),
  head: ({ loaderData }) => {
    const s = loaderData;
    const title = s?.seo_title || DEF_TITLE;
    const desc = s?.seo_description || DEF_DESC;
    const ogTitle = s?.og_title || title;
    const ogDesc = s?.og_description || desc;
    const meta: Array<Record<string, string>> = [
      { title },
      { name: "description", content: desc },
      { property: "og:title", content: ogTitle },
      { property: "og:description", content: ogDesc },
      { property: "og:type", content: "profile" },
      { name: "twitter:card", content: s?.image ? "summary_large_image" : "summary" },
      { name: "twitter:title", content: ogTitle },
      { name: "twitter:description", content: ogDesc },
    ];
    if (s?.keywords) meta.push({ name: "keywords", content: s.keywords });
    if (s?.image) {
      meta.push({ property: "og:image", content: s.image });
      meta.push({ name: "twitter:image", content: s.image });
    }
    return { meta };
  },
  component: Index,
});

function Index() {
  const profile = useQuery(queries.profile);
  const experiences = useQuery(queries.experiences);
  const education = useQuery(queries.education);
  const ambassadors = useQuery(queries.ambassadors);
  const projects = useQuery(queries.projects);
  const skills = useQuery(queries.skills);
  const community = useQuery(queries.community);
  const caseSteps = useQuery(queries.caseSteps);
  const social = useQuery(queries.social);
  const settings = useQuery(queries.settings);
  const recommendations = useQuery(queries.recommendations);
  const articles = useQuery(queries.articles);

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
        <EducationSection items={education.data ?? []} />
        <ExperienceSection items={experiences.data ?? []} />
        <EventsSection items={experiences.data ?? []} />
        <AmbassadorSection items={ambassadors.data ?? []} />
        <DigitalOps steps={caseSteps.data ?? []} skills={skills.data ?? []} />
        <ProjectsSection items={projects.data ?? []} />
        <CommunitySection items={community.data ?? []} />
        <InsightsSection items={articles.data ?? []} />
        <SkillsSection items={skills.data ?? []} />
        <RecommendationsSection items={recommendations.data ?? []} />
        <ContactHub profile={p} social={social.data ?? []} />
      </main>
      <SiteFooter profile={p} social={social.data ?? []} />

      <PageviewTracker />
      <PortfolioAssistant />
    </>
  );
}
