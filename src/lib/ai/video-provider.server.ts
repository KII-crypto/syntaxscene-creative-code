import { describeHfError, toDataUrl } from "./image-provider.server";
import {
  ProviderNotConfiguredError,
  type ProviderStatus,
  type VideoRequest,
  type VideoResult,
} from "./types";

/**
 * Image-to-video service adapter.
 *
 * Default backend: Hugging Face router (open Wan 2.2 image-to-video model,
 * your own HF account). Independent of Lovable AI and Lovable credits.
 *
 * Environment variables:
 *   HUGGINGFACE_API_KEY - Hugging Face access token (hf_...)
 *   VIDEO_ROUTER_URL    - optional, overrides the default router route
 *   VIDEO_API_URL       - optional, full URL of a completely custom endpoint
 *   VIDEO_API_KEY       - optional bearer token for that custom endpoint
 */

const DEFAULT_ROUTER = "https://router.huggingface.co/fal-ai/fal-ai/wan/v2.2-a14b/image-to-video";
const DEFAULT_MODEL_LABEL = "Wan 2.2 image-to-video";

export function getVideoProviderStatus(): ProviderStatus {
  const custom = process.env["VIDEO_API_URL"];
  const hf = process.env["HUGGINGFACE_API_KEY"];
  return {
    name: "Animation service",
    configured: Boolean(custom || hf),
    message: custom
      ? "A custom animation model endpoint is connected."
      : hf
        ? `Connected to the open model ${DEFAULT_MODEL_LABEL} on Hugging Face.`
        : "No animation model is connected yet. Add a Hugging Face access token or set VIDEO_API_URL.",
  };
}

export async function generateVideo(req: VideoRequest): Promise<VideoResult> {
  const custom = process.env["VIDEO_API_URL"];
  if (custom) return generateViaCustom(custom, req);

  const token = process.env["HUGGINGFACE_API_KEY"];
  if (!token) {
    throw new ProviderNotConfiguredError(
      "No animation model is connected yet. Connect your own image-to-video service to start animating.",
    );
  }

  const res = await fetch(process.env["VIDEO_ROUTER_URL"] || DEFAULT_ROUTER, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt: req.prompt,
      image_url: req.image,
    }),
  });

  if (!res.ok) throw new Error(await describeHfError(res));

  const data = (await res.json()) as {
    video?: { url?: string } | string;
    url?: string;
    error?: string;
  };
  const raw = typeof data.video === "string" ? data.video : (data.video?.url ?? data.url);
  if (!raw) throw new Error(data.error ?? "The animation service returned no video.");
  return { url: toDataUrl(raw, "video/mp4") };
}

async function generateViaCustom(url: string, req: VideoRequest): Promise<VideoResult> {
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
  return { url: toDataUrl(raw, "video/mp4") };
}
