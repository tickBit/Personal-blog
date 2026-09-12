import { Post } from "../types";
interface Props {
  post: Post;
  onEdit: () => void;
  onDelete: () => void;
  deleteConfirm: boolean;
  onCancelDelete: () => void;
}

type Italics = {
  textStart: number,
  start: number,
  text: string,
};

export default function PostReader({
  post,
  onEdit,
  onDelete,
  deleteConfirm,
  onCancelDelete,
}: Props) {
  return (
    <article className="pt-10">
      {post.coverImage && (
        <div className="mb-10 overflow-hidden bg-[var(--muted)] aspect-[2/1]">
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-full object-cover opacity-90"
          />
        </div>
      )}

      {/* Meta bar */}
      <div
        className="flex items-center gap-4 mb-6 text-[10px] tracking-[0.1em] uppercase text-[var(--muted-foreground)]"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        <time dateTime={post.createdAt}>{formatDate(post.createdAt)}</time>
        {post.updatedAt !== post.createdAt && (
          <>
            <span className="text-[var(--border)]">·</span>
            <span>Updated {formatDate(post.updatedAt)}</span>
          </>
        )}
        {post.tags.length > 0 && (
          <>
            <span className="text-[var(--border)]">·</span>
            <div className="flex gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="border border-[var(--border)] px-2 py-0.5"
                >
                  {tag}
                </span>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Title */}
      <h1
        className="font-serif text-4xl md:text-5xl font-semibold leading-[1.15] text-[var(--foreground)] mb-6"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        {post.title}
      </h1>

      {/* Excerpt as lede */}
      <p
        className="text-xl text-[var(--muted-foreground)] leading-relaxed mb-10 border-l-2 border-[var(--accent)] pl-5 italic"
        style={{ fontFamily: "var(--font-body)" }}
      >
        {post.excerpt}
      </p>

      <hr className="border-[var(--border)] mb-10" />

      {/* Body */}
      <div className="prose max-w-none">
        {renderBody(post.body)}
      </div>

      {/* Actions */}
      <div className="mt-16 pt-8 border-t border-[var(--border)] flex items-center gap-4">
        <button
          onClick={onEdit}
          className="text-[11px] tracking-[0.1em] uppercase text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors border border-[var(--border)] hover:border-[var(--foreground)] px-4 py-2 cursor-pointer"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Edit Post
        </button>

        {!deleteConfirm ? (
          <button
            onClick={onDelete}
            className="text-[11px] tracking-[0.1em] uppercase text-[var(--muted-foreground)] hover:text-red-700 transition-colors px-4 py-2 cursor-pointer"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Delete
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <span
              className="text-[11px] tracking-[0.06em] text-red-700"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Delete permanently?
            </span>
            <button
              onClick={onDelete}
              className="text-[11px] tracking-[0.1em] uppercase text-red-700 border border-red-700 px-3 py-1.5 hover:bg-red-700 hover:text-white transition-colors cursor-pointer"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Confirm
            </button>
            <button
              onClick={onCancelDelete}
              className="text-[11px] tracking-[0.1em] uppercase text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </article>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function renderBody(body: string) {
  const paragraphs = body.split(/\n/);
  return paragraphs.map((block, i) => {
    if (block.startsWith(">")) {
      return (
        <blockquote key={i} className="prose">
          {block.slice(2)}
        </blockquote>
      );
    }
    if (block.startsWith("**") && block.endsWith("**")) {
      return (
        <h3
          key={i}
          className="font-serif text-xl font-semibold mt-8 mb-3 text-[var(--foreground)]"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          {block.slice(2, -2)}
        </h3>
      );
    }
    if (block.includes("*")) {
      let italicText = "";
      let start = 0, end = -1, textStart = 0;
      let italics: Italics[] = [];
      
      for (let i = 0; i < block.length; i++) {
        
        if (block[i] === "*" && i !== end) {
          start = i + 1;
          
          for (let j = i + 1; j < block.length; j++) {
            italicText += block[j];
            if (block[j] === "*") {
              italicText = italicText.slice(0, -1);
              end = j;
              
              italics.push({
                textStart: textStart,
                start: start,
                text: italicText
              });
              italicText = "";
              textStart = j + 1;
              break;
            }
          }
        }
      }
      // print all *emphasized* text areas as emphasized in a paragraph
      return (<div key={i}>
        {italics.length > 0 && italics.map((it, index) => (<span key={i.toString() + index.toString()}>
          {block.slice(it.textStart, it.start - 1)}
          <em>{it.text}</em>
          {index === italics.length - 1 && block.slice(it.start + 1 + it.text.length, block.length) }
        </span>
        ))}
      </div>
      )
    } 
    if (block.includes("\n- ")) {
      const [heading, ...items] = block.split("\n- ");
      return (
        <div key={i}>
          {heading && (
            <p className="prose" style={{ fontFamily: "var(--font-body)" }}>
              {heading}
            </p>
          )}
          <ul className="list-none space-y-1 mb-5">
            {items.map((item, j) => (
              <li
                key={j}
                className="flex gap-3 text-[var(--foreground)] leading-relaxed"
                style={{ fontFamily: "var(--font-body)" }}
              >
                <span className="text-[var(--accent)] mt-1 shrink-0">—</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      );
    }
    return (
      <p
        key={i}
        className="prose"
        style={{ fontFamily: "var(--font-body)", lineHeight: "1.8", marginBottom: "1.25rem", fontSize: "1.0625rem" }}
      >
        {block}
      </p>
    );
  });
}
