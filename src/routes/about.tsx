import { createFileRoute } from "@tanstack/react-router";

import { PageHeading, StudioShell } from "@/components/StudioShell";
import { Panel } from "@/components/StudioUI";

const title = "About KII — SyntaxScene";
const description =
  "KII stands for Kunene Intelligence Industries. SyntaxScene is a KII creative technology project.";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: About,
});

function About() {
  return (
    <StudioShell>
      <div className="mx-auto max-w-3xl px-5 py-16">
        <PageHeading title="About KII" lead="Kunene Intelligence Industries." />

        <Panel>
          <p className="leading-[1.9] text-body-text">
            <strong className="text-foreground">KII</strong> stands for{" "}
            <strong className="text-foreground">Kunene Intelligence Industries</strong>.
          </p>
          <p className="mt-5 leading-[1.9] text-body-text">
            <strong className="text-foreground">SyntaxScene</strong> is a KII creative technology
            project — a studio for turning written ideas into images, and images into motion.
          </p>
          <p className="mt-5 leading-[1.9] text-body-text">
            Founded by a young prospective software engineer, KII builds modern, reliable and
            user-friendly products with creativity, attention to detail, and a real passion for
            technology.
          </p>
        </Panel>
      </div>
    </StudioShell>
  );
}
