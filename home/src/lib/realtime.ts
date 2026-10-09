"use client";

import { useEffect, useRef } from "react";
import { API_URL } from "./api";
import type { BlogComment } from "./types";

export type RealtimeEvent =
  | { type: "comment:created"; slug: string; comment: BlogComment; commentCount: number }
  | { type: "comment:updated"; slug: string; comment: BlogComment; commentCount: number }
  | { type: "comment:deleted"; slug: string; id: number; commentCount: number }
  | { type: "like:changed"; slug: string; likeCount: number };

// ws://host:4000/ws, derived from the API url unless NEXT_PUBLIC_WS_URL is set
const WS_URL = process.env.NEXT_PUBLIC_WS_URL || `${API_URL.replace(/^http/, "ws")}/ws`;

// Subscribes to live comment / like events for one blog and reconnects when the socket drops
export function useBlogEvents(slug: string, onEvent: (e: RealtimeEvent) => void) {
  const handler = useRef(onEvent);
  useEffect(() => {
    handler.current = onEvent;
  });

  useEffect(() => {
    let socket: WebSocket | null = null;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let closed = false;

    const connect = () => {
      socket = new WebSocket(WS_URL);
      socket.onopen = () => socket?.send(JSON.stringify({ type: "subscribe", slug }));
      socket.onmessage = (m) => {
        try {
          handler.current(JSON.parse(String(m.data)));
        } catch {}
      };
      socket.onclose = () => {
        if (!closed) timer = setTimeout(connect, 3000);
      };
    };
    connect();

    return () => {
      closed = true;
      clearTimeout(timer);
      socket?.close();
    };
  }, [slug]);
}
