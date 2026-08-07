import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/video/content")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const key = process.env["LOVABLE_API_KEY"];
        if (!key) return new Response("Missing API key", { status: 500 });

        const id = new URL(request.url).searchParams.get("id");
        if (!id) return new Response("Missing id", { status: 400 });

        const res = await fetch(
          `https://ai.gateway.lovable.dev/v1/videos/${encodeURIComponent(id)}/content`,
          { headers: { Authorization: `Bearer ${key}` } },
        );
        if (!res.ok || !res.body) return new Response("Video not available", { status: res.status });

        return new Response(res.body, {
          headers: {
            "Content-Type": "video/mp4",
            "Cache-Control": "no-store",
          },
        });
      },
    },
  },
});