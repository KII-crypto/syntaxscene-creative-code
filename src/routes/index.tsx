import { createFileRoute, Link } from "@tanstack/react-router";

import { StudioShell } from "@/components/StudioShell";
import { Panel } from "@/components/StudioUI";

const title = "SyntaxScene by KII — AI Creative Studio";
const description =
  "Create the scene. Bring it to life. SyntaxScene by KII is a creative studio for generating images and animating them into short videos.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: Home,
});

const features = [
  {
    title: "Create Image",
    body: "Describe a scene in plain words and generate a still image you can download.",
  },
  {
    title: "Animate Image",
    body: "Upload an image, describe the motion, and turn it into a short video clip.",
  },
  {
    title: "My Creations",
    body: "Everything you make is kept in your gallery, ready to download or remove.",
  },
];

function Home() {
  return (
    <StudioShell>
      <section className="mx-auto flex min-h-[78vh] max-w-4xl flex-col items-center justify-center px-5 py-20 text-center">
        <span className="mb-6 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs tracking-wide text-primary uppercase">
          Kunene Intelligence Industries
        </span>
        <h1 className="text-5xl font-bold tracking-tight md:text-7xl">SyntaxScene</h1>
        <h2 className="mt-3 text-xl font-medium text-primary">by KII</h2>
        <p className="mt-6 text-2xl font-light md:text-3xl">Create the scene. Bring it to life.</p>
        <p className="mt-5 max-w-2xl text-body-text">
          A creative studio for turning ideas into visuals. Write a prompt to generate an image, then
          animate any image into a short video — all in one clean, fast workspace.
        </p>
        <div className="mt-9 flex flex-col gap-3 sm:flex-row">
          <Link
            to="/create"
            className="rounded-xl bg-primary px-8 py-4 text-primary-foreground transition-all duration-300 hover:-translate-y-[3px] hover:bg-primary-hover"
          >
            Create Image
          </Link>
          <Link
            to="/animate"
            className="rounded-xl border border-white/10 px-8 py-4 text-body-text transition-all duration-300 hover:-translate-y-[3px] hover:border-primary hover:text-primary"
          >
            Animate Image
          </Link>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-5 px-5 pb-24 md:grid-cols-3">
        {features.map((f) => (
          <Panel key={f.title}>
            <h3 className="text-lg font-semibold">{f.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-body-text">{f.body}</p>
          </Panel>
        ))}
      </section>
    </StudioShell>
  );
}
