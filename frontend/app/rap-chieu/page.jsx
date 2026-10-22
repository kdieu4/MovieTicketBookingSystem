import CinemasPage from './CinemasPageClient';
import { getCinemas } from '@/services/movieApi.server';

export const revalidate = 60;

export default async function Page() {
  const cinemas = await getCinemas().catch(() => null);

  return <CinemasPage cinemas={cinemas ?? []} error={cinemas === null} />;
}
