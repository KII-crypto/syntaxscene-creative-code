import { useRef, useState } from "react";

type Job = { id: string; status: string; progress?: number; error?: { message?: string } };

export function VideoStudio() {
  const [image, setImage] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [prompt, setPrompt] = useState("");
  const [seconds, setSeconds] = useState("8");
  const [size, setSize] = useState("1280x720");
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  function onPick(file: File | undefined) {
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      setError("Please choose a photo under 8MB.");
      return;
    }
    setError(null);
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => setImage(String(reader.result));
    reader.readAsDataURL(file);
  }

  async function generate() {
    if (!prompt.trim()) {
      setError("Describe the motion you want first.");
      return;
    }
    setBusy(true);
    setError(null);
    setVideoUrl(null);
    setStatus("Starting your video…");

    try {
      const res = await fetch("/api/video/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, image, seconds, size }),
      });
      const job = (await res.json()) as Job & { error?: string | { message?: string } };
      if (!res.ok) {
        throw new Error(typeof job.error === "string" ? job.error : "Could not start generation.");
      }

      let current: Job = job;
      while (current.status !== "completed" && current.status !== "failed") {
        setStatus(`Generating… ${current.progress ? `${current.progress}%` : "this takes 1–3 minutes"}`);
        await new Promise((r) => setTimeout(r, 7000));
        const poll = await fetch(`/api/video/status?id=${encodeURIComponent(current.id)}`);
        current = (await poll.json()) as Job;
      }

      if (current.status === "failed") {
        throw new Error(current.error?.message ?? "Generation failed. Try a different photo or prompt.");
      }

      setStatus("Done — your video is ready.");
      setVideoUrl(`/api/video/content?id=${encodeURIComponent(current.id)}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setStatus(null);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto grid max-w-[900px] gap-6 md:grid-cols-2">
      <div className="rounded-[14px] bg-card p-6">
        <label className="mb-2 block text-sm font-medium">Your photo</label>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex h-[220px] w-full items-center justify-center overflow-hidden rounded-[10px] border border-dashed border-primary/50 bg-surface-deep text-sm text-body-text transition-colors hover:border-primary"
        >
          {image ? (
            <img src={image} alt="Selected photo preview" className="h-full w-full object-cover" />
          ) : (
            <span>Tap to upload a photo</span>
          )}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg"
          className="hidden"
          onChange={(e) => onPick(e.target.files?.[0])}
        />
        {fileName && <p className="mt-2 truncate text-xs text-footer-text">{fileName}</p>}
      </div>

      <div className="rounded-[14px] bg-card p-6">
        <label className="mb-2 block text-sm font-medium" htmlFor="prompt">
          Describe the motion
        </label>
        <textarea
          id="prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={4}
          placeholder="Slow cinematic push-in, gentle wind, warm golden light"
          className="w-full rounded-[10px] bg-surface-deep p-3 text-sm text-body-text outline-none ring-primary/60 focus:ring-2"
        />

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs text-footer-text" htmlFor="seconds">
              Length
            </label>
            <select
              id="seconds"
              value={seconds}
              onChange={(e) => setSeconds(e.target.value)}
              className="w-full rounded-[10px] bg-surface-deep p-2 text-sm"
            >
              <option value="4">4 seconds</option>
              <option value="6">6 seconds</option>
              <option value="8">8 seconds</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-footer-text" htmlFor="size">
              Format
            </label>
            <select
              id="size"
              value={size}
              onChange={(e) => setSize(e.target.value)}
              className="w-full rounded-[10px] bg-surface-deep p-2 text-sm"
            >
              <option value="1280x720">Landscape</option>
              <option value="720x1280">Portrait</option>
            </select>
          </div>
        </div>

        <button
          type="button"
          onClick={generate}
          disabled={busy}
          className="mt-5 w-full rounded-[10px] bg-primary px-6 py-3 text-primary-foreground transition-all duration-300 hover:bg-primary-hover disabled:opacity-60"
        >
          {busy ? "Generating…" : "Generate video"}
        </button>

        {status && <p className="mt-3 text-sm text-body-text">{status}</p>}
        {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
      </div>

      {videoUrl && (
        <div className="rounded-[14px] bg-card p-6 md:col-span-2">
          <video src={videoUrl} controls playsInline className="w-full rounded-[10px]" />
          <a
            href={videoUrl}
            download="syntaxscene-video.mp4"
            className="mt-4 inline-block rounded-[10px] bg-primary px-6 py-3 text-primary-foreground transition-colors hover:bg-primary-hover"
          >
            Download MP4
          </a>
          <p className="mt-3 text-xs text-footer-text">
            Save it now — generated videos are only available for a short time.
          </p>
        </div>
      )}
    </div>
  );
}