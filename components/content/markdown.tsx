import Link from "next/link";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

/*
 * Renders admin-written page content. Raw HTML in the markdown is shown as
 * text (no rehype-raw) and react-markdown strips javascript: links, so page
 * content can't inject scripts into the store.
 */

const components: Components = {
  h1: ({ children }) => <h2 className="mt-10 font-heading text-3xl font-bold">{children}</h2>,
  h2: ({ children }) => <h2 className="mt-10 font-heading text-2xl font-bold">{children}</h2>,
  h3: ({ children }) => <h3 className="mt-8 font-heading text-xl font-bold">{children}</h3>,
  h4: ({ children }) => <h4 className="mt-6 text-lg font-bold">{children}</h4>,
  p: ({ children }) => <p className="mt-4 leading-relaxed">{children}</p>,
  ul: ({ children }) => <ul className="mt-4 list-disc space-y-1.5 pl-6">{children}</ul>,
  ol: ({ children }) => <ol className="mt-4 list-decimal space-y-1.5 pl-6">{children}</ol>,
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  strong: ({ children }) => <strong className="font-bold">{children}</strong>,
  blockquote: ({ children }) => (
    <blockquote className="mt-4 border-l-4 border-primary/40 pl-4 italic text-muted-foreground">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="my-8 border-border" />,
  code: ({ children }) => (
    <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.9em]">{children}</code>
  ),
  table: ({ children }) => (
    <div className="mt-4 overflow-x-auto">
      <table className="w-full border-collapse text-sm">{children}</table>
    </div>
  ),
  th: ({ children }) => <th className="border-b px-3 py-2 text-left font-bold">{children}</th>,
  td: ({ children }) => <td className="border-b px-3 py-2 align-top">{children}</td>,
  a: ({ href = "", children }) =>
    href.startsWith("/") ? (
      <Link href={href} className="font-semibold text-primary underline underline-offset-2">
        {children}
      </Link>
    ) : (
      <a
        href={href}
        target={href.startsWith("http") ? "_blank" : undefined}
        rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
        className="font-semibold text-primary underline underline-offset-2"
      >
        {children}
      </a>
    ),
  img: ({ src, alt }) =>
    typeof src === "string" && src.startsWith("https://") ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt={alt ?? ""} className="mt-4 rounded-2xl" loading="lazy" />
    ) : null,
};

export function Markdown({ children }: { children: string }) {
  return (
    <div className="text-base text-foreground/90 [&>*:first-child]:mt-0">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {children}
      </ReactMarkdown>
    </div>
  );
}
