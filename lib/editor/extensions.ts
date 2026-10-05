import type { AnyExtension } from "@tiptap/core";
import { StarterKit } from "@tiptap/starter-kit";
import { Image } from "@tiptap/extension-image";
import { TableKit } from "@tiptap/extension-table";
import {
  splitImageStyle,
  widthFromCloudinaryUrl,
  withCloudinaryWidth,
  withImageStyle,
} from "@/lib/cloudinary-url";

/*
 * Editor schema for content pages, shared by the admin editor and tests.
 * Everything here must round-trip through markdown (how pages are stored)
 * and display with components/content/markdown.tsx on the public site.
 */

/**
 * Images whose resized width (Cloudinary URL) and rounded-corner choice
 * ("#rounded" on the link) survive in markdown.
 */
export const PageImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      rounded: {
        default: false,
        parseHTML: (el) => el.hasAttribute("data-rounded"),
        renderHTML: (attrs) => (attrs.rounded ? { "data-rounded": "" } : {}),
      },
    };
  },

  parseMarkdown: (token, helpers) => {
    const { src, rounded } = splitImageStyle(String(token.href ?? ""));
    return helpers.createNode("image", {
      src,
      alt: token.text || null,
      title: token.title || null,
      width: widthFromCloudinaryUrl(src),
      rounded,
    });
  },

  renderMarkdown: (node) => {
    const src = withImageStyle(
      withCloudinaryWidth(String(node.attrs?.src ?? ""), node.attrs?.width),
      Boolean(node.attrs?.rounded),
    );
    const alt = String(node.attrs?.alt ?? "").replace(/[[\]]/g, "");
    const title = String(node.attrs?.title ?? "").replace(/"/g, "'");
    return title ? `![${alt}](${src} "${title}")` : `![${alt}](${src})`;
  },
}).configure({
  inline: false,
  allowBase64: false,
  resize: {
    enabled: true,
    directions: ["right", "bottom-right", "left", "bottom-left"],
    minWidth: 80,
    minHeight: 40,
    alwaysPreserveAspectRatio: true,
  },
});

export function pageEditorExtensions(): AnyExtension[] {
  return [
    StarterKit.configure({
      // Markdown has no underline; the public page would show "++text++".
      underline: false,
      heading: { levels: [1, 2, 3, 4] },
      link: {
        openOnClick: false,
        autolink: true,
        defaultProtocol: "https",
      },
    }),
    PageImage,
    TableKit.configure({ table: { resizable: false } }),
  ];
}
