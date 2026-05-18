import { useEffect, useRef } from "react";
import sound from "../../utils/sound";
import "./Destroyer.css";

const FIRE_INTERVAL = 240;
const RAPID_FIRE_INTERVAL = 130;
const POWERUP_MS = 5000;
const PROJECTILE_SPEED = 10;
const FORMATION_LERP = 0.085;
const RESPAWN_DELAY = 1500;
const BASE_DAMAGE = 5;
const DAMAGE_PER_WAVE = 2;
const BASE_POWERUP_CHANCE = 0.55;
const POWERUP_CHANCE_PER_WAVE = 0.1;

const POWERUP_TYPES = ["rapid", "triple", "mega", "nuke"];
const POWERUP_COLORS = {
  rapid: "#34d399",
  triple: "#22d3ee",
  mega: "#facc15",
  nuke: "#fb923c",
};
const POWERUP_LABELS = {
  rapid: "RAPID",
  triple: "TRI",
  mega: "MEGA",
  nuke: "NUKE",
};

const SPRITES = {
  leader: [
    "...XXXXX...",
    "..XoooooX..",
    ".XoWWWWWoX.",
    ".XoWXXXWoX.",
    ".XoWWWWWoX.",
    "..XXXXXXX..",
    ".XXXXXXXXX.",
    "XXXX.X.XXXX",
    "XXX.XXX.XXX",
    "..X.....X..",
    "..X.....X..",
  ],
  flank: [
    "...XXX...",
    "..XoooX..",
    ".XoWWWoX.",
    ".XoWWWoX.",
    ".XXXXXXX.",
    "XXXXXXXXX",
    "XX.XXX.XX",
    ".X..X..X.",
  ],
};

function drawSprite(ctx, kind, cx, cy, dir, bob) {
  const sprite = SPRITES[kind];
  const w = sprite[0].length;
  const h = sprite.length;
  const scale = kind === "leader" ? 4 : 3;
  const sx = cx - (w * scale) / 2;
  const sy = cy - (h * scale) / 2 + bob;

  ctx.shadowColor = "#34d399";
  ctx.shadowBlur = 14;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const c = sprite[y][x];
      if (c === ".") continue;
      const px = dir > 0 ? x : w - 1 - x;
      ctx.fillStyle = c === "W" ? "#ecfeff" : c === "o" ? "#a7f3d0" : "#34d399";
      ctx.fillRect(sx + px * scale, sy + y * scale, scale, scale);
    }
  }
  ctx.shadowBlur = 0;
}

