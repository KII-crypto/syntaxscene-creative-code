import { createFileRoute } from "@tanstack/react-router";

import { getImageProviderStatus } from "@/lib/ai/image-provider.server";
import { getVideoProviderStatus } from "@/lib/ai/video-provider.server";

export const Route = createFileRoute("/api/generate/status")({
  server: {
    handlers: {
      GET: async () =>
        new Response(
          JSON.stringify({
            image: getImageProviderStatus(),
            video: getVideoProviderStatus(),
          }),
          { headers: { "Content-Type": "application/json" } },
        ),
    },
  },
});
