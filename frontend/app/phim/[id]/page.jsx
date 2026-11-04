import MovieDetailClient from './MovieDetailClient';
import { getMovieById } from '@/services/movieApi.server';

export const revalidate = 60;

export default async function Page({ params }) {
  const { id } = await params;
  const movie = await getMovieById(id).catch(() => null);

  return <MovieDetailClient movie={movie} />;
}
