"use client";

import { forwardRef, useEffect, useMemo } from "react";
import { BlendFunction, Effect } from "postprocessing";
import {
  CanvasTexture,
  ClampToEdgeWrapping,
  Color,
  LinearFilter,
  Uniform,
  Vector2,
  Vector3,
  type Texture,
  type WebGLRenderer,
} from "three";

const TERMINAL_SYMBOLS = [
  ".",
  ":",
  "-",
  "=",
  "+",
  "*",
  "#",
  "%",
  "@",
  "0",
  "O",
  "N",
  "M",
  "W",
  "B",
  "X",
];

function createGlyphTexture(
  characters: string[],
  size = 64,
  font = "62px monospace",
) {
  if (characters.length === 0) return null;
  const canvas = document.createElement("canvas");
  canvas.width = size * characters.length;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#fff";
  ctx.font = font;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  for (let i = 0; i < characters.length; i++) {
    ctx.fillText(characters[i], i * size + size / 2, size / 2);
  }

  const texture = new CanvasTexture(canvas);
  texture.needsUpdate = true;
  texture.minFilter = LinearFilter;
  texture.magFilter = LinearFilter;
  texture.wrapS = ClampToEdgeWrapping;
  texture.wrapT = ClampToEdgeWrapping;
  return texture;
}

const fragmentShader = `
uniform float cellSize;
uniform bool invert;
uniform bool colorMode;
uniform vec2 resolution;
uniform sampler2D glyphAtlas;
uniform float glyphTiles;
uniform bool useGlyphAtlas;
uniform bool volumeShading;
uniform bool useTintColor;
uniform vec3 tintColor;
uniform bool lightTheme;
uniform vec3 paperColor;
uniform float brightnessAdjust;
uniform float contrastAdjust;

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
  vec2 cellCount = resolution / cellSize;
  vec2 cellCoord = floor(uv * cellCount);
  vec2 cellUV = (cellCoord + 0.5) / cellCount;
  vec4 cellColor = texture(inputBuffer, cellUV);

  float rawLuminance = dot(cellColor.rgb, vec3(0.299, 0.587, 0.114));
  cellColor.rgb = (cellColor.rgb - 0.5) * contrastAdjust + 0.5 + brightnessAdjust;
  float brightness = dot(cellColor.rgb, vec3(0.299, 0.587, 0.114));

  if (invert) brightness = 1.0 - brightness;

  float brightnessForGlyph = brightness;
  if (volumeShading) {
    brightnessForGlyph = clamp((brightness - 0.5) * 1.6 + 0.5, 0.0, 1.0);
  }

  float emptyThreshold = volumeShading ? 0.006 : 0.08;
  vec2 localUV = fract(uv * cellCount);
  float charValue;
  bool isBackground = rawLuminance < 0.006;

  if (isBackground || brightness < emptyThreshold) {
    charValue = 0.0;
  } else if (useGlyphAtlas && glyphTiles > 0.0) {
    float tile = clamp(floor(brightnessForGlyph * glyphTiles), 0.0, glyphTiles - 1.0);
    float inset = 0.02;
    vec2 inner = vec2(inset + localUV.x * (1.0 - 2.0 * inset), inset + localUV.y * (1.0 - 2.0 * inset));
    vec2 glyphUV = vec2((tile + inner.x) / glyphTiles, inner.y);
    charValue = texture(glyphAtlas, glyphUV).r;
  } else {
    charValue = 0.0;
  }

  vec3 glyphColor = useTintColor ? tintColor : (colorMode ? cellColor.rgb : vec3(brightness));
  vec3 finalColor = lightTheme
    ? mix(paperColor, glyphColor, charValue)
    : glyphColor * charValue;

  outputColor = vec4(finalColor, 1.0);
}
`;

let currentCellSize = 7;
let currentInvert = true;
let currentResolution = new Vector2(1920, 1080);

