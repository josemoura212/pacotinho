"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";

export function ServiceWorkerRegister() {
  const { data: session } = useSession();

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker.getRegistration().then((reg) => {
      if (reg) {
        reg.update();
      } else {
        navigator.serviceWorker.register("/sw.js");
      }
    });
  }, []);

  useEffect(() => {
    if (!session?.user) return;
    if (
      !("serviceWorker" in navigator) ||
      !("PushManager" in window) ||
      !("Notification" in window)
    )
      return;

    if (Notification.permission === "granted") {
      subscribeToPush();
    }
  }, [session]);

  return null;
}

export async function subscribeToPush() {
  try {
    const registration = await navigator.serviceWorker.ready;
    const existing = await registration.pushManager.getSubscription();
    if (existing) return;

    const res = await fetch("/api/push/vapid-key");
    const { data: vapidKey } = await res.json();
    if (!vapidKey) return;

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: vapidKey,
    });

    await fetch("/api/push/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(subscription.toJSON()),
    });
  } catch {
    // Push not supported or denied
  }
}
