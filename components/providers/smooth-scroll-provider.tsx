"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

type LenisApi = { stop: () => void; start: () => void };
const LenisContext = createContext<LenisApi>({ stop: () => {}, start: () => {} });

export function useLenis() {
  return useContext(LenisContext);
}

/**
 * Pause Lenis while `active` is true (e.g. a modal/drawer is open) and resume
 * when it closes. Prevents the smooth-scroll engine from fighting a dialog's
 * scroll lock, which otherwise leaves the page unable to scroll.
 */
export function useLenisLock(active: boolean) {
  const { stop, start } = useLenis();
  useEffect(() => {
    if (active) stop();
    else start();
    return () => start();
  }, [active, stop, start]);
}

/**
 * Buttery smooth scrolling (Lenis) wired into GSAP's ticker so ScrollTrigger
 * animations stay perfectly in sync. Disabled when the user prefers reduced motion.
 */
export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (prefersReduced) return;

    gsap.registerPlugin(ScrollTrigger);

    const lenis = new Lenis({
      duration: 1.1,
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.5,
    });
    lenisRef.current = lenis;

    lenis.on("scroll", ScrollTrigger.update);

    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(raf);
      lenis.destroy();
      lenisRef.current = null;
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  const api = useMemo<LenisApi>(
    () => ({
      stop: () => lenisRef.current?.stop(),
      start: () => lenisRef.current?.start(),
    }),
    [],
  );

  return <LenisContext.Provider value={api}>{children}</LenisContext.Provider>;
}
