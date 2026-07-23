"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getOrganizationSettings, updateOrganizationTheme, type ThemeScope } from "@/lib/api/admin.api";
import {
  CORNER_STYLES,
  DEFAULT_HOME_SECTIONS,
  DEFAULT_STORE_THEME,
  FONT_OPTIONS,
  HEADING_SCALES,
  HOME_SECTION_META,
  MONO_FONT_OPTIONS,
  PREMIUM_PRESETS,
  SECTION_SPACINGS,
  STYLE_PRESETS,
  TYPE_SCALES,
  fontStack,
} from "@/lib/theme/presets";
import type { StylePreset } from "@/lib/theme/presets";
import { contrastWarnings } from "@/lib/theme/contrast";
import type { FontKey, HomeSectionKey, MonoFontKey, StoreThemeConfig } from "@/lib/theme/types";

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

/** On/off pill for the boolean storefront knobs. */
function ToggleRow({
  label,
  hint,
  on,
  onChange,
}: {
  label: string;
  hint: string;
  on: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className="flex w-full items-center gap-3 rounded-[var(--radius-md)] border px-3 py-2.5 text-left transition-colors"
      style={{ borderColor: on ? "var(--accent)" : "var(--line)", background: on ? "var(--accent-soft)" : "transparent" }}
    >
      <span
        className="relative h-5 w-9 shrink-0 rounded-full transition-colors"
        style={{ background: on ? "var(--accent)" : "var(--line)" }}
      >
        <span className="absolute top-0.5 size-4 rounded-full bg-surface transition-all" style={{ left: on ? "18px" : "2px" }} />
      </span>
      <span className="min-w-0">
        <span className="block text-[13px] font-medium text-ink">{label}</span>
        <span className="block truncate text-[11px] text-ink-soft">{hint}</span>
      </span>
    </button>
  );
}

/**
 * Home page builder: toggle sections on/off and reorder them with ▲/▼.
 * The saved order is exactly what the storefront home renders.
 */
function HomeSectionBuilder({
  value,
  onChange,
}: {
  value: HomeSectionKey[];
  onChange: (v: HomeSectionKey[]) => void;
}) {
  const active = value;
  const hidden = DEFAULT_HOME_SECTIONS.filter((k) => !active.includes(k));

  function move(idx: number, dir: -1 | 1) {
    const next = [...active];
    const [item] = next.splice(idx, 1);
    next.splice(idx + dir, 0, item);
    onChange(next);
  }

  return (
    <div className="space-y-2">
      {active.map((key, i) => (
        <div
          key={key}
          className="flex items-center gap-3 rounded-[var(--radius-md)] border border-line px-3 py-2"
          style={{ background: "var(--surface)" }}
        >
          <span className="font-mono text-[10px] text-ink-soft/60">{i + 1}</span>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-medium text-ink">{HOME_SECTION_META[key].label}</p>
            <p className="truncate text-[11px] text-ink-soft">{HOME_SECTION_META[key].hint}</p>
          </div>
          <button
            type="button"
            aria-label={`Move ${HOME_SECTION_META[key].label} up`}
            disabled={i === 0}
            onClick={() => move(i, -1)}
            className="rounded-full border border-line px-2 py-1 font-mono text-[10px] text-ink-soft hover:border-accent hover:text-accent disabled:opacity-25"
          >
            ▲
          </button>
          <button
            type="button"
            aria-label={`Move ${HOME_SECTION_META[key].label} down`}
            disabled={i === active.length - 1}
            onClick={() => move(i, 1)}
            className="rounded-full border border-line px-2 py-1 font-mono text-[10px] text-ink-soft hover:border-accent hover:text-accent disabled:opacity-25"
          >
            ▼
          </button>
          <button
            type="button"
            onClick={() => onChange(active.filter((k) => k !== key))}
            className="font-mono text-[10px] uppercase tracking-[0.06em] text-ink-soft hover:text-danger"
          >
            Hide
          </button>
        </div>
      ))}
      {hidden.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1">
          {hidden.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => onChange([...active, key])}
              className="rounded-full border border-dashed border-line px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.06em] text-ink-soft transition-colors hover:border-accent hover:text-accent"
            >
              + {HOME_SECTION_META[key].label}
            </button>
          ))}
        </div>
      )}
    </div>
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

