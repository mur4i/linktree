import { motion } from "framer-motion";
import "./IdentityCard.css";

const cardVar = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

function IdentityCard() {
  return (
    <motion.section className="card identity" variants={cardVar}>
      <span className="hud-corner hud-corner--tl" aria-hidden="true" />
      <span className="hud-corner hud-corner--tr" aria-hidden="true" />
      <span className="hud-corner hud-corner--bl" aria-hidden="true" />
      <span className="hud-corner hud-corner--br" aria-hidden="true" />

      <div className="identity__avatar-wrap">
        <div className="identity__avatar-ring" aria-hidden="true" />
        <div className="identity__avatar" role="img" aria-label="Murai Dev avatar" />
        <span className="identity__status-dot" aria-label="Online status">
          <span className="identity__status-pulse" />
        </span>
      </div>

      <div className="identity__meta">
        <p className="identity__label mono">{"// IDENTITY"}</p>
        <h1 className="identity__name">mur4i</h1>
        <p className="identity__role mono">Product Engineer & Dev</p>
        <p className="identity__status mono">
          <span className="dot dot--green" /> online · accepting signals
        </p>
      </div>
    </motion.section>
  );
}

export default IdentityCard;
