"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect, useState, useCallback } from "react";

/* ── Toolbar icons (inline SVGs) ───────────────────────────────────────── */
function Icon({ d, size = 14 }: { d: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

const COLORS = [
  { label: "Default", value: "" },
  { label: "Accent",  value: "var(--accent)" },
  { label: "Red",     value: "#e05252" },
  { label: "Green",   value: "#4caf7d" },
  { label: "Blue",    value: "#5285e0" },
  { label: "Muted",   value: "var(--ink-soft)" },
];

const HIGHLIGHTS = [
  { label: "None",   value: "" },
  { label: "Yellow", value: "#fef08a" },
  { label: "Gold",   value: "rgba(200,169,110,0.25)" },
  { label: "Green",  value: "#bbf7d0" },
  { label: "Pink",   value: "#fce7f3" },
];

/* ── Toolbar button ─────────────────────────────────────────────────────── */
function Btn({
  active, onClick, title, children,
}: {
  active?: boolean; onClick: () => void; title: string; children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className="flex h-7 min-w-[28px] items-center justify-center rounded px-1.5 font-mono text-[11px] transition-colors"
      style={{
        background: active ? "var(--accent-soft)" : "transparent",
        color: active ? "var(--accent)" : "var(--ink-soft)",
      }}
      onMouseEnter={(e) => { if (!active) (e.currentTarget as HTMLButtonElement).style.background = "var(--bone)"; }}
      onMouseLeave={(e) => { if (!active) (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
    >
      {children}
    </button>
  );
}

function Sep() {
  return <div className="mx-1 h-5 w-px bg-line/60" />;
}

/* ── RichEditor ─────────────────────────────────────────────────────────── */
export function RichEditor({
  value,
  onChange,
  placeholder = "Start writing…",
}: {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}) {
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [imgDialogOpen, setImgDialogOpen] = useState(false);
  const [imgUrl, setImgUrl] = useState("");

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Underline,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      Link.configure({ openOnClick: false, HTMLAttributes: { class: "underline text-accent" } }),
      Image.configure({ inline: false, HTMLAttributes: { class: "rounded-[var(--radius-md)] max-w-full my-4" } }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({ placeholder }),
    ],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: "outline-none min-h-[260px] px-5 py-4 text-[14px] leading-[1.8] text-ink prose-style",
      },
    },
  });

  // Sync external value changes (e.g. switching posts)
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const applyLink = useCallback(() => {
    if (!editor) return;
    if (linkUrl) editor.chain().focus().setLink({ href: linkUrl }).run();
    else editor.chain().focus().unsetLink().run();
    setLinkUrl("");
    setLinkDialogOpen(false);
  }, [editor, linkUrl]);

  const applyImage = useCallback(() => {
    if (!editor || !imgUrl.trim()) return;
    editor.chain().focus().setImage({ src: imgUrl.trim() }).run();
    setImgUrl("");
    setImgDialogOpen(false);
  }, [editor, imgUrl]);

  if (!editor) return null;

  return (
    <div className="overflow-hidden rounded-[var(--radius-md)] border border-line/70" style={{ background: "var(--surface)" }}>

      {/* ── Toolbar ── */}
      <div className="flex flex-wrap items-center gap-0.5 border-b border-line/60 px-2 py-1.5" style={{ background: "var(--bone)" }}>

        {/* Headings */}
        <Btn active={editor.isActive("heading", { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} title="Heading 1">H1</Btn>
        <Btn active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} title="Heading 2">H2</Btn>
        <Btn active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} title="Heading 3">H3</Btn>
        <Btn active={editor.isActive("paragraph")} onClick={() => editor.chain().focus().setParagraph().run()} title="Paragraph">¶</Btn>

        <Sep />

        {/* Inline formatting */}
        <Btn active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()} title="Bold">
          <Icon d="M4 3h5a3 3 0 010 6H4V3zM4 9h6a3 3 0 010 6H4V9z" />
        </Btn>
        <Btn active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()} title="Italic">
          <Icon d="M10 3H7m3 10H7M9 3L7 13" />
        </Btn>
        <Btn active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()} title="Underline">
          <Icon d="M4 13h8M8 3v7a3 3 0 003 3H5a3 3 0 003-3V3" />
        </Btn>
        <Btn active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()} title="Strikethrough">
          <Icon d="M3 8h10M6 5a2 2 0 012-2h2a2 2 0 010 4H7a2 2 0 000 4h2a2 2 0 002-2" />
        </Btn>
        <Btn active={editor.isActive("code")} onClick={() => editor.chain().focus().toggleCode().run()} title="Inline code">
          <Icon d="M10 4l4 4-4 4M6 4L2 8l4 4" />
        </Btn>

        <Sep />

        {/* Text colour */}
        <div className="relative flex items-center">
          <span className="mr-1 font-mono text-[10px] text-ink-soft">A</span>
          <div className="flex gap-0.5">
            {COLORS.map((c) => (
              <button
                key={c.value}
                type="button"
                title={c.label}
                onClick={() => c.value ? editor.chain().focus().setColor(c.value).run() : editor.chain().focus().unsetColor().run()}
                className="size-4 rounded-sm border border-line/40 transition-transform hover:scale-110"
                style={{ background: c.value || "var(--ink)", outline: editor.isActive("textStyle", { color: c.value }) ? "2px solid var(--accent)" : "none", outlineOffset: 1 }}
              />
            ))}
          </div>
        </div>

        <Sep />

        {/* Highlight */}
        <div className="flex items-center gap-0.5">
          <span className="mr-0.5 font-mono text-[10px] text-ink-soft">H</span>
          {HIGHLIGHTS.map((h) => (
            <button
              key={h.value}
              type="button"
              title={h.label}
              onClick={() => h.value ? editor.chain().focus().setHighlight({ color: h.value }).run() : editor.chain().focus().unsetHighlight().run()}
              className="size-4 rounded-sm border border-line/40 transition-transform hover:scale-110"
              style={{ background: h.value || "transparent", outline: !h.value ? "1px dashed var(--line)" : "none" }}
            />
          ))}
        </div>

        <Sep />

        {/* Alignment */}
        <Btn active={editor.isActive({ textAlign: "left" })} onClick={() => editor.chain().focus().setTextAlign("left").run()} title="Align left">
          <Icon d="M2 4h12M2 8h8M2 12h12" />
        </Btn>
        <Btn active={editor.isActive({ textAlign: "center" })} onClick={() => editor.chain().focus().setTextAlign("center").run()} title="Align center">
          <Icon d="M2 4h12M4 8h8M2 12h12" />
        </Btn>
        <Btn active={editor.isActive({ textAlign: "right" })} onClick={() => editor.chain().focus().setTextAlign("right").run()} title="Align right">
          <Icon d="M2 4h12M6 8h8M2 12h12" />
        </Btn>

        <Sep />

        {/* Lists */}
        <Btn active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()} title="Bullet list">
          <Icon d="M5 4h8M5 8h8M5 12h8M2 4h.01M2 8h.01M2 12h.01" />
        </Btn>
        <Btn active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()} title="Numbered list">
          <Icon d="M6 4h8M6 8h8M6 12h8M2 4h.01M3 8H1M1 11h1l1 1-1 1H1" />
        </Btn>
        <Btn active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()} title="Blockquote">
          <Icon d="M3 7h2l-1 4H2l1-4zm6 0h2l-1 4H8l1-4z" />
        </Btn>
        <Btn active={editor.isActive("codeBlock")} onClick={() => editor.chain().focus().toggleCodeBlock().run()} title="Code block">
          <Icon d="M4 2l-3 6 3 6M12 2l3 6-3 6M9 1L7 15" />
        </Btn>

        <Sep />

        {/* Link */}
        <Btn active={editor.isActive("link")} onClick={() => { setLinkUrl(editor.getAttributes("link").href ?? ""); setLinkDialogOpen(true); }} title="Insert link">
          <Icon d="M7 9a3 3 0 004.5.4l2-2a3 3 0 00-4.2-4.2l-1.1 1.1M9 7a3 3 0 00-4.5-.4l-2 2a3 3 0 004.2 4.2l1.1-1.1" />
        </Btn>
        {editor.isActive("link") && (
          <Btn active={false} onClick={() => editor.chain().focus().unsetLink().run()} title="Remove link">
            <Icon d="M3 3l10 10M7 9a3 3 0 004.5.4l2-2a3 3 0 00-4.2-4.2M9 7a3 3 0 00-4.5-.4l-2 2a3 3 0 004.2 4.2" />
          </Btn>
        )}

        {/* Image */}
        <Btn active={false} onClick={() => { setImgUrl(""); setImgDialogOpen(true); }} title="Insert image">
          <Icon d="M1 11l4-4 3 3 3-4 4 5H1zM12 4a1 1 0 110 2 1 1 0 010-2z" />
        </Btn>

        <Sep />

        {/* History */}
        <Btn active={false} onClick={() => editor.chain().focus().undo().run()} title="Undo">
          <Icon d="M3 9a5 5 0 0110 0v1H3M3 9L1 7m2 2L1 11" />
        </Btn>
        <Btn active={false} onClick={() => editor.chain().focus().redo().run()} title="Redo">
          <Icon d="M13 9a5 5 0 00-10 0v1h10M13 9l2-2m-2 2l2 2" />
        </Btn>
      </div>

      {/* ── Editor area ── */}
      <EditorContent editor={editor} />

      {/* ── Link dialog ── */}
      {linkDialogOpen && (
        <div className="border-t border-line/60 px-4 py-3" style={{ background: "var(--surface-raised)" }}>
          <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.1em] text-ink-soft">Link URL</p>
          <div className="flex gap-2">
            <input
              autoFocus
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && applyLink()}
              placeholder="https://example.com"
              className="input-field flex-1 text-[13px]"
            />
            <button type="button" onClick={applyLink} className="rounded-full bg-accent px-4 py-2 font-mono text-[11px] text-accent-ink">Apply</button>
            <button type="button" onClick={() => setLinkDialogOpen(false)} className="rounded-full border border-line px-4 py-2 font-mono text-[11px] text-ink-soft">Cancel</button>
          </div>
        </div>
      )}

      {/* ── Image dialog ── */}
      {imgDialogOpen && (
        <div className="border-t border-line/60 px-4 py-3" style={{ background: "var(--surface-raised)" }}>
          <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.1em] text-ink-soft">Image URL</p>
          <div className="flex gap-2">
            <input
              autoFocus
              value={imgUrl}
              onChange={(e) => setImgUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && applyImage()}
              placeholder="https://images.unsplash.com/…"
              className="input-field flex-1 text-[13px]"
            />
            <button type="button" onClick={applyImage} className="rounded-full bg-accent px-4 py-2 font-mono text-[11px] text-accent-ink">Insert</button>
            <button type="button" onClick={() => setImgDialogOpen(false)} className="rounded-full border border-line px-4 py-2 font-mono text-[11px] text-ink-soft">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
