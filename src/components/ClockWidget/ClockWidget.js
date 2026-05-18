import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import "./ClockWidget.css";

const cardVar = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};

function formatLocal(date) {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(date);
}

function formatDate(date) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Sao_Paulo",
    weekday: "short",
    day: "2-digit",
    month: "short",
  })
    .format(date)
    .toUpperCase();
}

function ClockWidget() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <motion.section className="card clock" variants={cardVar}>
      <span className="hud-corner hud-corner--tl" aria-hidden="true" />
      <span className="hud-corner hud-corner--tr" aria-hidden="true" />
      <span className="hud-corner hud-corner--bl" aria-hidden="true" />
      <span className="hud-corner hud-corner--br" aria-hidden="true" />

      <p className="card__label mono">{"// LOCAL TIME"}</p>
      <div className="clock__time mono">{formatLocal(now)}</div>
      <p className="clock__zone mono">
        {formatDate(now)} · UTC−3 · BR
      </p>
    </motion.section>
  );
}

export default ClockWidget;
