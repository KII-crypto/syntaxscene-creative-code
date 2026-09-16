import {
  ProviderNotConfiguredError,
  type ImageRequest,
  type ImageResult,
  type ProviderStatus,
} from "./types";

/**
 * Image generation service adapter.
 *
 * Independent of Lovable AI and Lovable credits. Point it at your own
 * model endpoint by setting these environment variables:
 *
 *   IMAGE_API_URL   - full URL of your image generation endpoint
 *   IMAGE_API_KEY   - optional bearer token for that endpoint
 *
 * Expected endpoint contract (easy to adapt inside this one file):
 *   POST { prompt: string }
 *   ->   { image: "<data url | https url | raw base64>" }
 */

export function getImageProviderStatus(): ProviderStatus {
  const url = process.env["IMAGE_API_URL"];
  return {
    name: "Image service",
    configured: Boolean(url),
    message: url
      ? "An independent image model is connected."
      : "No image model is connected yet. Set IMAGE_API_URL to your own model endpoint.",
  };
}

export async function generateImage(req: ImageRequest): Promise<ImageResult> {
  const url = process.env["IMAGE_API_URL"];
  if (!url) {
    throw new ProviderNotConfiguredError(
      "No image model is connected yet. Connect your own image generation service to start creating.",
    );
  }

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const key = process.env["IMAGE_API_KEY"];
  if (key) headers["Authorization"] = `Bearer ${key}`;

  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({ prompt: req.prompt }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(detail.slice(0, 300) || `Image service failed (${res.status}).`);
  }

  const data = (await res.json()) as { image?: string; url?: string; b64_json?: string };
  const raw = data.image ?? data.url ?? data.b64_json;
  if (!raw) throw new Error("The image service returned no image.");

  return { url: raw.startsWith("data:") || raw.startsWith("http") ? raw : `data:image/png;base64,${raw}` };
}
