import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import ReactMarkdown from "react-markdown";
import Loading from "../atoms/Loading";

const fetchReleaseNotes = async (language: string) => {
  const res = await fetch(`/data/pages/release_${language}.md`);
  if (!res.ok) throw new Error(`Failed to load release notes (${res.status})`);
  return res.text();
};

function ReleasePage() {
  const { i18n } = useTranslation();
  const language = i18n.resolvedLanguage ?? "en";
  const { isPending, data } = useQuery({
    queryKey: ["releaseNotes", language],
    queryFn: () => fetchReleaseNotes(language),
    throwOnError: true,
  });

  if (isPending) return <Loading />;

  return (
    <article className="mx-auto max-w-3xl space-y-3 px-4 py-6 text-foreground [&_h1]:text-2xl [&_h1]:font-bold [&_h2]:mt-8 [&_h2]:border-b [&_h2]:pb-1 [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:mt-4 [&_h3]:font-semibold [&_li]:ml-5 [&_li]:list-disc [&_li]:text-sm [&_li]:leading-6 [&_p]:text-sm [&_p]:text-muted-foreground">
      <ReactMarkdown>{data}</ReactMarkdown>
    </article>
  );
}

export default ReleasePage;
