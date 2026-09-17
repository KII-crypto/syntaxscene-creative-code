import {
  ProviderNotConfiguredError,
  type ImageRequest,
  type ImageResult,
  type ProviderStatus,
} from "./types";

/**
 * Image generation service adapter.
 *
 * Default backend: Hugging Face router (open-source models, your own HF account).
 * Independent of Lovable AI and Lovable credits.
 *
 * Environment variables:
 *   HUGGINGFACE_API_KEY - Hugging Face access token (hf_...)
 *   IMAGE_MODEL_ID      - optional, defaults to black-forest-labs/FLUX.1-schnell
 *   IMAGE_ROUTER_URL    - optional, defaults to the nscale OpenAI-compatible route
 *   IMAGE_API_URL       - optional, full URL of a completely custom endpoint
 *   IMAGE_API_KEY       - optional bearer token for that custom endpoint
 */

const DEFAULT_MODEL = "black-forest-labs/FLUX.1-schnell";
const DEFAULT_ROUTER = "https://router.huggingface.co/nscale/v1/images/generations";

function model() {
  return process.env["IMAGE_MODEL_ID"] || DEFAULT_MODEL;
}

export function getImageProviderStatus(): ProviderStatus {
  const custom = process.env["IMAGE_API_URL"];
  const hf = process.env["HUGGINGFACE_API_KEY"];
  return {
    name: "Image service",
    configured: Boolean(custom || hf),
    message: custom
      ? "A custom image model endpoint is connected."
      : hf
        ? `Connected to the open model ${model()} on Hugging Face.`
        : "No image model is connected yet. Add a Hugging Face access token or set IMAGE_API_URL.",
  };
}

export async function generateImage(req: ImageRequest): Promise<ImageResult> {
  const custom = process.env["IMAGE_API_URL"];
  if (custom) return generateViaCustom(custom, req);

  const token = process.env["HUGGINGFACE_API_KEY"];
  if (!token) {
    throw new ProviderNotConfiguredError(
      "No image model is connected yet. Connect your own image generation service to start creating.",
    );
  }

  const res = await fetch(process.env["IMAGE_ROUTER_URL"] || DEFAULT_ROUTER, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: model(),
      prompt: req.prompt,
      response_format: "b64_json",
    }),
  });

  if (!res.ok) throw new Error(await describeHfError(res));

  const data = (await res.json()) as {
    data?: Array<{ b64_json?: string; url?: string }>;
    error?: string;
  };
  const first = data.data?.[0];
  const raw = first?.b64_json ?? first?.url;
  if (!raw) throw new Error(data.error ?? "The image service returned no image.");
  return { url: toDataUrl(raw, "image/png") };
}

async function generateViaCustom(url: string, req: ImageRequest): Promise<ImageResult> {
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
  return { url: toDataUrl(raw, "image/png") };
}

export function toDataUrl(raw: string, mime: string) {
  return raw.startsWith("data:") || raw.startsWith("http") ? raw : `data:${mime};base64,${raw}`;
}

export function toBase64(bytes: Uint8Array) {
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

export async function describeHfError(res: Response) {
  const text = await res.text().catch(() => "");
  let message = text.slice(0, 300);
  try {
    const parsed = JSON.parse(text) as { error?: string | string[]; message?: string };
    const err = parsed.error ?? parsed.message;
    if (err) message = Array.isArray(err) ? err.join(" ") : err;
  } catch {
    /* keep raw text */
  }
  if (res.status === 401 || res.status === 403) {
    return "Hugging Face rejected the access token. Check that it is valid and allows inference.";
  }
  if (res.status === 402) {
    return "Your Hugging Face account is out of included inference usage for this month.";
  }
  if (res.status === 429) {
    return "Hugging Face is rate limiting right now. Please wait a moment and try again.";
  }
  if (res.status === 503) {
    return "The model is warming up on Hugging Face. Try again in about a minute.";
  }
  return message || `Service failed (${res.status}).`;
}