function Destroyer() {
  const canvasRef = useRef(null);
  const waveRef = useRef(1);

  const respawn = (nextWave) => {
    document.querySelectorAll("[data-destroyable]").forEach((el) => {
      delete el.dataset.damage;
      delete el.dataset.destroyed;
    });
    waveRef.current = nextWave;
    window.dispatchEvent(
      new CustomEvent("destroyer:wave", { detail: { wave: nextWave } })
    );
    sound.waveStart();
  };

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

    document.querySelectorAll(".card, .link").forEach((el) => {
      if (!el.dataset.destroyable) el.dataset.destroyable = "true";
    });

    // mouse + firing state
    let mouseX = W / 2;
    let mouseY = H / 2;
    let mouseSeen = false;
    let firing = false;
    let rapidUntil = 0;
    let tripleUntil = 0;
    let megaUntil = 0;

    // squad formation (relative offsets to mouse)
    const aliens = [
      {
        kind: "leader",
        x: W / 2, y: 80, dir: 1, lastFire: 0, target: null,
        // orbit params: radius, angular speed, base angle, noise phase
        orbitR: 95, orbitSpeed: 0.0007, baseAngle: -Math.PI / 2, noisePhase: 0,
      },
      {
        kind: "flank",
        x: W / 2 - 120, y: 130, dir: 1, lastFire: 0, target: null,
        orbitR: 140, orbitSpeed: -0.0011, baseAngle: Math.PI * 0.78, noisePhase: 1.4,
      },
      {
        kind: "flank",
        x: W / 2 + 120, y: 130, dir: 1, lastFire: 0, target: null,
        orbitR: 140, orbitSpeed: 0.0011, baseAngle: Math.PI * 0.22, noisePhase: 2.8,
      },
    ];

    const assignTarget = (alien, alive) => {
      if (alive.length === 0) {
        alien.target = null;
        return;
      }
      // prefer to keep current if still alive
      if (alien.target && alien.target.dataset.destroyed !== "true") return;
      // pick a target not already taken by another alien if possible
      const taken = new Set(aliens.map((a) => a.target).filter(Boolean));
      const free = alive.filter((el) => !taken.has(el));
      const pool = free.length > 0 ? free : alive;
      alien.target = pool[Math.floor(Math.random() * pool.length)];
    };

    const projectiles = [];
    const debris = [];
    const powerups = [];
    const damageMap = new WeakMap();
    let raf;
    let respawnTimer = null;
    let shakeUntil = 0;
    let shakeMagnitude = 0;

    const currentMaxDamage = () => BASE_DAMAGE + (waveRef.current - 1) * DAMAGE_PER_WAVE;
    const currentPowerupChance = () =>
      Math.min(0.9, BASE_POWERUP_CHANCE + (waveRef.current - 1) * POWERUP_CHANCE_PER_WAVE);

    const aliveTargets = () =>
      Array.from(document.querySelectorAll("[data-destroyable]")).filter(
        (el) => el.dataset.destroyed !== "true"
      );

    const rect = (el) => {
      const r = el.getBoundingClientRect();
      return {
        x: r.left,
        y: r.top,
        w: r.width,
        h: r.height,
        cx: r.left + r.width / 2,
        cy: r.top + r.height / 2,
      };
    };

    const triggerShake = (mag, ms) => {
      shakeUntil = Math.max(shakeUntil, performance.now() + ms);
      shakeMagnitude = Math.max(shakeMagnitude, mag);
    };

    const fireFrom = (alien, tx, ty, now) => {
      const dx = tx - alien.x;
      const dy = ty - alien.y;
      const dist = Math.hypot(dx, dy) || 1;
      const baseVx = (dx / dist) * PROJECTILE_SPEED;
      const baseVy = (dy / dist) * PROJECTILE_SPEED;
      const mega = now < megaUntil;
      const triple = now < tripleUntil;
      const offsets = triple ? [-0.18, 0, 0.18] : [0];
      for (const a of offsets) {
        const cos = Math.cos(a);
        const sin = Math.sin(a);
        projectiles.push({
          x: alien.x + 16 * alien.dir,
          y: alien.y,
          vx: baseVx * cos - baseVy * sin,
          vy: baseVx * sin + baseVy * cos,
          dmg: mega ? 2 : 1,
          color: mega ? "#facc15" : "#bbf7d0",
        });
      }
      sound.shoot();
    };

    const damage = (el, amount = 1) => {
      if (el.dataset.destroyed === "true") return;
      const cur = damageMap.get(el) || 0;
      const next = cur + amount;
      const max = currentMaxDamage();
      damageMap.set(el, next);
      // map current damage to 1..5 visual stages regardless of actual max
      const stage = Math.min(5, Math.ceil((next / max) * 5));
      el.dataset.damage = String(stage);

      const r = rect(el);
      for (let i = 0; i < 5; i++) {
        debris.push({
          x: r.cx + (Math.random() - 0.5) * r.w * 0.3,
          y: r.cy + (Math.random() - 0.5) * r.h * 0.3,
          vx: (Math.random() - 0.5) * 5,
          vy: -Math.random() * 4 - 1,
          life: 1,
          size: 2,
        });
      }
      triggerShake(2, 80);
      sound.hit();
      window.dispatchEvent(new CustomEvent("destroyer:hit"));

      if (next >= max) {
        el.dataset.destroyed = "true";
        for (let i = 0; i < 28; i++) {
          debris.push({
            x: r.cx + (Math.random() - 0.5) * r.w * 0.6,
            y: r.cy + (Math.random() - 0.5) * r.h * 0.6,
            vx: (Math.random() - 0.5) * 10,
            vy: (Math.random() - 0.5) * 8 - 2,
            life: 1.8,
            size: 3,
          });
        }
        triggerShake(8, 280);
        sound.destroy();
        window.dispatchEvent(new CustomEvent("destroyer:destroyed"));

        if (Math.random() < currentPowerupChance()) {
          const type = POWERUP_TYPES[Math.floor(Math.random() * POWERUP_TYPES.length)];
          powerups.push({ x: r.cx, y: r.cy, life: 9, picked: false, type });
        }
      }
    };

    const isUIHit = (e) =>
      e.target.closest(".destroyer-hud") ||
      e.target.closest(".sound-toggle") ||
      e.target.closest(".yt-player") ||
      e.target.closest("iframe");

    const onPointerMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      mouseSeen = true;
    };

    const onPointerDown = (e) => {
      sound.resume();
      if (isUIHit(e)) return;
      mouseX = e.clientX;
      mouseY = e.clientY;
      mouseSeen = true;

      // try to collect a powerup
      for (const p of powerups) {
        if (p.picked) continue;
        if (Math.hypot(p.x - e.clientX, p.y - e.clientY) < 28) {
          p.picked = true;
          const now = performance.now();
          if (p.type === "rapid") rapidUntil = now + POWERUP_MS;
          else if (p.type === "triple") tripleUntil = now + POWERUP_MS;
          else if (p.type === "mega") megaUntil = now + POWERUP_MS;
          else if (p.type === "nuke") {
            const alive = aliveTargets();
            alive.forEach((el, i) => {
              setTimeout(() => damage(el, currentMaxDamage()), i * 90);
            });
          }
          triggerShake(3, 120);
          sound.powerup();
          window.dispatchEvent(new CustomEvent("destroyer:powerup", { detail: { type: p.type } }));
          return;
        }
      }

      firing = true;
    };

    const onPointerUp = () => {
      firing = false;
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);
    window.addEventListener("blur", onPointerUp);

    const drawHealthBar = (el) => {
      const d = damageMap.get(el) || 0;
      if (d === 0 || el.dataset.destroyed === "true") return;
      const r = rect(el);
      const barW = Math.min(r.w * 0.6, 90);
      const barH = 4;
      const x = r.cx - barW / 2;
      const y = r.y - 10;
      const pct = 1 - d / currentMaxDamage();
      ctx.fillStyle = "rgba(10, 10, 10, 0.7)";
      ctx.fillRect(x, y, barW, barH);
      ctx.fillStyle =
        pct > 0.6 ? "#34d399" : pct > 0.3 ? "#fbbf24" : "#f87171";
      ctx.shadowColor = ctx.fillStyle;
      ctx.shadowBlur = 6;
      ctx.fillRect(x, y, barW * pct, barH);
      ctx.shadowBlur = 0;
    };

    const drawPowerup = (p, t) => {
      const color = POWERUP_COLORS[p.type] || "#34d399";
      const label = POWERUP_LABELS[p.type] || "RAPID";
      const pulse = 1 + Math.sin(t * 0.008) * 0.18;
      const r = 14 * pulse;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(t * 0.003);
      ctx.shadowColor = color;
      ctx.shadowBlur = 22;
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = 0; i < 4; i++) {
        const a = (i / 4) * Math.PI * 2;
        if (i === 0) ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
        else ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
      }
      ctx.closePath();
      ctx.stroke();
      ctx.fillStyle = color.replace(")", ", 0.18)").replace("rgb", "rgba").replace("#", "");
      ctx.globalAlpha = 0.22;
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.restore();
      ctx.shadowBlur = 0;

      ctx.fillStyle = color;
      ctx.font = "bold 9px 'JetBrains Mono', monospace";
      ctx.textAlign = "center";
      ctx.fillText(label, p.x, p.y + 3);
    };

    const loop = () => {
      const now = performance.now();
      const alive = aliveTargets();
      const inRapid = now < rapidUntil;

      // screen shake (X only, to avoid vertical layout overflow)
      const main = document.querySelector(".page");
      if (now < shakeUntil) {
        const sx = (Math.random() - 0.5) * shakeMagnitude;
        const sy = (Math.random() - 0.5) * shakeMagnitude * 0.6;
        if (main) main.style.transform = `translate(${sx}px, ${sy}px)`;
      } else {
        shakeMagnitude *= 0.85;
        if (main && shakeMagnitude < 0.2) main.style.transform = "";
      }

      // aliens patrol around the mouse on continuous orbits + noise
      aliens.forEach((a) => {
        const angle = a.baseAngle + now * a.orbitSpeed;
        const noiseX = Math.sin(now * 0.0021 + a.noisePhase) * 10;
        const noiseY = Math.cos(now * 0.0018 + a.noisePhase) * 8;
        const targetX = mouseX + Math.cos(angle) * a.orbitR + noiseX;
        const targetY = Math.max(60, mouseY + Math.sin(angle) * a.orbitR * 0.7 + noiseY);
        const prevX = a.x;
        a.x += (targetX - a.x) * FORMATION_LERP;
        a.y += (targetY - a.y) * FORMATION_LERP;
        // face toward locked target if engaging and have one
        if ((firing || inRapid) && a.target && a.target.dataset.destroyed !== "true") {
          const tr = rect(a.target);
          a.dir = tr.cx >= a.x ? 1 : -1;
        } else if (firing) {
          a.dir = mouseX >= a.x ? 1 : -1;
        } else {
          a.dir = a.x > prevX + 0.05 ? 1 : a.x < prevX - 0.05 ? -1 : a.dir;
        }
      });

      // engage mode: drones either lock targets (if any) or suppress-fire toward cursor
      const engaging = (firing && mouseSeen) || inRapid;
      if (engaging) {
        const interval = inRapid ? RAPID_FIRE_INTERVAL : FIRE_INTERVAL;
        aliens.forEach((a) => {
          if (alive.length > 0) {
            assignTarget(a, alive);
            if (!a.target) return;
            if (now - a.lastFire > interval) {
              const r = rect(a.target);
              fireFrom(
                a,
                r.cx + (Math.random() - 0.5) * r.w * 0.4,
                r.cy + (Math.random() - 0.5) * r.h * 0.4,
                now
              );
              a.lastFire = now;
            }
          } else if (firing) {
            // no targets but user is holding — suppression fire toward cursor area
            a.target = null;
            if (now - a.lastFire > interval) {
              const spread = 40;
              fireFrom(
                a,
                mouseX + (Math.random() - 0.5) * spread,
                mouseY + (Math.random() - 0.5) * spread,
                now
              );
              a.lastFire = now;
            }
          }
        });
      } else {
        aliens.forEach((a) => {
          a.target = null;
        });
      }

      // auto-respawn after wave clear
      if (alive.length === 0 && respawnTimer === null) {
        respawnTimer = setTimeout(() => {
          respawn(waveRef.current + 1);
          respawnTimer = null;
        }, RESPAWN_DELAY);
      }
      if (alive.length > 0 && respawnTimer !== null) {
        clearTimeout(respawnTimer);
        respawnTimer = null;
      }

      // projectiles + collision
      for (let i = projectiles.length - 1; i >= 0; i--) {
        const p = projectiles[i];
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -20 || p.x > W + 20 || p.y < -20 || p.y > H + 20) {
          projectiles.splice(i, 1);
          continue;
        }
        let hit = false;
        for (const el of alive) {
          if (el.dataset.destroyed === "true") continue;
          const r = rect(el);
          if (p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h) {
            damage(el, p.dmg || 1);
            hit = true;
            break;
          }
        }
        if (hit) projectiles.splice(i, 1);
      }

      // debris physics
      for (let i = debris.length - 1; i >= 0; i--) {
        const d = debris[i];
        d.x += d.vx;
        d.y += d.vy;
        d.vy += 0.22;
        d.life -= 0.018;
        if (d.life <= 0 || d.y > H + 30) debris.splice(i, 1);
      }

      // powerups
      for (let i = powerups.length - 1; i >= 0; i--) {
        const p = powerups[i];
        if (p.picked) {
          powerups.splice(i, 1);
          continue;
        }
        p.life -= 1 / 60;
        if (p.life <= 0) powerups.splice(i, 1);
      }

      // ===== render =====
      ctx.clearRect(0, 0, W, H);

      for (const el of alive) drawHealthBar(el);

      for (const d of debris) {
        ctx.fillStyle = `rgba(52, 211, 153, ${Math.max(d.life, 0)})`;
        ctx.fillRect(d.x - d.size / 2, d.y - d.size / 2, d.size, d.size);
      }

      for (const p of projectiles) {
        ctx.shadowColor = p.color || "#34d399";
        ctx.shadowBlur = 10;
        ctx.fillStyle = p.color || "#bbf7d0";
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(Math.atan2(p.vy, p.vx));
        ctx.beginPath();
        ctx.ellipse(0, 0, 9, 2.8, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      ctx.shadowBlur = 0;

      for (const p of powerups) drawPowerup(p, now);

      aliens.forEach((a) => {
        const bob = Math.sin(now * 0.003 + a.noisePhase) * 4;
        drawSprite(ctx, a.kind, a.x, a.y, a.dir, bob);
      });

      // active power-up halos
      const inTriple = now < tripleUntil;
      const inMega = now < megaUntil;
      const buffs = [
        inRapid && { color: "rgba(52, 211, 153, 0.55)" },
        inTriple && { color: "rgba(34, 211, 238, 0.55)" },
        inMega && { color: "rgba(250, 204, 21, 0.55)" },
      ].filter(Boolean);
      if (buffs.length > 0) {
        ctx.lineWidth = 1.5;
        aliens.forEach((a) => {
          buffs.forEach((b, idx) => {
            ctx.strokeStyle = b.color;
            ctx.beginPath();
            ctx.arc(a.x, a.y, 26 + idx * 5, 0, Math.PI * 2);
            ctx.stroke();
          });
        });
      }

      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      if (respawnTimer !== null) clearTimeout(respawnTimer);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
      window.removeEventListener("blur", onPointerUp);
      const main = document.querySelector(".page");
      if (main) main.style.transform = "";
    };
  }, []);

  return <canvas ref={canvasRef} className="destroyer-canvas" />;
}

export default Destroyer;
