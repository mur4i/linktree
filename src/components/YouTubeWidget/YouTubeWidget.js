import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import "./YouTubeWidget.css";

const VIDEO_ID = "ca_cKWWzZgs";
const PLAYLIST_ID = "RDca_cKWWzZgs";

let scriptLoading = null;
function loadYT() {
  if (window.YT && window.YT.Player) return Promise.resolve(window.YT);
  if (scriptLoading) return scriptLoading;
  scriptLoading = new Promise((resolve) => {
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (prev) prev();
      resolve(window.YT);
    };
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(tag);
  });
  return scriptLoading;
}

const cardVar = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};

function fmt(secs) {
  if (!isFinite(secs)) return "--:--";
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function YouTubeWidget() {
  const hostRef = useRef(null);
  const playerRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [info, setInfo] = useState({ title: "loading…", author: "", thumb: "" });
  const [time, setTime] = useState({ current: 0, duration: 0 });
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(30);
  const volumeRef = useRef(30);

  const refreshMeta = (player) => {
    try {
      const data = player.getVideoData();
      if (data && data.title) {
        setInfo({
          title: data.title,
          author: data.author || "",
          thumb: `https://img.youtube.com/vi/${data.video_id || VIDEO_ID}/mqdefault.jpg`,
        });
      }
    } catch (e) {
      /* ignore */
    }
  };

  useEffect(() => {
    let cancelled = false;
    let pollInterval;
    let pendingStart = false;

    const startPlayback = () => {
      if (!playerRef.current) {
        pendingStart = true;
        return;
      }
      try {
        playerRef.current.unMute();
        playerRef.current.setVolume(volumeRef.current);
        playerRef.current.playVideo();
        setMuted(false);
      } catch (e) {
        /* ignore */
      }
    };

    const firstClickHandler = () => startPlayback();
    window.addEventListener("pointerdown", firstClickHandler, { once: true });

    loadYT().then((YT) => {
      if (cancelled || !hostRef.current) return;
      const p = new YT.Player(hostRef.current, {
        height: "0",
        width: "0",
        videoId: VIDEO_ID,
        playerVars: {
          listType: "playlist",
          list: PLAYLIST_ID,
          autoplay: 0,
          mute: 0,
          controls: 0,
          modestbranding: 1,
          rel: 0,
          iv_load_policy: 3,
          playsinline: 1,
        },
        events: {
          onReady: () => {
            playerRef.current = p;
            refreshMeta(p);
            if (pendingStart) {
              pendingStart = false;
              startPlayback();
            }
          },
          onStateChange: (e) => {
            setPlaying(e.data === YT.PlayerState.PLAYING);
            refreshMeta(p);
          },
        },
      });

      pollInterval = setInterval(() => {
        if (!playerRef.current) return;
        try {
          const c = playerRef.current.getCurrentTime();
          const d = playerRef.current.getDuration();
          setTime({ current: c || 0, duration: d || 0 });
        } catch (e) {
          /* ignore */
        }
      }, 500);
    });

    return () => {
      cancelled = true;
      if (pollInterval) clearInterval(pollInterval);
      window.removeEventListener("pointerdown", firstClickHandler);
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch (e) {
          /* ignore */
        }
      }
    };
  }, []);

  const togglePlay = (e) => {
    e.stopPropagation();
    if (!playerRef.current) return;
    if (playing) {
      playerRef.current.pauseVideo();
    } else {
      try {
        playerRef.current.unMute();
        setMuted(false);
      } catch (err) {
        /* ignore */
      }
      playerRef.current.playVideo();
    }
  };

  const nextTrack = (e) => {
    e.stopPropagation();
    try {
      playerRef.current?.nextVideo();
    } catch (err) {
      /* ignore */
    }
  };

  const prevTrack = (e) => {
    e.stopPropagation();
    try {
      playerRef.current?.previousVideo();
    } catch (err) {
      /* ignore */
    }
  };

  const onVolumeChange = (e) => {
    e.stopPropagation();
    const v = Number(e.target.value);
    setVolume(v);
    volumeRef.current = v;
    if (!playerRef.current) return;
    try {
      playerRef.current.setVolume(v);
      if (v > 0 && muted) {
        playerRef.current.unMute();
        setMuted(false);
      }
    } catch (err) {
      /* ignore */
    }
  };

  const toggleMute = (e) => {
    e.stopPropagation();
    if (!playerRef.current) return;
    try {
      if (muted) {
        playerRef.current.unMute();
        if (volume === 0) {
          setVolume(30);
          volumeRef.current = 30;
          playerRef.current.setVolume(30);
        } else {
          playerRef.current.setVolume(volume);
        }
        setMuted(false);
      } else {
        playerRef.current.mute();
        setMuted(true);
      }
    } catch (err) {
      /* ignore */
    }
  };

  const onSeek = (e) => {
    e.stopPropagation();
    if (!playerRef.current || !time.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, x / rect.width));
    try {
      playerRef.current.seekTo(ratio * time.duration, true);
    } catch (err) {
      /* ignore */
    }
  };

  const pct = time.duration ? (time.current / time.duration) * 100 : 0;

  return (
    <motion.section className="card yt-player" variants={cardVar}>
      <span className="hud-corner hud-corner--tl" aria-hidden="true" />
      <span className="hud-corner hud-corner--tr" aria-hidden="true" />
      <span className="hud-corner hud-corner--bl" aria-hidden="true" />
      <span className="hud-corner hud-corner--br" aria-hidden="true" />

      <div className="yt-player__head">
        <div className="yt-player__thumb">
          {info.thumb && <img src={info.thumb} alt="" />}
        </div>
        <div className="yt-player__meta">
          <p className="card__label mono">
            {"// NOW PLAYING"}
            {!playing && <span className="yt-player__hint"> · tap anywhere to play</span>}
          </p>
          <p className="yt-player__title">{info.title}</p>
          <p className="yt-player__author">{info.author}</p>
        </div>
      </div>

      <div className="yt-player__progress" onClick={onSeek}>
        <div className="yt-player__bar" style={{ width: `${pct}%` }} />
      </div>

      <div className="yt-player__controls">
        <span className="yt-player__time mono">{fmt(time.current)}</span>
        <div className="yt-player__buttons">
          <button
            type="button"
            className="yt-player__btn"
            onClick={prevTrack}
            onPointerDown={(e) => e.stopPropagation()}
            aria-label="Previous"
          >
            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true">
              <path d="M6 4h2v16H6zm12 0L8.5 12 18 20z" />
            </svg>
          </button>
          <button
            type="button"
            className="yt-player__btn yt-player__play"
            onClick={togglePlay}
            onPointerDown={(e) => e.stopPropagation()}
            aria-label={playing ? "Pause" : "Play"}
          >
            {playing ? (
              <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true">
                <path d="M6 5h4v14H6zm8 0h4v14h-4z" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>
          <button
            type="button"
            className="yt-player__btn"
            onClick={nextTrack}
            onPointerDown={(e) => e.stopPropagation()}
            aria-label="Next"
          >
            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true">
              <path d="M6 4l9.5 8L6 20zm10 0h2v16h-2z" />
            </svg>
          </button>
        </div>
        <span className="yt-player__time mono">{fmt(time.duration)}</span>
      </div>

      <div className="yt-player__volume" onPointerDown={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="yt-player__mute"
          onClick={toggleMute}
          onPointerDown={(e) => e.stopPropagation()}
          aria-label={muted ? "Unmute" : "Mute"}
        >
          {muted || volume === 0 ? (
            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true">
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.59 6L19 12.59 21.41 15l1.41-1.41L20.41 11l2.41-2.41L21.41 7 19 9.41 16.59 7 15.18 8.41 17.59 11l-2.41 2.41z" />
            </svg>
          ) : volume < 50 ? (
            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true">
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true">
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
            </svg>
          )}
        </button>
        <input
          type="range"
          min="0"
          max="100"
          value={muted ? 0 : volume}
          onChange={onVolumeChange}
          onClick={(e) => e.stopPropagation()}
          style={{ "--vol": `${muted ? 0 : volume}%` }}
          className="yt-player__slider"
          aria-label="Volume"
        />
        <span className="yt-player__vol-num mono">{muted ? 0 : volume}</span>
      </div>

      <div
        ref={hostRef}
        aria-hidden="true"
        style={{
          position: "absolute",
          left: "-9999px",
          width: 0,
          height: 0,
          overflow: "hidden",
          visibility: "hidden",
          pointerEvents: "none",
        }}
      />
    </motion.section>
  );
}

export default YouTubeWidget;
