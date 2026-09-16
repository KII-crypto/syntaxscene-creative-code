import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { PageHeading, StudioShell } from "@/components/StudioShell";
import { ActionButton, LoadingBar, Notice, Panel, PreviewFrame } from "@/components/StudioUI";
import { saveCreation } from "@/lib/creations";

const title = "Create Image — SyntaxScene by KII";
const description =
  "Describe a scene and generate an image in the SyntaxScene by KII creative studio, then download it.";

export const Route = createFileRoute("/create")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: CreateImage,
});

function CreateImage() {
  const [prompt, setPrompt] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    if (!prompt.trim()) {
      setError("Describe the scene you want first.");
      return;
    }
    setBusy(true);
    setError(null);
    setImage(null);
    try {
      const res = await fetch("/api/generate/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) throw new Error(data.error ?? "Generation failed.");
      setImage(data.url);
      saveCreation({ kind: "image", prompt, url: data.url });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  function reset() {
    setPrompt("");
    setImage(null);
    setError(null);
  }

  return (
    <StudioShell>
      <div className="mx-auto max-w-6xl px-5 py-16">
        <PageHeading
          title="Create Image"
          lead="Write what you see in your head. The more detail you give — subject, mood, lighting, style — the closer the result."
        />

        <div className="grid gap-6 lg:grid-cols-2">
          <Panel>
            <label htmlFor="prompt" className="mb-2 block text-sm font-medium">
              Your prompt
            </label>
            <textarea
              id="prompt"
              rows={8}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="A lone figure on a neon-lit rooftop at night, rain on the concrete, cinematic blue light"
              className="w-full resize-y rounded-xl bg-surface-deep p-4 text-sm leading-relaxed text-body-text outline-none ring-primary/60 focus:ring-2"
            />

            <div className="mt-5 flex flex-wrap gap-3">
              <ActionButton onClick={generate} disabled={busy}>
                {busy ? "Generating…" : "Generate Image"}
              </ActionButton>
              <ActionButton variant="ghost" onClick={reset} disabled={busy}>
                Clear
              </ActionButton>
            </div>

            {busy && <LoadingBar label="Creating your image…" />}
            {error && <Notice tone="error">{error}</Notice>}
          </Panel>

          <Panel>
            <h2 className="mb-3 text-sm font-medium">Preview</h2>
            <PreviewFrame>
              {image ? (
                <img
                  src={image}
                  alt={prompt || "Generated image"}
                  className="max-h-[440px] w-full rounded-lg object-contain"
                />
              ) : (
                <span>Your generated image will appear here.</span>
              )}
            </PreviewFrame>

            {image && (
              <a
                href={image}
                download="syntaxscene-image.png"
                className="mt-5 inline-flex rounded-xl bg-primary px-5 py-3 text-sm text-primary-foreground transition-colors hover:bg-primary-hover"
              >
                Download image
              </a>
            )}
          </Panel>
        </div>
      </div>
    </StudioShell>
  );
}
