import { useEffect, useRef } from "react";
import "./Background.css";

const STAR_COUNT = 240;
const WARP_SPEED = 0.0042;

function Background() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let W = window.innerWidth;
    let H = window.innerHeight;
    const dpr = window.devicePixelRatio || 1;

    const resize = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width = W + "px";
      canvas.style.height = H + "px";
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener("resize", resize);

    const stars = Array.from({ length: STAR_COUNT }, () => ({
      x: (Math.random() - 0.5) * 2,
      y: (Math.random() - 0.5) * 2,
      z: Math.random(),
      hue: Math.random() < 0.85 ? "emerald" : "white",
    }));

    let raf;
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      const cx = W / 2;
      const cy = H / 2;
      const scale = Math.max(W, H);

      for (const s of stars) {
        s.z -= WARP_SPEED;
        if (s.z <= 0.0001) {
          s.x = (Math.random() - 0.5) * 2;
          s.y = (Math.random() - 0.5) * 2;
          s.z = 1;
          s.hue = Math.random() < 0.85 ? "emerald" : "white";
        }

        const prevZ = s.z + WARP_SPEED;
        const sx = (s.x / s.z) * scale + cx;
        const sy = (s.y / s.z) * scale + cy;
        const psx = (s.x / prevZ) * scale + cx;
        const psy = (s.y / prevZ) * scale + cy;

        const alpha = (1 - s.z) * 0.9;
        const width = Math.max(0.4, (1 - s.z) * 1.6);

        ctx.strokeStyle =
          s.hue === "white"
            ? `rgba(236, 254, 255, ${alpha})`
            : `rgba(167, 243, 208, ${alpha * 0.85})`;
        ctx.lineWidth = width;
        ctx.beginPath();
        ctx.moveTo(psx, psy);
        ctx.lineTo(sx, sy);
        ctx.stroke();
      }

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    const onMove = (e) => {
      document.documentElement.style.setProperty("--mouse-x", `${e.clientX}px`);
      document.documentElement.style.setProperty("--mouse-y", `${e.clientY}px`);
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  return (
    <>
      <div className="aurora" aria-hidden="true" />
      <canvas ref={canvasRef} className="warp" aria-hidden="true" />
      <div className="spotlight" aria-hidden="true" />
    </>
  );
}

export default Background;
