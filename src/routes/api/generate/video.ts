import { createFileRoute } from "@tanstack/react-router";

import { generateVideo } from "@/lib/ai/video-provider.server";
import { ProviderNotConfiguredError } from "@/lib/ai/types";

export const Route = createFileRoute("/api/generate/video")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json().catch(() => ({}))) as {
          prompt?: string;
          image?: string;
        };
        const prompt = (body.prompt ?? "").trim();
        const image = body.image ?? "";
        if (!image.startsWith("data:image/")) {
          return json({ error: "Please upload an image first." }, 400);
        }
        if (!prompt) {
          return json({ error: "Please describe the motion you want." }, 400);
        }

        try {
          const result = await generateVideo({ prompt, image });
          return json(result, 200);
        } catch (error) {
          if (error instanceof ProviderNotConfiguredError) {
            return json({ error: error.message, notConnected: true }, 503);
          }
          return json({ error: error instanceof Error ? error.message : "Animation failed." }, 502);
        }
      },
    },
  },
});

function json(data: unknown, status: number) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
