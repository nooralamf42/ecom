"use client";

import { useState, type ReactNode } from "react";
import { EditorContent, useEditor, useEditorState, type Editor } from "@tiptap/react";
import { Markdown } from "@tiptap/markdown";
import { Placeholder } from "@tiptap/extensions";
import { FileHandler } from "@tiptap/extension-file-handler";
import { toast } from "sonner";
import {
  Bold,
  Braces,
  Code,
  Columns3,
  Heading2,
  Heading3,
  Heading4,
  ImageIcon,
  Italic,
  Link2,
  List,
  ListOrdered,
  Loader2,
  Minus,
  Pilcrow,
  Quote,
  Redo2,
  Rows3,
  Strikethrough,
  Table as TableIcon,
  Trash2,
  Undo2,
  Upload,
} from "lucide-react";
import { pageEditorExtensions } from "@/lib/editor/extensions";
import { uploadImage } from "@/lib/upload-image";
import { PAGE_TOKENS } from "@/lib/page-tokens";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLenisLock } from "@/components/providers/smooth-scroll-provider";
import { cn } from "@/lib/utils";

const IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif", "image/avif"];

/** Links an admin may add: site paths, anchors, web, email and phone links. */
function normalizeHref(raw: string): string | null {
  const v = raw.trim();
  if (!v) return null;
  if (/^(\/(?!\/)|#|https?:\/\/|mailto:|tel:)/i.test(v)) return v;
  if (/^[\w-]+(\.[\w-]+)+(\/|$)/.test(v)) return `https://${v}`; // "example.com/page"
  return null;
}

// Mirrors components/content/markdown.tsx so the editor looks like the live page.
const contentClass = cn(
  "min-h-72 px-4 py-4 text-base leading-relaxed text-foreground/90 outline-none sm:px-5",
  "[&_h1]:mt-8 [&_h1]:font-heading [&_h1]:text-3xl [&_h1]:font-bold",
  "[&_h2]:mt-8 [&_h2]:font-heading [&_h2]:text-2xl [&_h2]:font-bold",
  "[&_h3]:mt-6 [&_h3]:font-heading [&_h3]:text-xl [&_h3]:font-bold",
  "[&_h4]:mt-5 [&_h4]:text-lg [&_h4]:font-bold",
  "[&_p]:mt-3 [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:mt-3 [&_ol]:list-decimal [&_ol]:pl-6",
  "[&_li_p]:mt-0 [&_strong]:font-bold",
  "[&_blockquote]:mt-3 [&_blockquote]:border-l-4 [&_blockquote]:border-primary/40 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-muted-foreground",
  "[&_a]:font-semibold [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2",
  "[&_code]:rounded [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.9em]",
  "[&_pre]:mt-3 [&_pre]:overflow-x-auto [&_pre]:rounded-xl [&_pre]:bg-muted [&_pre]:p-3",
  "[&_hr]:my-6 [&_hr]:border-border",
  "[&_img]:mt-3 [&_img]:max-w-full [&_img[data-rounded]]:rounded-2xl [&_[data-resize-container]]:mt-3 [&_[data-resize-container]]:max-w-full",
  "[&_.ProseMirror-selectednode_img]:ring-2 [&_.ProseMirror-selectednode_img]:ring-primary",
  "[&_.tableWrapper]:mt-3 [&_.tableWrapper]:overflow-x-auto [&_table]:w-full [&_table]:border-collapse [&_table]:text-sm",
  "[&_td]:border [&_td]:px-3 [&_td]:py-2 [&_td]:align-top [&_th]:border [&_th]:bg-muted/60 [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:font-bold",
  "[&_.selectedCell]:bg-primary/10",
  "[&_p.is-editor-empty:first-child]:before:pointer-events-none [&_p.is-editor-empty:first-child]:before:float-left [&_p.is-editor-empty:first-child]:before:h-0 [&_p.is-editor-empty:first-child]:before:text-muted-foreground [&_p.is-editor-empty:first-child]:before:content-[attr(data-placeholder)]",
  "[&>*:first-child]:mt-0",
);

/**
 * Visual editor for content pages. Reads and writes markdown (how pages are
 * stored), so the public renderer and {{placeholders}} work unchanged.
 */
export default function RichTextEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (markdown: string) => void;
}) {
  const [uploading, setUploading] = useState(0);
  const [dialog, setDialog] = useState<"link" | "image" | null>(null);

  async function insertFiles(editor: Editor, files: File[], pos?: number) {
    for (const file of files) {
      setUploading((n) => n + 1);
      try {
        const src = await uploadImage(file, "content");
        const node = { type: "image", attrs: { src, alt: file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ") } };
        if (pos === undefined) editor.chain().focus().insertContent(node).run();
        else editor.chain().focus().insertContentAt(pos, node).run();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Upload failed");
      } finally {
        setUploading((n) => n - 1);
      }
    }
  }

  const editor = useEditor({
    immediatelyRender: false,
    content: value,
    contentType: "markdown",
    extensions: [
      ...pageEditorExtensions(),
      Markdown,
      Placeholder.configure({ placeholder: "Start writing your page…" }),
      FileHandler.configure({
        allowedMimeTypes: IMAGE_TYPES,
        onDrop: (ed, files, pos) => void insertFiles(ed, files, pos),
        onPaste: (ed, files) => void insertFiles(ed, files),
      }),
    ],
    editorProps: { attributes: { class: contentClass, "aria-label": "Page content" } },
    onUpdate: ({ editor }) => onChange(editor.getMarkdown()),
  });

  if (!editor) return <div className="min-h-[22rem] animate-pulse rounded-xl border bg-muted/40" />;

  return (
    // No overflow-hidden here: it would make this box the sticky toolbar's scroll container.
    <div className="page-editor rounded-xl border bg-background focus-within:ring-2 focus-within:ring-ring/40">
      <Toolbar editor={editor} uploading={uploading > 0} onLink={() => setDialog("link")} onImage={() => setDialog("image")} />
      <EditorContent editor={editor} />
      {dialog === "link" && <LinkDialog editor={editor} onClose={() => setDialog(null)} />}
      {dialog === "image" && (
        <ImageDialog
          editor={editor}
          onClose={() => setDialog(null)}
          onUpload={(file) => {
            setDialog(null);
            void insertFiles(editor, [file]);
          }}
        />
      )}
    </div>
  );
}

/* ---------------------------------- toolbar --------------------------------- */

function Toolbar({
  editor,
  uploading,
  onLink,
  onImage,
}: {
  editor: Editor;
  uploading: boolean;
  onLink: () => void;
  onImage: () => void;
}) {
  const s = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      h2: e.isActive("heading", { level: 2 }),
      h3: e.isActive("heading", { level: 3 }),
      h4: e.isActive("heading", { level: 4 }),
      paragraph: e.isActive("paragraph"),
      bold: e.isActive("bold"),
      italic: e.isActive("italic"),
      strike: e.isActive("strike"),
      code: e.isActive("code"),
      bullet: e.isActive("bulletList"),
      ordered: e.isActive("orderedList"),
      quote: e.isActive("blockquote"),
      link: e.isActive("link"),
      image: e.isActive("image"),
      table: e.isActive("table"),
      canUndo: e.can().undo(),
      canRedo: e.can().redo(),
    }),
  });
  const c = () => editor.chain().focus();

  return (
    <div className="sticky top-16 z-10 rounded-t-xl border-b bg-background/95 backdrop-blur">
      <div className="flex flex-wrap items-center gap-0.5 p-1.5">
        <Tool label="Undo" onClick={() => c().undo().run()} disabled={!s.canUndo}>
          <Undo2 />
        </Tool>
        <Tool label="Redo" onClick={() => c().redo().run()} disabled={!s.canRedo}>
          <Redo2 />
        </Tool>
        <Sep />
        <Tool label="Paragraph" active={s.paragraph && !s.table} onClick={() => c().setParagraph().run()}>
          <Pilcrow />
        </Tool>
        <Tool label="Heading" active={s.h2} onClick={() => c().toggleHeading({ level: 2 }).run()}>
          <Heading2 />
        </Tool>
        <Tool label="Subheading" active={s.h3} onClick={() => c().toggleHeading({ level: 3 }).run()}>
          <Heading3 />
        </Tool>
        <Tool label="Small heading" active={s.h4} onClick={() => c().toggleHeading({ level: 4 }).run()}>
          <Heading4 />
        </Tool>
        <Sep />
        <Tool label="Bold" active={s.bold} onClick={() => c().toggleBold().run()}>
          <Bold />
        </Tool>
        <Tool label="Italic" active={s.italic} onClick={() => c().toggleItalic().run()}>
          <Italic />
        </Tool>
        <Tool label="Strikethrough" active={s.strike} onClick={() => c().toggleStrike().run()}>
          <Strikethrough />
        </Tool>
        <Tool label="Inline code" active={s.code} onClick={() => c().toggleCode().run()}>
          <Code />
        </Tool>
        <Tool label="Link" active={s.link} onClick={onLink}>
          <Link2 />
        </Tool>
        <Sep />
        <Tool label="Bulleted list" active={s.bullet} onClick={() => c().toggleBulletList().run()}>
          <List />
        </Tool>
        <Tool label="Numbered list" active={s.ordered} onClick={() => c().toggleOrderedList().run()}>
          <ListOrdered />
        </Tool>
        <Tool label="Quote" active={s.quote} onClick={() => c().toggleBlockquote().run()}>
          <Quote />
        </Tool>
        <Tool label="Divider" onClick={() => c().setHorizontalRule().run()}>
          <Minus />
        </Tool>
        <Sep />
        <Tool label={s.image ? "Edit image" : "Image"} active={s.image} onClick={onImage} disabled={uploading}>
          {uploading ? <Loader2 className="animate-spin" /> : <ImageIcon />}
        </Tool>
        <Tool label="Table" active={s.table} onClick={() => c().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} disabled={s.table}>
          <TableIcon />
        </Tool>
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger
            render={
              <Button type="button" variant="ghost" size="sm" className="h-8 gap-1 px-2 text-xs" title="Insert a placeholder">
                <Braces /> <span className="hidden sm:inline">Insert</span>
              </Button>
            }
          />
          <DropdownMenuContent className="w-60">
            {PAGE_TOKENS.map((t) => (
              <DropdownMenuItem key={t.token} onClick={() => c().insertContent(`{{${t.token}}}`).run()}>
                <span className="flex-1">{t.label}</span>
                <code className="text-xs text-muted-foreground">{`{{${t.token}}}`}</code>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {s.table && (
        <div className="flex flex-wrap items-center gap-1 border-t bg-muted/40 px-1.5 py-1 text-xs">
          <span className="px-1 font-semibold text-muted-foreground">Table:</span>
          <Button type="button" size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={() => c().addRowAfter().run()}>
            <Rows3 /> Add row
          </Button>
          <Button type="button" size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={() => c().addColumnAfter().run()}>
            <Columns3 /> Add column
          </Button>
          <Button type="button" size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={() => c().deleteRow().run()}>
            Delete row
          </Button>
          <Button type="button" size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={() => c().deleteColumn().run()}>
            Delete column
          </Button>
          <Button type="button" size="sm" variant="ghost" className="h-7 px-2 text-xs text-destructive" onClick={() => c().deleteTable().run()}>
            <Trash2 /> Delete table
          </Button>
        </div>
      )}
    </div>
  );
}

function Tool({
  label,
  active,
  disabled,
  onClick,
  children,
}: {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      title={label}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      // Keep the text selection when clicking a toolbar button.
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={cn("size-8", active && "bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary")}
    >
      {children}
    </Button>
  );
}

function Sep() {
  return <span className="mx-0.5 h-5 w-px bg-border" aria-hidden />;
}

/* ---------------------------------- dialogs --------------------------------- */

function EditorDialog({
  title,
  description,
  onClose,
  children,
}: {
  title: string;
  description?: string;
  onClose: () => void;
  children: ReactNode;
}) {
  useLenisLock(true);
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
}

function LinkDialog({ editor, onClose }: { editor: Editor; onClose: () => void }) {
  const existing = (editor.getAttributes("link").href as string | undefined) ?? "";
  const [href, setHref] = useState(existing);
  const [error, setError] = useState<string | null>(null);

  function save(e: React.FormEvent) {
    e.preventDefault();
    // React bubbles submit through the portal to the page form; stop it here.
    e.stopPropagation();
    if (!href.trim()) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      onClose();
      return;
    }
    const url = normalizeHref(href);
    if (!url) {
      setError("Use a page like /products, a full https:// link, mailto: or tel:");
      return;
    }
    const chain = editor.chain().focus().extendMarkRange("link");
    if (editor.state.selection.empty && !existing) {
      // Nothing selected: insert the link text itself.
      chain.insertContent({ type: "text", text: url, marks: [{ type: "link", attrs: { href: url } }] }).run();
    } else {
      chain.setLink({ href: url }).run();
    }
    onClose();
  }

  return (
    <EditorDialog
      title={existing ? "Edit link" : "Add link"}
      description="Link to a page on your store (e.g. /products) or another website."
      onClose={onClose}
    >
      <form onSubmit={save} className="grid gap-4">
        <div>
          <Label htmlFor="link-href" className="mb-1.5 block">
            Link
          </Label>
          <Input
            id="link-href"
            value={href}
            onChange={(e) => {
              setHref(e.target.value);
              setError(null);
            }}
            placeholder="/products or https://…"
            autoFocus
          />
          {error && <p className="mt-1.5 text-xs font-medium text-destructive">{error}</p>}
        </div>
        <DialogFooter>
          {existing && (
            <Button
              type="button"
              variant="ghost"
              className="text-destructive"
              onClick={() => {
                editor.chain().focus().extendMarkRange("link").unsetLink().run();
                onClose();
              }}
            >
              Remove link
            </Button>
          )}
          <Button type="submit">Save link</Button>
        </DialogFooter>
      </form>
    </EditorDialog>
  );
}

function ImageDialog({
  editor,
  onClose,
  onUpload,
}: {
  editor: Editor;
  onClose: () => void;
  onUpload: (file: File) => void;
}) {
  const editing = editor.isActive("image");
  const attrs = editing ? editor.getAttributes("image") : {};
  const [src, setSrc] = useState<string>(attrs.src ?? "");
  const [alt, setAlt] = useState<string>(attrs.alt ?? "");
  const [rounded, setRounded] = useState<boolean>(Boolean(attrs.rounded));
  const [error, setError] = useState<string | null>(null);

  function save(e: React.FormEvent) {
    e.preventDefault();
    // React bubbles submit through the portal to the page form; stop it here.
    e.stopPropagation();
    if (!/^https:\/\//i.test(src.trim())) {
      setError("Use an https:// image link, or upload a file.");
      return;
    }
    const next = { src: src.trim(), alt: alt.trim() || null, rounded };
    if (editing) editor.chain().focus().updateAttributes("image", next).run();
    else editor.chain().focus().insertContent({ type: "image", attrs: next }).run();
    onClose();
  }

  return (
    <EditorDialog
      title={editing ? "Edit image" : "Add image"}
      description="Upload a photo or paste an image link. Drag the image's edges in the editor to resize it."
      onClose={onClose}
    >
      <form onSubmit={save} className="grid gap-4">
        {!editing && (
          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed p-5 text-sm font-semibold text-muted-foreground hover:border-primary hover:text-primary">
            <Upload className="size-4" /> Upload from your device
            <input
              type="file"
              accept={IMAGE_TYPES.join(",")}
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onUpload(f);
              }}
            />
          </label>
        )}
        <div>
          <Label htmlFor="img-src" className="mb-1.5 block">
            {editing ? "Image link" : "…or image link"}
          </Label>
          <Input
            id="img-src"
            value={src}
            onChange={(e) => {
              setSrc(e.target.value);
              setError(null);
            }}
            placeholder="https://…"
          />
          {error && <p className="mt-1.5 text-xs font-medium text-destructive">{error}</p>}
        </div>
        <div>
          <Label htmlFor="img-alt" className="mb-1.5 block">
            Description (alt text)
          </Label>
          <Input
            id="img-alt"
            value={alt}
            onChange={(e) => setAlt(e.target.value)}
            placeholder="e.g. Gold bangles, size 2.4"
            maxLength={150}
          />
          <p className="mt-1.5 text-xs text-muted-foreground">Helps Google and screen readers understand the image.</p>
        </div>
        <label className="flex cursor-pointer items-center gap-2.5 text-sm">
          <input
            type="checkbox"
            checked={rounded}
            onChange={(e) => setRounded(e.target.checked)}
            className="size-4 accent-primary"
          />
          <span className="font-medium">Rounded corners</span>
        </label>
        <DialogFooter>
          {editing && (
            <Button
              type="button"
              variant="ghost"
              className="text-destructive"
              onClick={() => {
                editor.chain().focus().deleteSelection().run();
                onClose();
              }}
            >
              Remove image
            </Button>
          )}
          <Button type="submit" disabled={!src.trim()}>
            {editing ? "Save" : "Insert image"}
          </Button>
        </DialogFooter>
      </form>
    </EditorDialog>
  );
}
