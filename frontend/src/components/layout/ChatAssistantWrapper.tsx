"use client";

import dynamic from "next/dynamic";

export const ChatAssistantWrapper = dynamic(
  () => import("./ChatAssistant").then((mod) => mod.ChatAssistant),
  { ssr: false }
);
