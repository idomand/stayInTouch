"use client";

import { useEffect } from "react";

/**
 * Opens the <details> whose id matches the URL hash, on load and on every
 * hash change, so a link like /faq#timer lands on that question already open.
 * The hash never reaches the server, so this has to run in the browser.
 */
export default function OpenDetailsFromHash() {
  useEffect(() => {
    function openFromHash() {
      const id = decodeURIComponent(window.location.hash.slice(1));
      if (!id) return;
      const element = document.getElementById(id);
      if (!(element instanceof HTMLDetailsElement)) return;
      element.open = true;
      element.scrollIntoView();
    }

    openFromHash();
    window.addEventListener("hashchange", openFromHash);
    return () => window.removeEventListener("hashchange", openFromHash);
  }, []);

  return null;
}
