import { createFileRoute } from "@tanstack/react-router";

import { PageHeading, StudioShell } from "@/components/StudioShell";
import { ActionButton, Panel, PreviewFrame } from "@/components/StudioUI";
import { useCreations } from "@/lib/creations";

const title = "My Creations — SyntaxScene by KII";
const description =
  "Browse, download, and remove the images and videos you made in the SyntaxScene by KII studio.";

export const Route = createFileRoute("/creations")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: Creations,
});

function Creations() {
  const { items, remove, clear } = useCreations();

  return (
    <StudioShell>
      <div className="mx-auto max-w-6xl px-5 py-16">
        <PageHeading
          title="My Creations"
          lead="Everything you make is saved on this device. Download what you want to keep."
        />

        {items.length === 0 ? (
          <Panel className="text-center">
            <p className="text-body-text">You haven't made anything yet.</p>
          </Panel>
        ) : (
          <>
            <div className="mb-6 flex justify-end">
              <ActionButton variant="ghost" onClick={clear}>
                Remove all
              </ActionButton>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => (
                <Panel key={item.id}>
                  <PreviewFrame>
                    {item.kind === "image" ? (
                      <img
                        src={item.url}
                        alt={item.prompt}
                        className="max-h-[220px] w-full rounded-lg object-contain"
                      />
                    ) : (
                      <video src={item.url} controls playsInline className="w-full rounded-lg" />
                    )}
                  </PreviewFrame>
                  <p className="mt-3 line-clamp-3 text-sm text-body-text">{item.prompt}</p>
                  <p className="mt-1 text-xs text-footer-text">
                    {item.kind === "image" ? "Image" : "Video"} ·{" "}
                    {new Date(item.createdAt).toLocaleDateString()}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <a
                      href={item.url}
                      download={`syntaxscene-${item.kind}.${item.kind === "image" ? "png" : "mp4"}`}
                      className="inline-flex rounded-xl bg-primary px-4 py-2 text-sm text-primary-foreground transition-colors hover:bg-primary-hover"
                    >
                      Download
                    </a>
                    <ActionButton variant="ghost" className="px-4 py-2" onClick={() => remove(item.id)}>
                      Remove
                    </ActionButton>
                  </div>
                </Panel>
              ))}
            </div>
          </>
        )}
      </div>
    </StudioShell>
  );
}
