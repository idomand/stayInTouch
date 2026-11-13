"use client";
import { useEffect } from "react";
import { preloadConfettiStyle } from "@/lib/confettiStyle";

/** Starts loading the confetti library once the page is idle. Renders nothing. */
export default function ConfettiStylePreloader() {
  useEffect(() => {
    preloadConfettiStyle();
  }, []);
  return null;
}
