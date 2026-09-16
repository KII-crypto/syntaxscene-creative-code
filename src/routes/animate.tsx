import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";

import { PageHeading, StudioShell } from "@/components/StudioShell";
import { ActionButton, LoadingBar, Notice, Panel, PreviewFrame } from "@/components/StudioUI";
import { saveCreation } from "@/lib/creations";

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
  component: AnimateImage;
});

function AnimateImage() {
  return null;
}
