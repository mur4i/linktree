import { motion } from "framer-motion";
import "./LocationWidget.css";

const cardVar = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};

function LocationWidget() {
  return (
    <motion.section className="card location" variants={cardVar}>
      <span className="hud-corner hud-corner--tl" aria-hidden="true" />
      <span className="hud-corner hud-corner--tr" aria-hidden="true" />
      <span className="hud-corner hud-corner--bl" aria-hidden="true" />
      <span className="hud-corner hud-corner--br" aria-hidden="true" />

      <p className="card__label mono">{"// LOCATION"}</p>
      <h2 className="location__city">Florianópolis</h2>
      <div className="location__coords mono">
        <span>-27.5949° S</span>
        <span>-48.5482° W</span>
      </div>
      <p className="location__sub mono">SC · Brazil · region:br-south</p>
    </motion.section>
  );
}

export default LocationWidget;