interface AsciiEffectImplOptions {
  cellSize: number;
  invert: boolean;
  color: boolean;
  resolution: Vector2;
  glyphAtlas: Texture | null;
  glyphTiles: number;
  volumeShading: boolean;
  tintColor: Vector3 | null;
  paperColor: Vector3;
  contrastAdjust: number;
  brightnessAdjust: number;
}

class AsciiEffectImpl extends Effect {
  constructor(options: AsciiEffectImplOptions) {
    super("AsciiEffect", fragmentShader, {
      blendFunction: BlendFunction.NORMAL,
      uniforms: new Map<string, Uniform>([
        ["cellSize", new Uniform(options.cellSize)],
        ["invert", new Uniform(options.invert)],
        ["colorMode", new Uniform(options.color)],
        ["resolution", new Uniform(options.resolution)],
        ["glyphAtlas", new Uniform(options.glyphAtlas)],
        ["glyphTiles", new Uniform(options.glyphTiles)],
        ["useGlyphAtlas", new Uniform(!!options.glyphAtlas)],
        ["volumeShading", new Uniform(options.volumeShading)],
        ["useTintColor", new Uniform(!!options.tintColor)],
        ["tintColor", new Uniform(options.tintColor || new Vector3(1, 1, 1))],
        ["lightTheme", new Uniform(true)],
        ["paperColor", new Uniform(options.paperColor)],
        ["contrastAdjust", new Uniform(options.contrastAdjust)],
        ["brightnessAdjust", new Uniform(options.brightnessAdjust)],
      ]) as Map<string, Uniform>,
    });

    currentCellSize = options.cellSize;
    currentInvert = options.invert;
    currentResolution = options.resolution;
  }

  update(renderer: WebGLRenderer) {
    const ctx = renderer.getContext();
    if (!ctx || (ctx as WebGLRenderingContext).isContextLost?.()) return;
    this.uniforms.get("cellSize")!.value = currentCellSize;
    this.uniforms.get("invert")!.value = currentInvert;
    this.uniforms.get("resolution")!.value = currentResolution;
  }
}

export interface AsciiEffectProps {
  cellSize?: number;
  invert?: boolean;
  color?: boolean;
  resolution?: Vector2;
  volumeShading?: boolean;
  tintColor?: string;
  paperColor?: string;
  contrastAdjust?: number;
  brightnessAdjust?: number;
}

function toVec3(hex: string) {
  const color = new Color(hex);
  return new Vector3(color.r, color.g, color.b);
}

export const AsciiEffect = forwardRef<unknown, AsciiEffectProps>(
  (props, ref) => {
    const {
      cellSize = 7,
      invert = true,
      color = true,
      resolution = new Vector2(1920, 1080),
      volumeShading = true,
      tintColor = "#3c3089",
      paperColor = "#fdfdf8",
      contrastAdjust = 1.8,
      brightnessAdjust = 0,
    } = props;

    const glyphTexture = useMemo(() => createGlyphTexture(TERMINAL_SYMBOLS), []);

    currentCellSize = cellSize;
    currentInvert = invert;
    currentResolution = resolution;

    const effect = useMemo(
      () =>
        new AsciiEffectImpl({
          cellSize,
          invert,
          color,
          resolution,
          glyphAtlas: glyphTexture,
          glyphTiles: glyphTexture ? TERMINAL_SYMBOLS.length : 0,
          volumeShading,
          tintColor: toVec3(tintColor),
          paperColor: toVec3(paperColor),
          contrastAdjust,
          brightnessAdjust,
        }),
      [
        cellSize,
        invert,
        color,
        resolution,
        glyphTexture,
        volumeShading,
        tintColor,
        paperColor,
        contrastAdjust,
        brightnessAdjust,
      ],
    );

    useEffect(() => () => glyphTexture?.dispose(), [glyphTexture]);

    return <primitive ref={ref} object={effect} dispose={null} />;
  },
);

AsciiEffect.displayName = "AsciiEffect";
