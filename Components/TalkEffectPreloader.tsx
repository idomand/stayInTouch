"use client";
import { useEffect } from "react";
import { preloadTalkEffect } from "@/lib/talkEffect";

/** Starts loading the talk effect library once the page is idle. Renders nothing. */
export default function TalkEffectPreloader() {
  useEffect(() => {
    preloadTalkEffect();
  }, []);
  return null;
}
