import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

const title = "SyntaxScene by KII";
const description =
  "SyntaxScene by Kunene Intelligence Industries — modern, reliable and user-friendly websites, built with purpose.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: Index,
});

function useReveal<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) setShown(true);
      });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, className: shown ? "reveal reveal-show" : "reveal" };
}

function Index() {
  const hero = useReveal<HTMLElement>();
  const about = useReveal<HTMLElement>();
  const year = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header>
        <nav className="fixed top-0 z-50 flex w-full flex-col items-center gap-4 bg-background/85 px-[8%] py-5 backdrop-blur-md md:flex-row md:justify-between md:gap-0">
          <h2 className="text-[28px] font-bold">
            SyntaxScene <span className="text-base font-normal text-primary">by KII</span>
          </h2>
          <ul className="flex list-none gap-6">
            <li>
              <a href="#home" className="transition-colors duration-300 hover:text-primary">
                Home
              </a>
            </li>
            <li>
              <a href="#about" className="transition-colors duration-300 hover:text-primary">
                About
              </a>
            </li>
          </ul>
        </nav>
      </header>

      <main>
        <section
          id="home"
          ref={hero.ref}
          className={`flex min-h-screen flex-col items-center justify-center p-5 text-center ${hero.className}`}
        >
          <h1 className="mb-2.5 text-[50px] font-bold md:text-[72px]">SyntaxScene</h1>
          <h3 className="mb-5 text-xl font-medium text-primary">by KII</h3>
          <p className="mb-9 max-w-[600px] text-lg text-body-text">
            Modern websites, built with purpose.
          </p>
          <a
            href="#about"
            className="rounded-[10px] bg-primary px-9 py-4 text-primary-foreground transition-all duration-300 hover:-translate-y-[3px] hover:scale-105 hover:bg-primary-hover"
          >
            Learn More
          </a>
        </section>

        <section
          id="about"
          ref={about.ref}
          className={`mx-auto max-w-[900px] px-5 py-[70px] md:px-[30px] md:py-[100px] ${about.className}`}
        >
          <h2 className="mb-[30px] text-center text-[40px] font-bold">About KII</h2>
          <p className="mb-5 leading-[1.8] text-body-text">
            <strong className="text-foreground">KII</strong> stands for{" "}
            <strong className="text-foreground">Kunene Intelligence Industries.</strong>
          </p>
          <p className="mb-5 leading-[1.8] text-body-text">
            Founded by a young prospective software engineer, KII is focused on creating modern,
            reliable, and user-friendly websites. Every project is built with creativity, attention
            to detail, and a passion for technology.
          </p>
        </section>
      </main>

      <footer className="bg-surface-deep p-[30px] text-center text-footer-text">
        <p>© {year} SyntaxScene by KII. All rights reserved.</p>
      </footer>
    </div>
  );
}