/**
 * Premium preset card: a miniature of the look itself — swatch strip on the
 * preset's canvas with a serif "Aa" and a pill button in the accent, colour
 * dots, name, tag line. Selecting one fills every colour field and the
 * heading/body font selects; layout choices stay put.
 */
function PremiumPresetCard({
  preset,
  selected,
  onSelect,
}: {
  preset: StylePreset;
  selected: boolean;
  onSelect: () => void;
}) {
  // Palette-only presets (the business verticals) don't define a canvas —
  // fall back to the default theme's so the card still previews faithfully.
  const t = { ...DEFAULT_STORE_THEME, ...preset.theme };
  return (
    <button
      type="button"
      onClick={onSelect}
      title={preset.note}
      aria-pressed={selected}
      className="group flex flex-col rounded-[var(--radius-lg)] border p-3 text-left transition-all hover:-translate-y-0.5 hover:shadow-md"
      style={{
        borderColor: selected ? "var(--ink)" : "var(--line)",
        background: "var(--surface)",
        boxShadow: selected ? "0 0 0 1px var(--ink), 0 6px 22px rgba(0,0,0,0.10)" : undefined,
      }}
    >
      {/* Swatch strip — the preset's own canvas, type, and pill button */}
      <span
        className="flex h-16 items-center justify-center gap-3 rounded-[var(--radius-md)] border"
        style={{ background: t.background, borderColor: t.line }}
      >
        <span
          className="italic"
          style={{
            color: t.ink,
            fontFamily: t.fontDisplay ? fontStack(t.fontDisplay) : "Georgia, serif",
            fontSize: "20px",
          }}
        >
          Aa
        </span>
        <span
          className="rounded-full px-3 py-1 font-mono text-[9px] uppercase tracking-[0.14em]"
          style={{ background: t.accent, color: t.accentInk }}
        >
          Shop
        </span>
      </span>

      {/* Dots + name */}
      <span className="mt-3 flex items-center gap-2">
        <span className="flex gap-1.5">
          {[t.accent, t.secondary, t.ink].map((c, i) => (
            <span
              key={i}
              className="size-2.5 rounded-full"
              style={{ background: c, boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.12)" }}
            />
          ))}
        </span>
        <span className="text-[13px] font-medium leading-tight text-ink">{preset.name}</span>
      </span>
      <span className="mt-1 text-[11px] leading-snug text-ink-soft">{preset.note}</span>
    </button>
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
function LivePreview({
  surface,
  draft,
  dirty,
}: {
  surface: ThemeScope;
  draft: StoreThemeConfig;
  dirty: boolean;
}) {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.32);
  const [boxW, setBoxW] = useState(420);
  const [loaded, setLoaded] = useState(false);
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");

  // Full-size preview window, kept in sync with the draft while it's open.
  const popupRef = useRef<Window | null>(null);
  const popupTimer = useRef<number | null>(null);
  const [popupBlocked, setPopupBlocked] = useState(false);
  const draftRef = useRef(draft);
  draftRef.current = draft;

  const FRAME_W = device === "mobile" ? 390 : 1280;
  const FRAME_H = device === "mobile" ? 844 : 900;

  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const update = () => {
      setBoxW(el.clientWidth);
      // Mobile frames are narrower than the rail — cap the scale so the
      // phone doesn't blow up to full rail width and tower over the card.
      setScale(Math.min(el.clientWidth / FRAME_W, device === "mobile" ? 0.62 : 1));
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [FRAME_W, device]);

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
      surface === "store" ? "/store" : "/admin",
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
    <div
      className="rounded-[var(--radius-lg)] border border-line/70 p-4"
      style={{ background: "var(--surface)" }}
    >
      {/* Card header: label · device toggle · open in new window */}
      <div className="flex flex-wrap items-center gap-3">
        <SectionLabel>Live preview</SectionLabel>
        {dirty && (
          <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-accent">
            unsaved draft
          </span>
        )}
        <div className="ml-auto flex items-center gap-3">
          <div className="flex rounded-full border border-line/70 p-0.5" style={{ background: "var(--bone)" }}>
            {(["desktop", "mobile"] as const).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDevice(d)}
                aria-pressed={device === d}
                className="rounded-full px-3 py-1 font-mono text-[10px] uppercase tracking-[0.08em] transition-all"
                style={{
                  background: device === d ? "var(--accent)" : "transparent",
                  color: device === d ? "var(--accent-ink)" : "var(--ink-soft)",
                }}
              >
                {d}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={openFullPreview}
            className="font-mono text-[10px] uppercase tracking-[0.1em] text-accent transition-opacity hover:opacity-75"
          >
            Open ↗
          </button>
        </div>
      </div>

      <div
        ref={boxRef}
        className="relative mt-3 overflow-hidden rounded-[var(--radius-md)] border border-line bg-bone"
        style={{ height: FRAME_H * scale }}
      >
        {/* Absolutely positioned so the frame's unscaled layout width never
            propagates into the page (transform only scales visually). Fully
            interactive: scroll, click, and navigate inside the preview.
            Client-side navigations keep the injected draft (the iframe's
            React state survives); hard loads re-fire onLoad → re-post. */}
        <iframe
          ref={frameRef}
          src={surface === "store" ? "/store" : "/admin"}
          title={surface === "store" ? "Storefront preview" : "Admin panel preview"}
          onLoad={() => {
            setLoaded(true);
            post();
          }}
          className="absolute top-0 origin-top-left border-0"
          style={{
            width: FRAME_W,
            height: FRAME_H,
            transform: `scale(${scale})`,
            left: Math.max(0, (boxW - FRAME_W * scale) / 2),
          }}
        />
      </div>

      {popupBlocked && (
        <p className="mt-2 text-[12px] text-danger">
          The browser blocked the preview window — allow pop-ups for this site and try again.
        </p>
      )}

      <p className="mt-3 text-[12px] leading-relaxed text-ink-soft">
        This is the real {surface === "store" ? "storefront" : "dashboard"} rendered with your
        draft — it follows you as you scroll. Nothing applies to the live{" "}
        {surface === "store" ? "store" : "dashboard"} until you save. Saved to{" "}
        <code className="font-mono text-ink">
          {surface === "store" ? "organization.settings.theme" : "organization.settings.adminTheme"}
        </code>
        .
      </p>
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
  const [sheetOpen, setSheetOpen] = useState(false);

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

      <div className="mt-6 grid gap-8 min-[1100px]:grid-cols-[minmax(0,960px)_460px]">
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
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {STYLE_PRESETS.map((p) => (
                <PremiumPresetCard
                  key={p.name}
                  preset={p}
                  selected={
                    draft.accent === p.theme.accent &&
                    draft.background === (p.theme.background ?? draft.background)
                  }
                  onSelect={() => applyPreset(p.theme)}
                />
              ))}
            </div>
            {/* Premium presets */}
            <div className="mt-6">
              <div className="flex items-baseline gap-3">
                <SectionLabel>Premium presets</SectionLabel>
                <span className="text-[12px] italic text-ink-soft">
                  branded palettes with matched type &amp; surfaces
                </span>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {PREMIUM_PRESETS.map((p) => (
                  <PremiumPresetCard
                    key={p.name}
                    preset={p}
                    selected={
                      draft.accent === p.theme.accent && draft.background === p.theme.background
                    }
                    onSelect={() => applyPreset(p.theme)}
                  />
                ))}
              </div>
            </div>

            <p className="mt-3 text-[12px] text-ink-soft">
              Presets set colours, type, and surface treatment — your layout choices stay put.
            </p>
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
              <div className="mt-3 grid gap-x-8 gap-y-4 sm:grid-cols-2">
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
                <div>
                  <span className="mb-2 block text-[12px] text-ink-soft">Navigation</span>
                  <Segmented
                    ariaLabel="Navigation style"
                    value={draft.navStyle}
                    onChange={(v) => set("navStyle", v)}
                    options={[
                      { value: "top", label: "Top bar", hint: "links live in the header" },
                      { value: "sidebar", label: "Sidebar", hint: "hamburger opens a slide-in drawer with shop + CMS page links" },
                    ]}
                  />
                </div>
                <div>
                  <span className="mb-2 block text-[12px] text-ink-soft">Card layout</span>
                  <Segmented
                    ariaLabel="Card layout"
                    value={draft.cardLayout}
                    onChange={(v) => set("cardLayout", v)}
                    options={[
                      { value: "vertical", label: "Vertical", hint: "image on top, details below" },
                      { value: "horizontal", label: "Horizontal", hint: "image beside the details" },
                      { value: "overlay", label: "Overlay", hint: "details laid over the image" },
                    ]}
                  />
                </div>
                <div>
                  <span className="mb-2 block text-[12px] text-ink-soft">Footer</span>
                  <Segmented
                    ariaLabel="Footer style"
                    value={draft.footerStyle}
                    onChange={(v) => set("footerStyle", v)}
                    options={[
                      { value: "columns", label: "Columns", hint: "link columns incl. auto CMS pages" },
                      { value: "centered", label: "Centered", hint: "stacked wordmark + inline links" },
                      { value: "minimal", label: "Minimal", hint: "one quiet row" },
                    ]}
                  />
                </div>
                <div className="sm:col-span-2">
                  <span className="mb-2 block text-[12px] text-ink-soft">Motion & browsing</span>
                  <div className="grid gap-2 sm:grid-cols-3">
                    <ToggleRow
                      label="Product slider"
                      hint="arrivals scroll with arrows + ←/→ keys"
                      on={draft.productSlider}
                      onChange={(v) => set("productSlider", v)}
                    />
                    <ToggleRow
                      label="Back to top"
                      hint="floating button after scrolling"
                      on={draft.backToTop}
                      onChange={(v) => set("backToTop", v)}
                    />
                    <ToggleRow
                      label="Smooth scroll"
                      hint="animated anchor scrolling"
                      on={draft.smoothScroll}
                      onChange={(v) => set("smoothScroll", v)}
                    />
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <span className="mb-2 block text-[12px] text-ink-soft">Home page builder — order, show, hide</span>
                  <HomeSectionBuilder
                    value={(draft.homeSections ?? DEFAULT_HOME_SECTIONS) as HomeSectionKey[]}
                    onChange={(v) => set("homeSections", v)}
                  />
                  <p className="mt-2 text-[12px] text-ink-soft">
                    The hero always leads; these bands follow in this order. Published CMS pages and blog
                    posts appear on the storefront automatically (footer, sidebar nav, and the blog band).
                  </p>
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

        {/* Live preview — sticky right rail on wide viewports */}
        <div className="hidden min-[1100px]:block">
          <div style={{ position: "sticky", top: 20 }}>
            {/* Keyed by scope so switching surfaces reloads the right page. */}
            <LivePreview key={scope} surface={scope} draft={draft} dirty={dirty} />
          </div>
        </div>
      </div>

      {/* Under ~1100px the preview docks as a collapsible bottom sheet. */}
      <div className="fixed inset-x-0 bottom-0 z-40 min-[1100px]:hidden">
        {sheetOpen && (
          <div
            className="max-h-[70vh] overflow-y-auto border-t border-line/70 px-4 pb-4 pt-3 shadow-[0_-8px_32px_rgba(0,0,0,0.18)]"
            style={{ background: "var(--bone)" }}
          >
            <LivePreview key={`sheet-${scope}`} surface={scope} draft={draft} dirty={dirty} />
          </div>
        )}
        <button
          type="button"
          onClick={() => setSheetOpen((o) => !o)}
          aria-expanded={sheetOpen}
          className="flex w-full items-center justify-center gap-2 border-t border-line/70 py-3 font-mono text-[11px] uppercase tracking-[0.14em] text-ink"
          style={{ background: "var(--surface)" }}
        >
          Live preview {sheetOpen ? "▾" : "▴"}
          {dirty && !sheetOpen && (
            <span className="size-1.5 rounded-full" style={{ background: "var(--accent)" }} />
          )}
        </button>
      </div>
    </div>
  );
}
