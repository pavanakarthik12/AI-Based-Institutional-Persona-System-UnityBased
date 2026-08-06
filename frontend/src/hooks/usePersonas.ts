"use client";

import { useEffect } from "react";
import { useGLTF } from "@react-three/drei";
import { useAppStore, type Persona } from "@/store/useAppStore";
import { apiBase } from "@/lib/backendUrl";

/** Loads the persona roster once. The backend owns who exists and which model they use. */
export const usePersonas = () => {
  const setPersonas = useAppStore((state) => state.setPersonas);

  useEffect(() => {
    const controller = new AbortController();

    const load = async () => {
      try {
        const response = await fetch(`${apiBase()}/personas`, { signal: controller.signal });
        if (!response.ok) {
          throw new Error(`personas request failed: ${response.status}`);
        }
        const data = (await response.json()) as { default: string; personas: Persona[] };
        setPersonas(data.personas ?? [], data.default);
        // Warm the whole roster in the background so switching personas is instant.
        data.personas?.forEach((persona) => {
          if (persona.model_url) {
            useGLTF.preload(persona.model_url);
          }
        });
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          console.error("[personas] failed to load", error);
        }
      }
    };

    void load();
    return () => controller.abort();
  }, [setPersonas]);
};
