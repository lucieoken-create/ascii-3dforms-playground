"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import {
  MODEL_OPTIONS,
  type ModelKey,
} from "@/app/components/AsciiScene";
import { usePrefersReducedMotion } from "@/app/hooks/usePrefersReducedMotion";

const AsciiScene = dynamic(
  () => import("@/app/components/AsciiScene").then((module) => module.AsciiScene),
  {
    ssr: false,
    loading: () => <ArtifactPlaceholder />,
  },
);

type ColorOption = {
  key: string;
  label: string;
  value: string;
};

type BackgroundKey = "white" | "black";

type ArtifactProps = {
  initialModelParam?: string;
  initialColorParam?: string;
  initialBackgroundParam?: string;
};

const COLOR_OPTIONS: ColorOption[] = [
  { key: "medium-slate-blue", label: "Slate", value: "#826aed" },
  { key: "mauve-magic", label: "Magic", value: "#c879ff" },
  { key: "mauve", label: "Mauve", value: "#ffb7ff" },
  { key: "cyan-glow", label: "Cyan", value: "#3bf4fb" },
  { key: "lime-cream", label: "Lime", value: "#caff8a" },
];

const BACKGROUNDS: Record<BackgroundKey, { label: string; paper: string }> = {
  white: { label: "White", paper: "#ffffff" },
  black: { label: "Black", paper: "#050505" },
};

function resolveInitialModel(model?: string): ModelKey {
  const migrations: Record<string, ModelKey> = {
    deadRose: "rose",
    embreea: "orchid",
    fishBox: "fish",
    ladybird: "ladybug",
  };
  const migrated = model ? migrations[model] : undefined;
  if (migrated) return migrated;
  return MODEL_OPTIONS.some((option) => option.key === model)
    ? (model as ModelKey)
    : "bust";
}

function resolveInitialColor(color?: string) {
  return COLOR_OPTIONS.find((option) => option.key === color) ?? COLOR_OPTIONS[0];
}

function resolveInitialBackground(background?: string): BackgroundKey {
  return background === "black" ? "black" : "white";
}

function pickRandom<T>(items: readonly T[]) {
  return items[Math.floor(Math.random() * items.length)];
}

function pickDifferent<T>(items: readonly T[], current: T) {
  const candidates = items.filter((item) => item !== current);
  return pickRandom(candidates.length > 0 ? candidates : items);
}

