"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getOrganizationSettings, updateOrganizationTheme, type ThemeScope } from "@/lib/api/admin.api";
import {
  ACCENT_SWATCHES,
  CORNER_STYLES,
  DEFAULT_STORE_THEME,
  FONT_OPTIONS,
  HEADING_SCALES,
  MONO_FONT_OPTIONS,
  SECTION_SPACINGS,
  STYLE_PRESETS,
  TYPE_SCALES,
} from "@/lib/theme/presets";
import { contrastWarnings } from "@/lib/theme/contrast";
import type { FontKey, MonoFontKey, StoreThemeConfig } from "@/lib/theme/types";

const HEX_RE = /^#[0-9a-fA-F]{6}$/;

type ColorKey =
  | "accent"
  | "accentSoft"
  | "accentInk"
  | "secondary"
  | "secondarySoft"
  | "background"
  | "surface"
  | "ink"
  | "inkSoft"
  | "line";

const BRAND_COLORS: { key: ColorKey; label: string; hint: string }[] = [
  { key: "accent", label: "Accent", hint: "buttons, links, highlights" },
  { key: "accentSoft", label: "Accent wash", hint: "soft fills behind accent elements" },
  { key: "accentInk", label: "Accent text", hint: "text sitting on the accent colour" },
  { key: "secondary", label: "Secondary", hint: "badges, secondary actions" },
  { key: "secondarySoft", label: "Secondary wash", hint: "soft fills for secondary elements" },
];

const CANVAS_COLORS: { key: ColorKey; label: string; hint: string }[] = [
  { key: "background", label: "Page background", hint: "the page canvas" },
  { key: "surface", label: "Card surface", hint: "cards, panels, inputs" },
  { key: "ink", label: "Text", hint: "headings and body copy" },
  { key: "inkSoft", label: "Muted text", hint: "captions, meta, placeholders" },
  { key: "line", label: "Borders", hint: "dividers and card outlines" },
];

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-ink-soft">{children}</p>
  );
}

