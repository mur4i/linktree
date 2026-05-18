import { motion } from "framer-motion";
import "./App.css";
import Background from "./components/Background/Background";
import Destroyer from "./components/Destroyer/Destroyer";
import BattleHUD from "./components/BattleHUD/BattleHUD";
import IdentityCard from "./components/IdentityCard/IdentityCard";
import ClockWidget from "./components/ClockWidget/ClockWidget";
import LocationWidget from "./components/LocationWidget/LocationWidget";
import YouTubeWidget from "./components/YouTubeWidget/YouTubeWidget";
import Links from "./components/Links/Links";

const bento = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.09, delayChildren: 0.15 },
  },
};

function App() {
  return (
    <>
      <Background />
      <Destroyer />
      <BattleHUD />
      <motion.main
        className="page"
        variants={bento}
        initial="hidden"
        animate="show"
      >
        <div className="bento">
          <div className="bento__identity">
            <IdentityCard />
          </div>
          <div className="bento__clock">
            <ClockWidget />
          </div>
          <div className="bento__location">
            <LocationWidget />
          </div>
          <div className="bento__player">
            <YouTubeWidget />
          </div>
          <div className="bento__links">
            <Links />
          </div>
        </div>
      </motion.main>
    </>
  );
}

export default App;
