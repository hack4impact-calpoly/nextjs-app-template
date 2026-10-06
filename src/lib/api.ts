import type { Movie } from "@/types/movie";
import type { MenuItem } from "@/types/menuItem";

async function getCollection<T>(url: string, signal?: AbortSignal): Promise<T[]> {
  const response = await fetch(url, { cache: "no-store", signal });
  if (!response.ok) {
    throw new Error("Unable to load data. Please try again.");
  }
  const data: unknown = await response.json();
  if (!Array.isArray(data)) {
    throw new Error("The server returned an unexpected response.");
  }
  return data as T[];
}

export function getMovies(signal?: AbortSignal): Promise<Movie[]> {
  return getCollection<Movie>("/api/movies", signal);
}

export function getUpcomingMovies(signal?: AbortSignal): Promise<Movie[]> {
  return getCollection<Movie>("/api/upcomingMovies", signal);
}

export function getMenuItem(signal?: AbortSignal): Promise<MenuItem[]> {
  return getCollection<MenuItem>("/api/menuItems", signal);
}
