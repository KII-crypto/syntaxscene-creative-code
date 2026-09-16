import { useCallback, useEffect, useState } from "react";

export type Creation = {
  id: string;
  kind: "image" | "video";
  prompt: string;
  url: string;
  createdAt: number;
};

const KEY = "syntaxscene.creations";
const EVENT = "syntaxscene:creations-changed";

function read(): Creation[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Creation[]) : [];
  } catch {
    return [];
  }
}

function write(items: Creation[]) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(items));
  } catch {
    // Storage full — keep only the most recent few and retry once.
    try {
      window.localStorage.setItem(KEY, JSON.stringify(items.slice(0, 5)));
    } catch {
      /* give up silently; the UI still shows the current result */
    }
  }
  window.dispatchEvent(new Event(EVENT));
}

export function saveCreation(item: Omit<Creation, "id" | "createdAt">) {
  const entry: Creation = {
    ...item,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: Date.now(),
  };
  write([entry, ...read()]);
  return entry;
}

export function useCreations() {
  const [items, setItems] = useState<Creation[]>([]);

  useEffect(() => {
    const sync = () => setItems(read());
    sync();
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const remove = useCallback((id: string) => {
    write(read().filter((c) => c.id !== id));
  }, []);

  const clear = useCallback(() => write([]), []);

  return { items, remove, clear };
}
