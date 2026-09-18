/**
 * Free in-browser motion renderer.
 *
 * Turns a still picture into a real moving clip using canvas animation and
 * the browser's own recorder. It runs entirely on the viewer's device, so it
 * costs nothing, needs no account, and has no usage limits.
 */

export type MotionStyle = "push-in" | "pull-out" | "pan-left" | "pan-right" | "drift";

export type MotionOptions = {
  image: string;
  style: MotionStyle;
  seconds: number;
  onProgress?: (fraction: number) => void;
};

export type MotionClip = {
  url: string;
  mimeType: string;
  extension: string;
  size: number;
};

const MAX_SIDE = 720;
const FPS = 30;

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("That picture could not be read."));
    img.src = src;
  });
}

function pickMimeType() {
  const candidates = [
    "video/mp4;codecs=avc1.42E01E",
    "video/mp4",
    "video/webm;codecs=vp9",
    "video/webm;codecs=vp8",
    "video/webm",
  ];
  for (const type of candidates) {
    if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(type)) return type;
  }
  return "";
}

/** Eased 0..1 so the motion starts and ends gently. */
function ease(t: number) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

export async function renderMotionClip(options: MotionOptions): Promise<MotionClip> {
  if (typeof MediaRecorder === "undefined") {
    throw new Error("This browser cannot record video. Try Chrome, Edge or Safari.");
  }

  const img = await loadImage(options.image);
  const scale = Math.min(1, MAX_SIDE / Math.max(img.width, img.height));
  const width = Math.max(2, Math.round((img.width * scale) / 2) * 2);
  const height = Math.max(2, Math.round((img.height * scale) / 2) * 2);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("This browser cannot render the clip.");

  const mimeType = pickMimeType();
  const stream = canvas.captureStream(FPS);
  const recorder = new MediaRecorder(stream, {
    ...(mimeType ? { mimeType } : {}),
    videoBitsPerSecond: 2_500_000,
  });
  const chunks: BlobPart[] = [];
  recorder.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data);
  };
  const finished = new Promise<void>((resolve) => {
    recorder.onstop = () => resolve();
  });

  const totalFrames = Math.round(options.seconds * FPS);
  const frameMs = 1000 / FPS;

  recorder.start();

  for (let frame = 0; frame < totalFrames; frame++) {
    const t = ease(frame / Math.max(1, totalFrames - 1));
    drawFrame(ctx, img, width, height, options.style, t);
    options.onProgress?.(frame / totalFrames);
    await new Promise((r) => setTimeout(r, frameMs));
  }

  recorder.stop();
  stream.getTracks().forEach((track) => track.stop());
  await finished;
  options.onProgress?.(1);

  const type = recorder.mimeType || mimeType || "video/webm";
  const blob = new Blob(chunks, { type });
  if (blob.size === 0) throw new Error("The clip came out empty. Please try again.");

  return {
    url: await blobToDataUrl(blob),
    mimeType: type,
    extension: type.includes("mp4") ? "mp4" : "webm",
    size: blob.size,
  };
}

function drawFrame(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  width: number,
  height: number,
  style: MotionStyle,
  t: number,
) {
  // Zoom and offset ranges per style, expressed in fractions of the frame.
  let zoom = 1.08;
  let dx = 0;
  let dy = 0;

  switch (style) {
    case "push-in":
      zoom = 1 + 0.16 * t;
      break;
    case "pull-out":
      zoom = 1.18 - 0.16 * t;
      break;
    case "pan-left":
      zoom = 1.14;
      dx = (0.5 - t) * 0.1 * width;
      break;
    case "pan-right":
      zoom = 1.14;
      dx = (t - 0.5) * 0.1 * width;
      break;
    case "drift":
      zoom = 1.12 + 0.03 * Math.sin(t * Math.PI);
      dx = Math.sin(t * Math.PI * 1.2) * 0.035 * width;
      dy = Math.cos(t * Math.PI * 0.9) * 0.025 * height;
      break;
  }

  const drawW = width * zoom;
  const drawH = height * zoom;
  const x = (width - drawW) / 2 + dx;
  const y = (height - drawH) / 2 + dy;

  ctx.fillStyle = "#05070d";
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(img, x, y, drawW, drawH);

  // Soft cinematic vignette that breathes slightly with the motion.
  const gradient = ctx.createRadialGradient(
    width / 2,
    height / 2,
    Math.min(width, height) * 0.35,
    width / 2,
    height / 2,
    Math.max(width, height) * 0.75,
  );
  gradient.addColorStop(0, "rgba(0,0,0,0)");
  gradient.addColorStop(1, `rgba(0,0,0,${0.22 + 0.06 * Math.sin(t * Math.PI)})`);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
}

function blobToDataUrl(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("The clip could not be prepared for download."));
    reader.readAsDataURL(blob);
  });
}