function detectWebGL() {
  if (typeof document === "undefined") return true;
  try {
    const canvas = document.createElement("canvas");
    return !!(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

function ArtifactPlaceholder() {
  return (
    <div className="artifact-placeholder" aria-hidden="true">
      <div />
    </div>
  );
}

function WebGLFallback() {
  return (
    <div className="webgl-fallback" role="img" aria-label="ASCII sculpture preview">
      <pre>{`
        .:-=+*#%@0ONMWBX
     .:-=+*#%@0ONMWBXBX
   .:-=+*#%@0ONMWBXBXBX
  .:-=+*#%@0ONMWBXBXBXBX
   .:-=+*#%@0ONMWBXBXBX
     .:-=+*#%@0ONMWBXBX
        .:-=+*#%@0ONMWBX
      `}</pre>
    </div>
  );
}

export function Artifact({
  initialModelParam,
  initialColorParam,
  initialBackgroundParam,
}: ArtifactProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [model, setModel] = useState<ModelKey>(() =>
    resolveInitialModel(initialModelParam),
  );
  const [color, setColor] = useState<ColorOption>(() =>
    resolveInitialColor(initialColorParam),
  );
  const [background, setBackground] = useState<BackgroundKey>(() =>
    resolveInitialBackground(initialBackgroundParam),
  );
  const [spin, setSpin] = useState(true);
  const [ready, setReady] = useState(false);
  const [hasWebGL] = useState(detectWebGL);

  useEffect(() => {
    const params = new URLSearchParams();
    params.set("model", model);
    params.set("color", color.key);
    params.set("background", background);
    window.history.replaceState(null, "", `?${params.toString()}`);
  }, [model, color, background]);

  useEffect(() => {
    const fallback = window.setTimeout(() => setReady(true), 5200);
    return () => window.clearTimeout(fallback);
  }, [model]);

  const activeModel = useMemo(
    () => MODEL_OPTIONS.find((option) => option.key === model),
    [model],
  );

  const reducedMotion = prefersReducedMotion || !spin;

  const randomizeArtifact = () => {
    const nextModel = pickDifferent(
      MODEL_OPTIONS.map((option) => option.key),
      model,
    );
    const nextColor = pickDifferent(COLOR_OPTIONS, color);
    const nextBackground = pickDifferent(
      Object.keys(BACKGROUNDS) as BackgroundKey[],
      background,
    );

    if (nextModel !== model) setReady(false);
    setModel(nextModel);
    setColor(nextColor);
    setBackground(nextBackground);
  };

  return (
    <main className={`artifact-shell theme-${background}`}>
      <section
        className="hero-panel"
        aria-labelledby="artifact-title"
        style={
          {
            "--glyph-color": color.value,
            "--stage-paper": BACKGROUNDS[background].paper,
          } as React.CSSProperties
        }
      >
        <div className="intro">
          <p className="artifact-code">artifact / ascii-3dforms</p>
          <h1 id="artifact-title">Hey, it&apos;s a model playground.</h1>
          <p className="intro-copy">
            Experiment with the colors, backgrounds, and model shapes. The world
            is your oyster.
          </p>
        </div>

        <div className="stage-wrap">
          <div className="stage">
            {hasWebGL ? (
              <div className={ready ? "scene is-ready" : "scene"}>
                <AsciiScene
                  key={model}
                  modelKey={model}
                  glyphColor={color.value}
                  paperColor={BACKGROUNDS[background].paper}
                  reducedMotion={reducedMotion}
                  onReady={() => setReady(true)}
                />
              </div>
            ) : (
              <WebGLFallback />
            )}
          </div>
        </div>

        <aside className="control-rail" aria-label="Artifact controls">
          <div className="control-group">
            <p className="control-label">Model</p>
            <select
              className="select-control"
              aria-label="Choose model"
              value={model}
              onChange={(event) => {
                const nextModel = event.target.value as ModelKey;
                if (nextModel !== model) setReady(false);
                setModel(nextModel);
              }}
            >
              {MODEL_OPTIONS.map((option) => (
                <option
                  key={option.key}
                  value={option.key}
                >
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="control-group">
            <p className="control-label">Color</p>
            <div className="swatches" aria-label="Choose glyph color">
              {COLOR_OPTIONS.map((option) => (
                <button
                  key={option.key}
                  type="button"
                  className={option.key === color.key ? "is-active" : ""}
                  aria-label={option.label}
                  aria-pressed={option.key === color.key}
                  onClick={() => setColor(option)}
                >
                  <span style={{ background: option.value }} />
                </button>
              ))}
            </div>
          </div>

          <div className="control-group">
            <p className="control-label">Background</p>
            <div className="segmented compact" role="group" aria-label="Choose background">
              {(Object.keys(BACKGROUNDS) as BackgroundKey[]).map((key) => (
                <button
                  key={key}
                  type="button"
                  className={key === background ? "is-active" : ""}
                  aria-pressed={key === background}
                  onClick={() => setBackground(key)}
                >
                  {BACKGROUNDS[key].label}
                </button>
              ))}
            </div>
          </div>

          <label className="switch">
            <span>Spin</span>
            <input
              type="checkbox"
              checked={spin && !prefersReducedMotion}
              disabled={prefersReducedMotion}
              onChange={(event) => setSpin(event.target.checked)}
            />
            <span className="switch-track" aria-hidden="true" />
          </label>

          <button
            type="button"
            className="randomize-button"
            onClick={randomizeArtifact}
          >
            Randomize
          </button>

          <div className="readout" aria-live="polite">
            <span>{activeModel?.label}</span>
            <span>{color.label}</span>
            <span>{BACKGROUNDS[background].label}</span>
          </div>
        </aside>
      </section>
    </main>
  );
}