/** Small segmented picker used for every bounded structural knob. */
function Segmented<T extends string | number>({
  options,
  value,
  onChange,
  ariaLabel,
}: {
  options: { value: T; label: string; hint?: string }[];
  value: T;
  onChange: (v: T) => void;
  ariaLabel: string;
}) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label={ariaLabel}>
      {options.map((o) => (
        <button
          key={String(o.value)}
          type="button"
          onClick={() => onChange(o.value)}
          aria-pressed={value === o.value}
          title={o.hint}
          className="rounded-full border px-4 py-2 font-mono text-[11px] uppercase tracking-[0.08em] transition-colors"
          style={{
            borderColor: value === o.value ? "var(--accent)" : "var(--line)",
            background: value === o.value ? "var(--accent-soft)" : "transparent",
            color: value === o.value ? "var(--accent)" : "var(--ink)",
          }}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/** Colour picker + hex field pair. Only valid 6-digit hex commits to the draft. */
function ColorField({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint: string;
  value: string;
  onChange: (hex: string) => void;
}) {
  const [text, setText] = useState(value);
  useEffect(() => setText(value), [value]);

  return (
    <div className="flex items-center gap-3 rounded-[var(--radius-md)] border border-line px-3 py-2.5">
      <input
        type="color"
        aria-label={`${label} colour picker`}
        value={HEX_RE.test(value) ? value : "#000000"}
        onChange={(e) => onChange(e.target.value)}
        className="size-8 shrink-0 cursor-pointer rounded-[6px] border border-line bg-transparent p-0.5"
      />
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-medium text-ink">{label}</p>
        <p className="truncate text-[11px] text-ink-soft">{hint}</p>
      </div>
      <input
        value={text}
        onChange={(e) => {
          const v = e.target.value.trim();
          setText(v);
          if (HEX_RE.test(v)) onChange(v);
        }}
        onBlur={() => setText(value)}
        spellCheck={false}
        className="w-[86px] shrink-0 rounded-[var(--radius-sm)] border border-line bg-surface px-2 py-1.5 font-mono text-[12px] text-ink outline-none focus:border-accent"
        aria-label={`${label} hex value`}
      />
    </div>
  );
}

/**
 * True live preview: an iframe rendering the REAL storefront or dashboard,
 * with the draft theme posted into it. The theme scopes inside the iframe
 * apply the draft for that window only — the live surfaces never see an
 * unsaved draft.
 */
function LivePreview({ surface, draft }: { surface: ThemeScope; draft: StoreThemeConfig }) {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.32);
  const [loaded, setLoaded] = useState(false);

  // Full-size preview window, kept in sync with the draft while it's open.
  const popupRef = useRef<Window | null>(null);
  const popupTimer = useRef<number | null>(null);
  const [popupBlocked, setPopupBlocked] = useState(false);
  const draftRef = useRef(draft);
  draftRef.current = draft;

  const FRAME_W = 1280;
  const FRAME_H = 900;

  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const update = () => setScale(el.clientWidth / FRAME_W);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const post = useCallback(() => {
    const msg = { type: "THEME_PREVIEW", surface, theme: draft };
    frameRef.current?.contentWindow?.postMessage(msg, window.location.origin);
    if (popupRef.current && !popupRef.current.closed) {
      popupRef.current.postMessage(msg, window.location.origin);
    }
  }, [surface, draft]);

  // Re-post whenever the draft changes (and once the frame is loaded).
  useEffect(() => {
    if (loaded) post();
  }, [loaded, post]);

  const openFullPreview = () => {
    const w = window.open(
      surface === "store" ? "/" : "/admin",
      `theme-preview-${surface}`,
      "popup=yes,width=1280,height=900",
    );
    // Guard: some embedded browsers reuse the current tab instead of opening
    // a window — never burst-post the draft into our own document.
    if (!w || w === window) {
      setPopupBlocked(true);
      return;
    }
    setPopupBlocked(false);
    popupRef.current = w;
    // The fresh document can only apply the draft once its theme scope has
    // mounted its message listener — burst-post for a few seconds (reading
    // the live draft from a ref so a mid-burst edit is never overwritten by
    // a stale copy), then draft changes keep flowing through post().
    if (popupTimer.current) window.clearInterval(popupTimer.current);
    const started = Date.now();
    popupTimer.current = window.setInterval(() => {
      if (w.closed || Date.now() - started > 15_000) {
        if (popupTimer.current) window.clearInterval(popupTimer.current);
        popupTimer.current = null;
        return;
      }
      w.postMessage(
        { type: "THEME_PREVIEW", surface, theme: draftRef.current },
        window.location.origin,
      );
    }, 400);
  };

  useEffect(
    () => () => {
      if (popupTimer.current) window.clearInterval(popupTimer.current);
    },
    [],
  );

  return (
    <div>
      <div
        ref={boxRef}
        className="relative overflow-hidden rounded-[var(--radius-lg)] border border-line bg-bone"
        style={{ height: FRAME_H * scale }}
      >
      {/* Absolutely positioned so the frame's unscaled 1280px layout width
          never propagates into the page (transform only scales visually).
          Fully interactive: scroll, click, and navigate inside the preview.
          Client-side navigations keep the injected draft (the iframe's React
          state survives); hard loads re-fire onLoad, which re-posts it. */}
      <iframe
        ref={frameRef}
        src={surface === "store" ? "/" : "/admin"}
        title={surface === "store" ? "Storefront preview" : "Admin panel preview"}
        onLoad={() => {
          setLoaded(true);
          post();
        }}
        className="absolute left-0 top-0 origin-top-left border-0"
        style={{ width: FRAME_W, height: FRAME_H, transform: `scale(${scale})` }}
      />
      </div>
      <button
        type="button"
        onClick={openFullPreview}
        className="mt-2 font-mono text-[11px] uppercase tracking-[0.1em] text-accent transition-opacity hover:opacity-75"
      >
        Open in new window ↗
      </button>
      {popupBlocked && (
        <p className="mt-1 text-[12px] text-danger">
          The browser blocked the preview window — allow pop-ups for this site and try again.
        </p>
      )}
    </div>
  );
}

/**
 * Admin › Settings › Theme — the theme studio. Full control over how the
 * storefront and the admin panel each look, edited as two independent
 * themes with a real rendered live preview. Storefront saves to
 * organization.settings.theme (public via /storefront/store-config); the
 * admin panel saves to organization.settings.adminTheme (staff-only).
 * Drafts only take effect for real on Save.
 */
export function ThemeCustomizer() {
  const queryClient = useQueryClient();
  const settingsQuery = useQuery({
    queryKey: ["admin-organization-settings"],
    queryFn: getOrganizationSettings,
    retry: 0,
  });

  const [scope, setScope] = useState<ThemeScope>("store");

  const savedByScope: Record<ThemeScope, StoreThemeConfig> = useMemo(
    () => ({
      store: { ...DEFAULT_STORE_THEME, ...(settingsQuery.data?.theme ?? {}) },
      admin: { ...DEFAULT_STORE_THEME, ...(settingsQuery.data?.adminTheme ?? {}) },
    }),
    [settingsQuery.data],
  );

  const [drafts, setDrafts] = useState<Record<ThemeScope, StoreThemeConfig>>({
    store: DEFAULT_STORE_THEME,
    admin: DEFAULT_STORE_THEME,
  });
  useEffect(() => {
    if (settingsQuery.isSuccess) setDrafts(savedByScope);
  }, [settingsQuery.isSuccess, savedByScope]);

  const draft = drafts[scope];
  const saved = savedByScope[scope];

  const mutation = useMutation({
    mutationFn: (input: StoreThemeConfig) => updateOrganizationTheme(scope, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-organization-settings"] });
      queryClient.invalidateQueries({ queryKey: ["store-config"] });
    },
  });

  const dirty = JSON.stringify(draft) !== JSON.stringify(saved);
  const warnings = useMemo(() => contrastWarnings(draft), [draft]);

  const set = <K extends keyof StoreThemeConfig>(key: K, value: StoreThemeConfig[K]) => {
    mutation.reset();
    setDrafts((d) => ({ ...d, [scope]: { ...d[scope], [key]: value } }));
  };

  const applyPreset = (theme: Partial<StoreThemeConfig>) => {
    mutation.reset();
    setDrafts((d) => ({ ...d, [scope]: { ...d[scope], ...theme } }));
  };

  const switchScope = (next: ThemeScope) => {
    mutation.reset();
    setScope(next);
  };

  return (
    <div>
      {/* Scope switcher */}
      <div className="inline-flex rounded-full border border-line p-1">
        {(
          [
            ["store", "Storefront"],
            ["admin", "Admin panel"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => switchScope(key)}
            aria-pressed={scope === key}
            className="rounded-full px-5 py-2 font-mono text-[11px] uppercase tracking-[0.1em] transition-colors"
            style={{
              background: scope === key ? "var(--accent)" : "transparent",
              color: scope === key ? "var(--accent-ink)" : "var(--ink-soft)",
            }}
          >
            {label}
          </button>
        ))}
      </div>
      <p className="mt-2 text-[12px] text-ink-soft">
        {scope === "store"
          ? "What your customers see. Saved themes go live on the storefront instantly."
          : "Your own dashboard's look — customers never see this. Applies to everyone on your staff."}
      </p>

      <div className="mt-6 grid gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(300px,420px)]">
        <div className="space-y-8">
          {settingsQuery.isError && (
            <p className="rounded-[var(--radius-md)] border border-line bg-surface px-4 py-3 text-[13px] text-ink-soft">
              Couldn&apos;t reach the backend — showing the default theme. Changes can&apos;t be
              saved until the API is back.
            </p>
          )}

          {/* Presets */}
          <div>
            <SectionLabel>Start from a preset</SectionLabel>
            <div className="mt-3 flex flex-wrap gap-2">
              {STYLE_PRESETS.map((p) => (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => applyPreset(p.theme)}
                  title={p.note}
                  className="flex items-center gap-2 rounded-full border border-line px-4 py-2 text-[12px] text-ink transition-colors hover:border-accent"
                >
                  {p.theme.background && (
                    <span
                      className="size-3 rounded-full"
                      style={{ background: p.theme.background, boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.15)" }}
                    />
                  )}
                  <span className="size-3 rounded-full" style={{ background: p.theme.accent }} />
                  <span className="size-3 rounded-full" style={{ background: p.theme.secondary }} />
                  {p.name}
                </button>
              ))}
            </div>
            <p className="mt-2 text-[12px] text-ink-soft">
              Presets set colours, type, and surface treatment — your layout choices stay put.
            </p>
            <div className="mt-3 flex items-center gap-2.5">
              {ACCENT_SWATCHES.map((s) => (
                <button
                  key={s.name}
                  type="button"
                  onClick={() => {
                    set("accent", s.accent);
                    set("accentSoft", s.accentSoft);
                  }}
                  aria-label={`Accent ${s.name}`}
                  title={s.name}
                  className="size-7 rounded-full transition-transform hover:scale-110"
                  style={{
                    background: s.accent,
                    boxShadow:
                      draft.accent === s.accent
                        ? "0 0 0 2px var(--bone), 0 0 0 3.5px var(--ink)"
                        : "0 0 0 1px rgba(0,0,0,0.1)",
                  }}
                />
              ))}
              <span className="text-[11px] text-ink-soft">quick accents</span>
            </div>
          </div>

          {/* Brand colours */}
          <div>
            <SectionLabel>Brand colours</SectionLabel>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {BRAND_COLORS.map((c) => (
                <ColorField
                  key={`${scope}-${c.key}`}
                  label={c.label}
                  hint={c.hint}
                  value={draft[c.key]}
                  onChange={(hex) => set(c.key, hex)}
                />
              ))}
            </div>
          </div>

          {/* Canvas colours */}
          <div>
            <SectionLabel>{scope === "store" ? "Storefront canvas" : "Dashboard canvas"}</SectionLabel>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {CANVAS_COLORS.map((c) => (
                <ColorField
                  key={`${scope}-${c.key}`}
                  label={c.label}
                  hint={c.hint}
                  value={draft[c.key]}
                  onChange={(hex) => set(c.key, hex)}
                />
              ))}
            </div>
            {warnings.length > 0 && (
              <div className="mt-3 space-y-1.5 rounded-[var(--radius-md)] border border-danger/40 bg-danger/5 px-4 py-3">
                {warnings.map((w) => (
                  <p key={w.pair} className="text-[12px] leading-relaxed text-danger">
                    ⚠ {w.message}
                  </p>
                ))}
              </div>
            )}
            {scope === "admin" && (
              <p className="mt-2 text-[12px] text-ink-soft">
                Canvas and brand colours apply to the dashboard&apos;s light theme; the dark theme
                keeps its own designed night palette.
              </p>
            )}
            {scope === "store" && draft.darkModeDefault && (
              <p className="mt-2 text-[12px] text-ink-soft">
                Canvas colours apply to the light theme — the storefront currently defaults to dark.
              </p>
            )}
          </div>

          {/* Typography */}
          <div>
            <SectionLabel>Typography</SectionLabel>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              <label>
                <span className="mb-1.5 block text-[12px] text-ink-soft">Headings</span>
                <select
                  value={draft.fontDisplay}
                  onChange={(e) => set("fontDisplay", e.target.value as FontKey)}
                  className="input-field"
                >
                  {FONT_OPTIONS.map((f) => (
                    <option key={f.key} value={f.key}>
                      {f.label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span className="mb-1.5 block text-[12px] text-ink-soft">Body text</span>
                <select
                  value={draft.fontBody}
                  onChange={(e) => set("fontBody", e.target.value as FontKey)}
                  className="input-field"
                >
                  {FONT_OPTIONS.map((f) => (
                    <option key={f.key} value={f.key}>
                      {f.label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span className="mb-1.5 block text-[12px] text-ink-soft">Mono / labels</span>
                <select
                  value={draft.fontMono}
                  onChange={(e) => set("fontMono", e.target.value as MonoFontKey)}
                  className="input-field"
                >
                  {MONO_FONT_OPTIONS.map((f) => (
                    <option key={f.key} value={f.key}>
                      {f.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            {scope === "store" && (
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <span className="mb-2 block text-[12px] text-ink-soft">Body size</span>
                  <Segmented
                    ariaLabel="Body size"
                    value={draft.typeScale}
                    onChange={(v) => set("typeScale", v)}
                    options={Object.entries(TYPE_SCALES).map(([value, s]) => ({
                      value: value as StoreThemeConfig["typeScale"],
                      label: s.label,
                    }))}
                  />
                </div>
                <div>
                  <span className="mb-2 block text-[12px] text-ink-soft">Heading presence</span>
                  <Segmented
                    ariaLabel="Heading presence"
                    value={draft.headingScale}
                    onChange={(v) => set("headingScale", v)}
                    options={Object.entries(HEADING_SCALES).map(([value, s]) => ({
                      value: value as StoreThemeConfig["headingScale"],
                      label: s.label,
                    }))}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Shape */}
          <div>
            <SectionLabel>Corner style</SectionLabel>
            <div className="mt-3">
              <Segmented
                ariaLabel="Corner style"
                value={draft.cornerStyle}
                onChange={(v) => set("cornerStyle", v)}
                options={(Object.keys(CORNER_STYLES) as StoreThemeConfig["cornerStyle"][]).map((k) => ({
                  value: k,
                  label: CORNER_STYLES[k].label,
                }))}
              />
            </div>
          </div>

          {/* Layout — per surface */}
          <div>
            <SectionLabel>{scope === "store" ? "Storefront layout" : "Dashboard layout"}</SectionLabel>
            {scope === "store" ? (
              <div className="mt-3 space-y-4">
                <div>
                  <span className="mb-2 block text-[12px] text-ink-soft">Header</span>
                  <Segmented
                    ariaLabel="Header style"
                    value={draft.headerStyle}
                    onChange={(v) => set("headerStyle", v)}
                    options={[
                      { value: "split", label: "Split", hint: "wordmark left, nav centre, cart right" },
                      { value: "centered", label: "Centered", hint: "stacked wordmark over the nav" },
                      { value: "minimal", label: "Minimal", hint: "wordmark and cart only" },
                    ]}
                  />
                </div>
                <div>
                  <span className="mb-2 block text-[12px] text-ink-soft">Hero</span>
                  <Segmented
                    ariaLabel="Hero variant"
                    value={draft.heroVariant}
                    onChange={(v) => set("heroVariant", v)}
                    options={[
                      { value: "editorial", label: "Editorial", hint: "copy block + image band" },
                      { value: "immersive", label: "Immersive", hint: "full-bleed image, overlaid copy" },
                      { value: "minimal", label: "Minimal", hint: "pure typography, no imagery" },
                    ]}
                  />
                </div>
                <div>
                  <span className="mb-2 block text-[12px] text-ink-soft">Product grid</span>
                  <Segmented
                    ariaLabel="Product grid density"
                    value={draft.gridDensity}
                    onChange={(v) => set("gridDensity", v)}
                    options={[
                      { value: 2, label: "2 columns" },
                      { value: 3, label: "3 columns" },
                      { value: 4, label: "4 columns" },
                    ]}
                  />
                </div>
                <div>
                  <span className="mb-2 block text-[12px] text-ink-soft">Product cards</span>
                  <Segmented
                    ariaLabel="Card style"
                    value={draft.cardStyle}
                    onChange={(v) => set("cardStyle", v)}
                    options={[
                      { value: "glass", label: "Glass", hint: "translucent border + icy glow" },
                      { value: "flat", label: "Flat", hint: "bare image tiles" },
                      { value: "outlined", label: "Outlined", hint: "solid frame, no glow" },
                    ]}
                  />
                </div>
                <div>
                  <span className="mb-2 block text-[12px] text-ink-soft">Section spacing</span>
                  <Segmented
                    ariaLabel="Section spacing"
                    value={draft.sectionSpacing}
                    onChange={(v) => set("sectionSpacing", v)}
                    options={(Object.keys(SECTION_SPACINGS) as StoreThemeConfig["sectionSpacing"][]).map(
                      (k) => ({ value: k, label: SECTION_SPACINGS[k].label }),
                    )}
                  />
                </div>
              </div>
            ) : (
              <div className="mt-3 space-y-4">
                <div>
                  <span className="mb-2 block text-[12px] text-ink-soft">Sidebar</span>
                  <Segmented
                    ariaLabel="Sidebar style"
                    value={draft.sidebarStyle}
                    onChange={(v) => set("sidebarStyle", v)}
                    options={[
                      { value: "expanded", label: "Expanded", hint: "roomy, full labels" },
                      { value: "compact", label: "Compact", hint: "narrow, tighter type" },
                      { value: "rail", label: "Rail", hint: "slim monogram rail" },
                    ]}
                  />
                </div>
                <div>
                  <span className="mb-2 block text-[12px] text-ink-soft">Density</span>
                  <Segmented
                    ariaLabel="Density"
                    value={draft.density}
                    onChange={(v) => set("density", v)}
                    options={[
                      { value: "comfortable", label: "Comfortable" },
                      { value: "compact", label: "Compact", hint: "tighter tables and lists" },
                    ]}
                  />
                </div>
                <div>
                  <span className="mb-2 block text-[12px] text-ink-soft">Panels</span>
                  <Segmented
                    ariaLabel="Panel style"
                    value={draft.panelStyle}
                    onChange={(v) => set("panelStyle", v)}
                    options={[
                      { value: "card", label: "Card", hint: "frosted glass panels" },
                      { value: "flat", label: "Flat", hint: "quiet bordered surfaces" },
                    ]}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Logo — storefront only */}
          {scope === "store" && (
            <div>
              <SectionLabel>Logo</SectionLabel>
              <label className="mt-3 block">
                <span className="mb-1.5 block text-[12px] text-ink-soft">Logo image URL</span>
                <input
                  value={draft.logoUrl}
                  onChange={(e) => set("logoUrl", e.target.value)}
                  placeholder="https://cdn.example.com/logo.png"
                  className="input-field"
                  spellCheck={false}
                />
              </label>
            </div>
          )}

          {/* Default appearance — storefront only; the dashboard's is per-user below */}
          {scope === "store" && (
            <div>
              <SectionLabel>Storefront default appearance</SectionLabel>
              <div className="mt-3">
                <Segmented
                  ariaLabel="Storefront default appearance"
                  value={draft.darkModeDefault ? "dark" : "light"}
                  onChange={(v) => set("darkModeDefault", v === "dark")}
                  options={[
                    { value: "light", label: "☀ Light" },
                    { value: "dark", label: "☾ Dark" },
                  ]}
                />
              </div>
              <p className="mt-2 text-[12px] text-ink-soft">
                What customers see when they visit the store. Your dashboard&apos;s light/dark is a
                per-user preference, set below.
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-3 border-t border-line/70 pt-6">
            <button
              type="button"
              onClick={() => mutation.mutate(draft)}
              disabled={!dirty || mutation.isPending || settingsQuery.isError}
              className="rounded-full bg-accent px-6 py-3 font-mono text-[12px] uppercase tracking-[0.14em] text-accent-ink transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {mutation.isPending
                ? "Saving…"
                : scope === "store"
                  ? "Save storefront theme"
                  : "Save admin theme"}
            </button>
            <button
              type="button"
              onClick={() => {
                mutation.reset();
                setDrafts((d) => ({ ...d, [scope]: saved }));
              }}
              disabled={!dirty}
              className="rounded-full border border-line px-5 py-3 font-mono text-[11px] uppercase tracking-[0.12em] text-ink-soft transition-colors hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-40"
            >
              Discard changes
            </button>
            <button
              type="button"
              onClick={() => {
                mutation.reset();
                setDrafts((d) => ({ ...d, [scope]: DEFAULT_STORE_THEME }));
              }}
              className="rounded-full border border-line px-5 py-3 font-mono text-[11px] uppercase tracking-[0.12em] text-ink-soft transition-colors hover:border-accent hover:text-accent"
            >
              Restore defaults
            </button>
            {mutation.isSuccess && !dirty && (
              <span className="text-[12px] text-success">
                {scope === "store"
                  ? "Saved — the storefront is already wearing it."
                  : "Saved — the dashboard is already wearing it."}
              </span>
            )}
            {mutation.isError && (
              <span className="text-[12px] text-danger">
                {mutation.error instanceof Error ? mutation.error.message : "Couldn't save the theme."}
              </span>
            )}
          </div>
        </div>

        {/* Live preview */}
        <div className="xl:sticky xl:top-6 xl:self-start">
          <div className="flex items-baseline justify-between">
            <SectionLabel>Live preview</SectionLabel>
            {dirty && (
              <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-accent">
                previewing unsaved draft
              </span>
            )}
          </div>
          <div className="mt-3">
            {/* Keyed by scope so switching surfaces reloads the right page. */}
            <LivePreview key={scope} surface={scope} draft={draft} />
          </div>
          <p className="mt-3 text-[12px] leading-relaxed text-ink-soft">
            This is the real {scope === "store" ? "storefront" : "dashboard"} rendered with your
            draft — scroll, click, and browse pages inside it; the draft follows you. Nothing
            applies to the live {scope === "store" ? "store" : "dashboard"} until you save.{" "}
            {scope === "store" ? (
              <>
                Saved to <code className="font-mono text-ink">organization.settings.theme</code>.
              </>
            ) : (
              <>
                Saved to <code className="font-mono text-ink">organization.settings.adminTheme</code>{" "}
                — staff-only, never served to the storefront.
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
