import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/video/create")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const key = process.env["LOVABLE_API_KEY"];
        if (!key) return new Response(JSON.stringify({ error: "Missing API key" }), { status: 500 });

        const body = (await request.json()) as {
          prompt?: string;
          image?: string;
          seconds?: string;
          size?: string;
        };
        const prompt = (body.prompt ?? "").trim();
        if (!prompt) return new Response(JSON.stringify({ error: "Prompt is required" }), { status: 400 });

        const payload: Record<string, unknown> = {
          model: "google/veo-3.1-lite",
          prompt,
          seconds: body.seconds === "4" || body.seconds === "6" ? body.seconds : "8",
          size: body.size === "720x1280" ? "720x1280" : "1280x720",
        };
        if (body.image?.startsWith("data:image/")) payload["input_reference"] = body.image;

        const res = await fetch("https://ai.gateway.lovable.dev/v1/videos", {
          method: "POST",
          headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const text = await res.text();
        if (!res.ok) {
          let message = "Video generation failed";
          try {
            message = (JSON.parse(text) as { message?: string }).message ?? message;
          } catch {
            /* keep default */
          }
          return new Response(JSON.stringify({ error: message }), {
            status: res.status,
            headers: { "Content-Type": "application/json" },
          });
        }
        return new Response(text, { headers: { "Content-Type": "application/json" } });
      },
    },
  },
});