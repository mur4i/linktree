import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useRef } from "react";
import "./Links.css";

const GithubIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
    <path d="M12 .5C5.65.5.5 5.65.5 12.01c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.56v-2c-3.2.7-3.87-1.36-3.87-1.36-.52-1.33-1.27-1.68-1.27-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.75 2.68 1.24 3.34.95.1-.74.4-1.24.73-1.52-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.46.11-3.04 0 0 .97-.31 3.17 1.18a11 11 0 015.78 0c2.2-1.49 3.17-1.18 3.17-1.18.62 1.58.23 2.75.11 3.04.74.81 1.18 1.84 1.18 3.1 0 4.42-2.69 5.39-5.25 5.68.41.36.78 1.06.78 2.15v3.19c0 .31.21.67.8.56C20.21 21.4 23.5 17.09 23.5 12 23.5 5.65 18.35.5 12 .5z" />
  </svg>
);

const DiscordIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
    <path d="M20.32 4.37A19.79 19.79 0 0016.56 3l-.2.36c1.46.36 2.65.93 3.78 1.66a13.65 13.65 0 00-8.14-1.16 13.65 13.65 0 00-8.13 1.16c1.13-.73 2.31-1.3 3.78-1.66L7.45 3a19.79 19.79 0 00-3.76 1.37C1.39 8.16.83 11.85 1.1 15.49a19.93 19.93 0 005.98 3.02l1.18-1.65a13.05 13.05 0 01-2.06-.99c.17-.13.34-.26.5-.4a13.92 13.92 0 0014.6 0c.17.14.34.27.5.4a13.05 13.05 0 01-2.06.99l1.18 1.65a19.93 19.93 0 005.98-3.02c.27-3.64-.29-7.33-2.58-11.12zM8.85 13.83c-.95 0-1.74-.86-1.74-1.92 0-1.06.78-1.93 1.74-1.93.96 0 1.74.87 1.74 1.93 0 1.06-.78 1.92-1.74 1.92zm6.3 0c-.96 0-1.74-.86-1.74-1.92 0-1.06.78-1.93 1.74-1.93.96 0 1.74.87 1.74 1.93 0 1.06-.78 1.92-1.74 1.92z" />
  </svg>
);

const ControllerIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="6" y1="11" x2="10" y2="11" />
    <line x1="8" y1="9" x2="8" y2="13" />
    <line x1="15" y1="12" x2="15.01" y2="12" />
    <line x1="18" y1="10" x2="18.01" y2="10" />
    <path d="M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.545-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0 0 17.32 5z" />
  </svg>
);

const CalendarIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const ArrowIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="7" y1="17" x2="17" y2="7" />
    <polyline points="7 7 17 7 17 17" />
  </svg>
);

const links = [
  { id: "github", label: "GitHub", url: "https://github.com/mur4i", Icon: GithubIcon, external: true },
  { id: "discord", label: "Discord", url: "https://discord.com/users/600843526825181219", Icon: DiscordIcon, external: true },
  { id: "mri-qbox-br", label: "MRI QBOX BRASIL", url: "https://discord.gg/uEfGD4mmVh", Icon: ControllerIcon, external: true },
  { id: "schedule", label: "Schedule a call", url: "https://calendly.com/mur444i/consultoria", Icon: CalendarIcon, external: true },
];

const navVar = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const itemVar = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};

function MagneticLink({ href, target, rel, Icon, label }) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-40, 40], [6, -6]);
  const rotateY = useTransform(x, [-40, 40], [-6, 6]);
  const springX = useSpring(x, { stiffness: 180, damping: 14 });
  const springY = useSpring(y, { stiffness: 180, damping: 14 });

  const handleMove = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const mx = e.clientX - rect.left - rect.width / 2;
    const my = e.clientY - rect.top - rect.height / 2;
    x.set(mx * 0.18);
    y.set(my * 0.18);
    ref.current.style.setProperty("--glow-x", `${e.clientX - rect.left}px`);
    ref.current.style.setProperty("--glow-y", `${e.clientY - rect.top}px`);
  };

  const handleLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.a
      ref={ref}
      href={href}
      target={target}
      rel={rel}
      className="link"
      variants={itemVar}
      style={{
        x: springX,
        y: springY,
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
        transformPerspective: 800,
      }}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
    >
      <span className="link__glow" aria-hidden="true" />
      <span className="link__icon" aria-hidden="true">
        <Icon />
      </span>
      <span className="link__label">{label}</span>
      <span className="link__arrow" aria-hidden="true">
        <ArrowIcon />
      </span>
    </motion.a>
  );
}

function Links() {
  return (
    <motion.nav className="links" variants={navVar} aria-label="Profile links">
      {links.map(({ id, label, url, Icon, external }) => (
        <MagneticLink
          key={id}
          href={url}
          label={label}
          Icon={Icon}
          target={external ? "_blank" : undefined}
          rel={external ? "noopener noreferrer" : undefined}
        />
      ))}
    </motion.nav>
  );
}

export default Links;
