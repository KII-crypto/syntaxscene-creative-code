import { describeHfError, toBase64, toDataUrl } from "./image-provider.server";
import {
  ProviderNotConfiguredError,
  type ProviderStatus,
  type VideoRequest,
  type VideoResult,
} from "./types";

/**
 * Image-to-video service adapter.
 *
 * Default backend: Hugging Face Inference (open-source models).
 * Independent of Lovable AI and Lovable credits.
 *
 * Environment variables:
 *   HUGGINGFACE_API_KEY - Hugging Face access token (hf_...)
 *   VIDEO_MODEL_ID      - optional, defaults to Lightricks/LTX-Video
 *   VIDEO_API_URL       - optional, full URL of a completely custom endpoint
 *   VIDEO_API_KEY       - optional bearer token for that custom endpoint
 */

const DEFAULT_MODEL = "Lightricks/LTX-Video";

function hfModel() {
  return process.env["VIDEO_MODEL_ID"] || DEFAULT_MODEL;
}

export function getVideoProviderStatus(): ProviderStatus {
  const custom = process.env["VIDEO_API_URL"];
  const hf = process.env["HUGGINGFACE_API_KEY"];
  return {
    name: "Animation service",
    configured: Boolean(custom || hf),
    message: custom
      ? "A custom animation model endpoint is connected."
      : hf
        ? `Connected to the open-source model ${hfModel()} on Hugging Face.`
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

  const base64 = req.image.includes(",") ? req.image.slice(req.image.indexOf(",") + 1) : req.image;

  const res = await fetch(`https://router.huggingface.co/hf-inference/models/${hfModel()}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "video/mp4",
    },
    body: JSON.stringify({
      inputs: base64,
      parameters: { prompt: req.prompt },
      options: { wait_for_model: true },
    }),
  });

  if (!res.ok) {
    throw new Error(await describeHfError(res));
  }

  const type = res.headers.get("content-type") ?? "";
  if (type.includes("application/json")) {
    const data = (await res.json()) as { error?: string; video?: string; url?: string };
    const raw = data.video ?? data.url;
    if (raw) return { url: toDataUrl(raw, "video/mp4") };
    throw new Error(data.error ?? "The animation service returned no video.");
  }

  const bytes = new Uint8Array(await res.arrayBuffer());
  if (bytes.byteLength === 0) throw new Error("The animation service returned no video.");
  return { url: `data:${type || "video/mp4"};base64,${toBase64(bytes)}` };
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
