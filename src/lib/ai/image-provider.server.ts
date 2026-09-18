import {
  ProviderNotConfiguredError,
  type ImageRequest,
  type ImageResult,
  type ProviderStatus,
} from "./types";

/**
 * Image generation service adapter.
 *
 * Default backend: Pollinations (open, free, no account and no credits).
 * Independent of Lovable AI and Lovable credits.
 *
 * Environment variables:
 *   IMAGE_PROVIDER      - "pollinations" (default) or "huggingface"
 *   IMAGE_MODEL_ID      - optional model id for the selected provider
 *   HUGGINGFACE_API_KEY - Hugging Face access token (hf_...), huggingface mode only
 *   IMAGE_ROUTER_URL    - optional, overrides the Hugging Face route
 *   IMAGE_API_URL       - optional, full URL of a completely custom endpoint
 *   IMAGE_API_KEY       - optional bearer token for that custom endpoint
 */

const HF_MODEL = "black-forest-labs/FLUX.1-schnell";
const HF_ROUTER = "https://router.huggingface.co/nscale/v1/images/generations";
const FREE_ENDPOINT = "https://image.pollinations.ai/prompt/";

function provider() {
  return (process.env["IMAGE_PROVIDER"] || "pollinations").toLowerCase();
}

export function getImageProviderStatus(): ProviderStatus {
  const custom = process.env["IMAGE_API_URL"];
  if (custom) {
    return {
      name: "Image service",
      configured: true,
      message: "A custom image model endpoint is connected.",
    };
  }
  if (provider() === "huggingface") {
    const hf = Boolean(process.env["HUGGINGFACE_API_KEY"]);
    return {
      name: "Image service",
      configured: hf,
      message: hf
        ? `Connected to the open model ${process.env["IMAGE_MODEL_ID"] || HF_MODEL} on Hugging Face.`
        : "Hugging Face mode is selected but no access token is set.",
    };
  }
  return {
    name: "Image service",
    configured: true,
    message: "Connected to a free open image model. No account and no credits needed.",
  };
}

export async function generateImage(req: ImageRequest): Promise<ImageResult> {
  const custom = process.env["IMAGE_API_URL"];
  if (custom) return generateViaCustom(custom, req);
  if (provider() === "huggingface") return generateViaHuggingFace(req);
  return generateFree(req);
}

/** Free, keyless open model. Returns raw image bytes. */
async function generateFree(req: ImageRequest): Promise<ImageResult> {
  const params = new URLSearchParams({
    width: "1024",
    height: "1024",
    nologo: "true",
    safe: "false",
    seed: String(Math.floor(Math.random() * 1_000_000)),
  });
  const model = process.env["IMAGE_MODEL_ID"];
  if (model) params.set("model", model);

  const res = await fetch(
    `${FREE_ENDPOINT}${encodeURIComponent(req.prompt)}?${params.toString()}`,
    { headers: { Accept: "image/*" } },
  );

  if (!res.ok) {
    if (res.status === 429) {
      throw new Error("The free image model is busy right now. Please try again in a moment.");
    }
    const detail = await res.text().catch(() => "");
    throw new Error(detail.slice(0, 200) || `Image service failed (${res.status}).`);
  }

  const type = res.headers.get("content-type") ?? "";
  if (!type.startsWith("image/")) {
    const detail = await res.text().catch(() => "");
    throw new Error(detail.slice(0, 200) || "The image service returned no image.");
  }

  const bytes = new Uint8Array(await res.arrayBuffer());
  if (bytes.byteLength === 0) throw new Error("The image service returned no image.");
  return { url: `data:${type};base64,${toBase64(bytes)}` };
}

async function generateViaHuggingFace(req: ImageRequest): Promise<ImageResult> {
  const token = process.env["HUGGINGFACE_API_KEY"];
  if (!token) {
    throw new ProviderNotConfiguredError(
      "Hugging Face mode is selected but no access token is connected.",
    );
  }

  const res = await fetch(process.env["IMAGE_ROUTER_URL"] || HF_ROUTER, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: process.env["IMAGE_MODEL_ID"] || HF_MODEL,
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
