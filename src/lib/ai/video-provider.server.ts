import {
  ProviderNotConfiguredError,
  type ProviderStatus,
  type VideoRequest,
  type VideoResult,
} from "./types";

/**
 * Image-to-video service adapter.
 *
 * Independent of Lovable AI and Lovable credits. Point it at your own
 * model endpoint by setting these environment variables:
 *
 *   VIDEO_API_URL   - full URL of your image-to-video endpoint
 *   VIDEO_API_KEY   - optional bearer token for that endpoint
 *
 * Expected endpoint contract (easy to adapt inside this one file):
 *   POST { prompt: string, image: "<data url>" }
 *   ->   { video: "<data url | https url | raw base64>" }
 */

export function getVideoProviderStatus(): ProviderStatus {
  const url = process.env["VIDEO_API_URL"];
  return {
    name: "Animation service",
    configured: Boolean(url),
    message: url
      ? "An independent animation model is connected."
      : "No animation model is connected yet. Set VIDEO_API_URL to your own model endpoint.",
  };
}

export async function generateVideo(req: VideoRequest): Promise<VideoResult> {
  const url = process.env["VIDEO_API_URL"];
  if (!url) {
    throw new ProviderNotConfiguredError(
      "No animation model is connected yet. Connect your own image-to-video service to start animating.",
    );
  }

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const key = process.env["VIDEO_API_KEY"];
  if (key) headers["Authorization"] = `Bearer ${key}`;

  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({ prompt: req.prompt, image: req.image }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(detail.slice(0, 300) || `Animation service failed (${res.status}).`);
  }

  const data = (await res.json()) as { video?: string; url?: string };
  const raw = data.video ?? data.url;
  if (!raw) throw new Error("The animation service returned no video.");

  return { url: raw.startsWith("data:") || raw.startsWith("http") ? raw : `data:video/mp4;base64,${raw}` };
}
