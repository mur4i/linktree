import { useEffect, useState } from "react";
import sound from "../../utils/sound";
import "./BattleHUD.css";

function BattleHUD() {
  const [hits, setHits] = useState(0);
  const [destroyed, setDestroyed] = useState(0);
  const [total, setTotal] = useState(0);
  const [powerups, setPowerups] = useState(0);
  const [wave, setWave] = useState(1);
  const [muted, setMuted] = useState(false);
  const [audioReady, setAudioReady] = useState(false);

  useEffect(() => {
    const count = () => {
      const all =
        document.querySelectorAll("[data-destroyable]").length ||
        document.querySelectorAll(".card, .link").length;
      setTotal(all);
    };
    count();
    const t = setTimeout(count, 600);

    const onHit = () => setHits((h) => h + 1);
    const onDestroyed = () => setDestroyed((d) => d + 1);
    const onPowerup = () => setPowerups((p) => p + 1);
    const onWave = (e) => {
      setWave(e.detail.wave);
      setDestroyed(0);
      count();
    };

    const onFirstClick = () => setAudioReady(true);
    window.addEventListener("destroyer:hit", onHit);
    window.addEventListener("destroyer:destroyed", onDestroyed);
    window.addEventListener("destroyer:powerup", onPowerup);
    window.addEventListener("destroyer:wave", onWave);
    window.addEventListener("pointerdown", onFirstClick, { once: true });

    return () => {
      clearTimeout(t);
      window.removeEventListener("destroyer:hit", onHit);
      window.removeEventListener("destroyer:destroyed", onDestroyed);
      window.removeEventListener("destroyer:powerup", onPowerup);
      window.removeEventListener("destroyer:wave", onWave);
      window.removeEventListener("pointerdown", onFirstClick);
    };
  }, []);

  const alive = Math.max(0, total - destroyed);

  const onToggleSound = () => {
    sound.resume();
    setMuted(sound.toggle());
  };

  return (
    <aside className="destroyer-hud mono" aria-label="Battle HUD">
      <span className="hud-corner hud-corner--tl" aria-hidden="true" />
      <span className="hud-corner hud-corner--tr" aria-hidden="true" />
      <span className="hud-corner hud-corner--bl" aria-hidden="true" />
      <span className="hud-corner hud-corner--br" aria-hidden="true" />

      <div className="destroyer-hud__head">
        <p className="destroyer-hud__title">{"// BATTLE LOG"}</p>
        <button
          type="button"
          className={`sound-toggle${audioReady ? "" : " sound-toggle--pulse"}`}
          onClick={onToggleSound}
          aria-label={muted ? "Unmute sound" : "Mute sound"}
          title={audioReady ? (muted ? "unmute" : "mute") : "tap to enable audio"}
        >
          {muted ? "♪×" : "♪"}
        </button>
      </div>
      <div className="destroyer-hud__row destroyer-hud__row--wave">
        <span className="destroyer-hud__label">WAVE</span>
        <span className="destroyer-hud__value destroyer-hud__value--accent">{wave}</span>
      </div>
      <div className="destroyer-hud__row">
        <span className="destroyer-hud__label">TARGETS</span>
        <span className="destroyer-hud__value">{alive}/{total}</span>
      </div>
      <div className="destroyer-hud__row">
        <span className="destroyer-hud__label">DESTROYED</span>
        <span className="destroyer-hud__value">{destroyed}</span>
      </div>
      <div className="destroyer-hud__row">
        <span className="destroyer-hud__label">HITS</span>
        <span className="destroyer-hud__value">{hits}</span>
      </div>
      <div className="destroyer-hud__row">
        <span className="destroyer-hud__label">RAPID</span>
        <span className="destroyer-hud__value">{powerups}</span>
      </div>
    </aside>
  );
}

export default BattleHUD;
