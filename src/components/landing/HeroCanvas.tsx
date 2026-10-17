// ============================================================
// HeroCanvas — lazy WebGL glass scene with CSS fallback
// ============================================================
import { useEffect, useRef, useState } from 'react';
import type { GlassSceneHandle } from './glassScene';

export function HeroCanvas({ threatLevel }: { threatLevel: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<GlassSceneHandle | null>(null);
  const threatRef = useRef(threatLevel);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    import('./glassScene')
      .then(({ createGlassScene }) => {
        if (cancelled) return;
        const handle = createGlassScene(canvas, {
          reducedMotion,
          onFirstFrame: () => !cancelled && setReady(true),
        });
        handle.setThreat(threatRef.current);
        sceneRef.current = handle;
      })
      .catch(() => {
        // WebGL unavailable — the CSS gradient fallback stays visible
      });

    return () => {
      cancelled = true;
      sceneRef.current?.dispose();
      sceneRef.current = null;
    };
  }, []);

  useEffect(() => {
    threatRef.current = threatLevel;
    sceneRef.current?.setThreat(threatLevel);
  }, [threatLevel]);

  return (
    <div className="hero-visual" aria-hidden="true">
      <div className="hero-visual__fallback" />
      <canvas ref={canvasRef} className={`hero-visual__canvas${ready ? ' is-ready' : ''}`} />
    </div>
  );
}
