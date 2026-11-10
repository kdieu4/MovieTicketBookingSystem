import MovieDetailClient from './MovieDetailClient';
import { getMovieById, getMovieReviews } from '@/services/movieApi.server';

export const revalidate = 60;

export default async function Page({ params }) {
  const { id } = await params;
  const [movie, reviews] = await Promise.all([
    getMovieById(id).catch(() => null),
    getMovieReviews(id),
  ]);

  return <MovieDetailClient movie={movie} reviews={reviews} />;
}
