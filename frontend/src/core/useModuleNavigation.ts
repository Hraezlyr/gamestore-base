import { useSyncExternalStore } from "react";
import type { ModuleDefinition } from "./modulesRegistry";

function subscribe(onChange: () => void) {
  window.addEventListener("popstate", onChange);
  return () => window.removeEventListener("popstate", onChange);
}

function getSnapshot() {
  return window.location.pathname;
}

export function useModuleNavigation(modules: ModuleDefinition[]) {
  const pathname = useSyncExternalStore(subscribe, getSnapshot, () => "/");
  const segment = pathname.split("/").filter(Boolean)[0];
  const activeId = modules.find(module => encodeURIComponent(module.id) === segment)?.id ?? modules[0]?.id ?? "";

  function selectModule(id: string) {
    if (!modules.some(module => module.id === id)) return;
    const path = `/${encodeURIComponent(id)}/`;
    if (window.location.pathname === path && !window.location.hash) return;
    const oldURL = window.location.href;
    window.history.pushState(window.history.state, "", path);
    window.dispatchEvent(new PopStateEvent("popstate"));
    window.dispatchEvent(new HashChangeEvent("hashchange", { oldURL, newURL: window.location.href }));
  }

  return { activeId, selectModule };
}
