import { createFileRoute } from "@tanstack/react-router";

import { generateImage } from "@/lib/ai/image-provider.server";
import { ProviderNotConfiguredError } from "@/lib/ai/types";

export const Route = createFileRoute("/api/generate/image")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json().catch(() => ({}))) as { prompt?: string };
        const prompt = (body.prompt ?? "").trim();
        if (!prompt) {
          return json({ error: "Please describe the scene you want." }, 400);
        }

        try {
          const result = await generateImage({ prompt });
          return json(result, 200);
        } catch (error) {
          if (error instanceof ProviderNotConfiguredError) {
            return json({ error: error.message, notConnected: true }, 503);
          }
          return json({ error: error instanceof Error ? error.message : "Generation failed." }, 502);
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
