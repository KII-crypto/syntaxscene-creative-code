import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

const links = [
  { to: "/", label: "Home" },
  { to: "/create", label: "Create Image" },
  { to: "/animate", label: "Animate Image" },
  { to: "/creations", label: "My Creations" },
  { to: "/about", label: "About KII" },
] as const;

export function StudioShell({ children }: { children: ReactNode }) {
  const year = new Date().getFullYear();

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-white/5 bg-background/80 backdrop-blur-md">
        <nav className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-5 py-4 md:flex-row md:justify-between md:gap-0">
          <Link to="/" className="text-2xl font-bold tracking-tight">
            SyntaxScene <span className="text-sm font-normal text-primary">by KII</span>
          </Link>
          <ul className="flex list-none flex-wrap justify-center gap-x-5 gap-y-2 text-sm">
            {links.map((l) => (
              <li key={l.to}>
                <Link
                  to={l.to}
                  activeOptions={{ exact: l.to === "/" }}
                  activeProps={{ className: "text-primary" }}
                  className="text-body-text transition-colors duration-300 hover:text-primary"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-white/5 bg-surface-deep p-8 text-center text-sm text-footer-text">
        <p>© {year} SyntaxScene by KII. All rights reserved.</p>
      </footer>
    </div>
  );
}

export function PageHeading({ title, lead }: { title: string; lead: string }) {
  return (
    <div className="reveal reveal-show mb-10 text-center">
      <h1 className="text-3xl font-bold md:text-5xl">{title}</h1>
      <p className="mx-auto mt-3 max-w-2xl text-body-text">{lead}</p>
    </div>
  );
}
