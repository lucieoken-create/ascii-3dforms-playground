import { Artifact } from "@/app/components/Artifact";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function getParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function Home({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  return (
    <Artifact
      initialModelParam={getParam(params.model)}
      initialColorParam={getParam(params.color)}
      initialBackgroundParam={getParam(params.background)}
    />
  );
}
