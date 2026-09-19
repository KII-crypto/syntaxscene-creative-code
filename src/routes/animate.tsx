import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";

import { PageHeading, StudioShell } from "@/components/StudioShell";
import { ActionButton, LoadingBar, Notice, Panel, PreviewFrame } from "@/components/StudioUI";
import { saveCreation } from "@/lib/creations";
import { renderMotionClip, type MotionStyle } from "@/lib/motion";

const title = "Animate Image — SyntaxScene by KII";
const description =
  "Upload an image, describe the motion, and animate it into a short video in the SyntaxScene by KII studio.";

export const Route = createFileRoute("/animate")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: AnimateImage,
});

const STYLES: Array<{ value: MotionStyle; label: string }> = [
  { value: "push-in", label: "Slow push in" },
  { value: "pull-out", label: "Slow pull out" },
  { value: "pan-left", label: "Pan left" },
  { value: "pan-right", label: "Pan right" },
  { value: "drift", label: "Gentle drift" },
];

function AnimateImage() {
  const [mode, setMode] = useState<"free" | "ai">("free");
  const [image, setImage] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState<MotionStyle>("push-in");
  const [seconds, setSeconds] = useState(5);
  const [video, setVideo] = useState<string | null>(null);
  const [extension, setExtension] = useState("mp4");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  function onPick(file: File | undefined) {
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      setError("Please choose an image under 8MB.");
      return;
    }
    setError(null);
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => setImage(String(reader.result));
    reader.readAsDataURL(file);
  }

  async function animate() {
    if (!image) {
      setError("Upload an image first.");
      return;
    }
    if (mode === "ai" && !prompt.trim()) {
      setError("Describe the motion you want.");
      return;
    }
    setBusy(true);
    setError(null);
    setVideo(null);
    setProgress(0);
    try {
      if (mode === "free") {
        const clip = await renderMotionClip({
          image,
          style,
          seconds,
          onProgress: setProgress,
        });
        setVideo(clip.url);
        setExtension(clip.extension);
        saveCreation({
          kind: "video",
          prompt: prompt.trim() || STYLES.find((s) => s.value === style)!.label,
          url: clip.url,
        });
      } else {
        const res = await fetch("/api/generate/video", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt, image }),
        });
        const data = (await res.json()) as { url?: string; error?: string };
        if (!res.ok || !data.url) throw new Error(data.error ?? "Animation failed.");
        setVideo(data.url);
        setExtension("mp4");
        saveCreation({ kind: "video", prompt, url: data.url });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  function reset() {
    setImage(null);
    setFileName("");
    setPrompt("");
    setVideo(null);
    setError(null);
    setProgress(0);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <StudioShell>
      <div className="mx-auto max-w-6xl px-5 py-16">
        <PageHeading
          title="Animate Image"
          lead="Bring a still image to life. Upload it, choose how the scene should move, and get a short clip."
        />

        <div className="grid gap-6 lg:grid-cols-2">
          <Panel>
            <div className="mb-6 flex flex-wrap gap-2 rounded-xl bg-surface-deep p-1">
              <button
                type="button"
                onClick={() => setMode("free")}
                className={`flex-1 rounded-lg px-4 py-2 text-sm transition-colors ${
                  mode === "free" ? "bg-primary text-primary-foreground" : "text-footer-text"
                }`}
              >
                Free motion
              </button>
              <button
                type="button"
                onClick={() => setMode("ai")}
                className={`flex-1 rounded-lg px-4 py-2 text-sm transition-colors ${
                  mode === "ai" ? "bg-primary text-primary-foreground" : "text-footer-text"
                }`}
              >
                AI motion
              </button>
            </div>

            <label className="mb-2 block text-sm font-medium">Your image</label>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex h-[240px] w-full items-center justify-center overflow-hidden rounded-xl border border-dashed border-white/10 bg-surface-deep text-sm text-footer-text transition-colors hover:border-primary"
            >
              {image ? (
                <img src={image} alt="Selected preview" className="h-full w-full object-contain" />
              ) : (
                <span>Tap to upload an image</span>
              )}
            </button>
            <input
              ref={inputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={(e) => onPick(e.target.files?.[0])}
            />
            {fileName && <p className="mt-2 truncate text-xs text-footer-text">{fileName}</p>}

            {mode === "free" ? (
              <>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="style" className="mb-2 block text-sm font-medium">
                      Camera move
                    </label>
                    <select
                      id="style"
                      value={style}
                      onChange={(e) => setStyle(e.target.value as MotionStyle)}
                      className="w-full rounded-xl bg-surface-deep p-3 text-sm text-body-text outline-none ring-primary/60 focus:ring-2"
                    >
                      {STYLES.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="length" className="mb-2 block text-sm font-medium">
                      Length
                    </label>
                    <select
                      id="length"
                      value={seconds}
                      onChange={(e) => setSeconds(Number(e.target.value))}
                      className="w-full rounded-xl bg-surface-deep p-3 text-sm text-body-text outline-none ring-primary/60 focus:ring-2"
                    >
                      {[3, 5, 8, 10].map((s) => (
                        <option key={s} value={s}>
                          {s} seconds
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <p className="mt-3 text-xs text-footer-text">
                  Free motion renders on your own device — no account, no limits. It moves the
                  camera across your picture rather than inventing new frames.
                </p>
              </>
            ) : (
              <>
                <label htmlFor="motion" className="mt-6 mb-2 block text-sm font-medium">
                  Motion prompt
                </label>
                <textarea
                  id="motion"
                  rows={5}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Slow cinematic push-in, gentle wind through the hair, warm golden light"
                  className="w-full resize-y rounded-xl bg-surface-deep p-4 text-sm leading-relaxed text-body-text outline-none ring-primary/60 focus:ring-2"
                />
                <p className="mt-3 text-xs text-footer-text">
                  AI motion invents new frames from your picture. It needs a connected animation
                  service, which is not free.
                </p>
              </>
            )}

            <div className="mt-5 flex flex-wrap gap-3">
              <ActionButton onClick={animate} disabled={busy}>
                {busy ? "Animating…" : "Animate Image"}
              </ActionButton>
              <ActionButton variant="ghost" onClick={reset} disabled={busy}>
                Clear
              </ActionButton>
            </div>

            {busy && (
              <LoadingBar
                label={
                  mode === "free"
                    ? `Rendering your clip… ${Math.round(progress * 100)}%`
                    : "Animating your image…"
                }
              />
            )}
            {error && <Notice tone="error">{error}</Notice>}
          </Panel>

          <Panel>
            <h2 className="mb-3 text-sm font-medium">Preview</h2>
            <PreviewFrame>
              {video ? (
                <video src={video} controls autoPlay loop playsInline className="w-full rounded-lg" />
              ) : (
                <span>Your animated clip will appear here.</span>
              )}
            </PreviewFrame>

            {video && (
              <a
                href={video}
                download={`syntaxscene-video.${extension}`}
                className="mt-5 inline-flex rounded-xl bg-primary px-5 py-3 text-sm text-primary-foreground transition-colors hover:bg-primary-hover"
              >
                Download video
              </a>
            )}
          </Panel>
        </div>
      </div>
    </StudioShell>
  );
}
