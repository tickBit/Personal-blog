import { PAGE_SIZE } from "@/App";
import { Post } from "../types";

interface Props {
  posts: Post[];
  page: number;
  totalElements: number;
  onPageChange: (page: number) => void;
  onRead: (id: string) => void;
}

const emojiList = ["😄", "😇", "😍", "😎", "🥳", "😞", "😐"];

export default function PostList({
  posts,
  page,
  totalElements,
  onPageChange,
  onRead,
}: Props) {
  const totalPages = Math.ceil(totalElements / 5);
  
  if (posts.length === 0) {
    return (
      <div className="pt-20 text-center">
        <p
          className="text-[var(--muted-foreground)] text-sm"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          No posts yet. Write something.
        </p>
      </div>
    );
  }

  return (
    <div className="pt-10">
      <ol className="divide-y divide-[var(--border)]">
        {posts.map((post, i) => (
          <PostRow
            key={post.slug}
            post={post}
            index={(totalElements - ((page + 1) * PAGE_SIZE) + (5 - i))}
            onClick={() => onRead(post.id.toString())}
          />
        ))}
      </ol>
      {totalPages > 1 && (
        <nav
          className="grid grid-cols-[1fr_auto_1fr] items-center border-t border-[var(--border)] py-5"
          aria-label="Post pagination"
        >
          <button
            type="button"
            onClick={() => onPageChange(page - 1)}
            disabled={page === 0}
            className="justify-self-start text-[11px] tracking-[0.1em] uppercase text-[var(--muted-foreground)] hover:text-[var(--accent)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            ← Previous
          </button>
          <span
            className="text-[11px] text-[var(--muted-foreground)] tabular-nums"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Page {page + 1} of {totalPages}
          </span>
          <button
            type="button"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages - 1}
            className="justify-self-end text-[11px] tracking-[0.1em] uppercase text-[var(--muted-foreground)] hover:text-[var(--accent)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Next →
          </button>
        </nav>
      )}
    </div>
  );
}

function PostRow({
  post,
  index,
  onClick,
}: {
  post: Post;
  index: number;
  onClick: () => void;
}) {
  return (
    <li>
      <button
        onClick={onClick}
        className="group w-full text-left py-6 flex gap-3 sm:gap-6 sm:py-8 cursor-pointer"
      >
        <span
          className="hidden text-[11px] text-[var(--muted-foreground)] w-7 shrink-0 pt-1 tabular-nums select-none sm:block"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {String(index).padStart(2, "0")}
        </span>
        <div className="flex-1 min-w-0">
          <h2
            className="font-serif text-xl sm:text-2xl font-semibold leading-snug text-[var(--foreground)] group-hover:text-[var(--accent)] transition-colors mb-2"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            {post.title}
          </h2>
          <p
            className="text-[var(--muted-foreground)] text-sm leading-relaxed line-clamp-2 mb-3"
            style={{ fontFamily: "var(--font-body)" }}
          >
            {post.excerpt}
          </p>
          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
            <time
              className="text-[10px] tracking-[0.1em] uppercase text-[var(--muted-foreground)]"
              style={{ fontFamily: "var(--font-mono)" }}
              dateTime={post.createdAt}
            >
              {formatDate(post.createdAt)}
            </time>
            {post.tags.length > 0 && (
              <span className="text-[var(--border)]">·</span>
            )}
            <div className="flex gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] tracking-[0.08em] uppercase text-[var(--muted-foreground)] border border-[var(--border)] px-2 py-0.5"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <div className="flex justify-items-centery gap-4">
              {post.emojies.map((alpha, index) => {
                const emoji = emojiList[index];
                if (!emoji) return null;

                const opacity = alpha >= 0.3 ? alpha : 0;

                return (
                  opacity > 0 &&
                  <span
                    key={emoji}
                    style={{ opacity }}
                    title={`${Math.round(opacity * 100)}%`}
                  >
                    {emoji}
                  </span>
                );
              })}
            </div>
          </div>
          <span className="text-[var(--muted-foreground)] group-hover:text-[var(--accent)] transition-colors text-lg pt-1 shrink-0">
          →
        </span>
      </button>
    </li>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
