import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface SearchResult {
  id: number;
  title?: string;
  name?: string;
  media_type: 'movie' | 'tv';
  release_date?: string;
  first_air_date?: string;
  poster_path?: string;
  overview?: string;
}

interface TVDetails {
  number_of_episodes: number;
  number_of_seasons: number;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const tmdbApiKey = Deno.env.get("TMDB_API_KEY");

    if (!tmdbApiKey) {
      return new Response(
        JSON.stringify({
          error: "TMDB API key not configured. Please set TMDB_API_KEY in your Supabase project secrets."
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const url = new URL(req.url);
    const query = url.searchParams.get("query");
    const mediaId = url.searchParams.get("id");
    const mediaType = url.searchParams.get("type");

    if (mediaId && mediaType) {
      if (mediaType === "tv") {
        const detailsResponse = await fetch(
          `https://api.themoviedb.org/3/tv/${mediaId}?api_key=${tmdbApiKey}`
        );

        if (!detailsResponse.ok) {
          throw new Error("Failed to fetch TV show details");
        }

        const details: TVDetails = await detailsResponse.json();

        return new Response(
          JSON.stringify({
            total_episodes: details.number_of_episodes,
            total_seasons: details.number_of_seasons,
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      } else {
        return new Response(
          JSON.stringify({
            total_episodes: 0,
            total_seasons: 0,
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
    }

    if (!query) {
      return new Response(
        JSON.stringify({ error: "Query parameter is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const searchResponse = await fetch(
      `https://api.themoviedb.org/3/search/multi?api_key=${tmdbApiKey}&query=${encodeURIComponent(query)}`
    );

    if (!searchResponse.ok) {
      throw new Error("Failed to search TMDB");
    }

    const searchData = await searchResponse.json();

    const results = searchData.results
      .filter((item: SearchResult) => item.media_type === 'movie' || item.media_type === 'tv')
      .map((item: SearchResult) => ({
        id: item.id,
        title: item.title || item.name,
        media_type: item.media_type,
        year: item.release_date
          ? new Date(item.release_date).getFullYear()
          : item.first_air_date
          ? new Date(item.first_air_date).getFullYear()
          : null,
        poster_path: item.poster_path
          ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
          : null,
        overview: item.overview,
      }));

    return new Response(
      JSON.stringify({ results }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
