import { useSyncExternalStore } from "react";

function subscribe(onChange: () => void) {
  window.addEventListener("hashchange", onChange);
  return () => window.removeEventListener("hashchange", onChange);
}

function getSnapshot() {
  return window.location.hash;
}

export function useShooterNavigation() {
  const hash = useSyncExternalStore(subscribe, getSnapshot, () => "");
  const match = /^#game\/([1-9]\d*)$/.exec(hash);
  const selectedId = match ? Number(match[1]) : null;
  const view = hash === "#login" ? "login" : hash === "#admin" ? "admin" : "catalog";
  return {
    view,
    selectedId: selectedId !== null && Number.isSafeInteger(selectedId) ? selectedId : null,
    navigate: (view: "catalog" | "login" | "admin") => { window.location.hash = view; },
    openGame: (id: number) => { window.location.hash = `game/${id}`; },
  };
}
