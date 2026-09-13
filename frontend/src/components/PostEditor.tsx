import { useState, useCallback } from "react";
import axios from "axios";
import { Post } from "../types";

const credentials = btoa(
  `${import.meta.env.VITE_ADMIN_USERNAME}:${import.meta.env.VITE_ADMIN_PASSWORD}`
);

interface Props {
  post: Post | null;
  onSave: (newPost: Post) => void;
  onCancel: () => void;
}

export default function PostEditor({ post, onSave, onCancel }: Props) {
  const [title, setTitle] = useState(post?.title ?? "");
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [body, setBody] = useState(post?.body ?? "");
  const [tagsInput, setTagsInput] = useState(post?.tags.join(", ") ?? "");
  const [coverImage, setCoverImage] = useState(post?.coverImage ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const validate = useCallback(() => {
    const e: Record<string, string> = {};
    if (!title.trim()) e.title = "Title is required.";
    if (!excerpt.trim()) e.excerpt = "Excerpt is required.";
    if (!body.trim()) e.body = "Body is required.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }, [title, excerpt, body]);
  
  const save = async (tags: string[]): Promise<Post | undefined> => {
    if (!validate()) return;
    
    try {  
      const response = await axios.put(`http://localhost:8080/api/posts/${post?.id || ""}`,
          { title: title.trim(), excerpt: excerpt.trim(), body: body.trim(), tags, coverImage: coverImage.trim() || undefined },
          { headers: {
            Authorization: `Basic ${credentials}`,
            "Content-Type": "application/json",
          }
          });
      return response.data;
    }
    catch (err) {
      console.log(err);
    }
    
    
  };
  
  const postNew = async (tags: string[]): Promise<Post | undefined> => {
    
    if (!validate()) return;

    try {
      const response = await axios.post(`http://localhost:8080/api/posts`,
          { title: title.trim(), excerpt: excerpt.trim(), body: body.trim(), tags, coverImage: coverImage.trim() || undefined },
      { headers: {
            Authorization: `Basic ${credentials}`,
            "Content-Type": "application/json",
        }
      });
      console.log(response.data)
      return response.data;
      
    } catch (err) {
      console.log(err);
    }
  }
  
  const handleSubmit = useCallback(async(isEditing: boolean) => {
    if (!validate()) return;
    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
 
    const newPost = isEditing ? await save(tags) : await postNew(tags);
    
    onSave(newPost!)
    
  }, [validate, title, excerpt, body, tagsInput, coverImage, onSave]);

  const isEditing = post !== null;

  return (
    <div className="pt-10">
      <div className="flex items-center justify-between mb-10">
        <h1
          className="font-serif text-3xl font-semibold text-[var(--foreground)]"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          {isEditing ? "Edit Post" : "New Post"}
        </h1>
        <button
          onClick={onCancel}
          className="text-[11px] tracking-[0.1em] uppercase text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          ← Cancel
        </button>
      </div>

      <div className="space-y-7">
        <Field label="Title" error={errors.title} required>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="The title of your post"
            className={inputCls(!!errors.title)}
            style={{ fontFamily: "var(--font-serif)", fontSize: "1.25rem" }}
          />
        </Field>

        <Field label="Excerpt" error={errors.excerpt} required hint="One or two sentences shown in the post list.">
          <textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder="A short teaser for the post…"
            rows={3}
            className={inputCls(!!errors.excerpt)}
          />
        </Field>

        <Field label="Body" error={errors.body} required hint="Separate paragraphs with a blank line. Start a line with '> ' for a blockquote, '**Bold**' for a subheading, or '- item' for a list.">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write the full post here…"
            rows={18}
            className={inputCls(!!errors.body)}
          />
        </Field>

        <div className="grid grid-cols-2 gap-6">
          <Field label="Tags" hint="Comma-separated.">
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="writing, craft, notes"
              className={inputCls(false)}
            />
          </Field>
          <Field label="Cover Image URL" hint="Optional Unsplash or other image URL.">
            <input
              type="url"
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              placeholder="https://images.unsplash.com/…"
              className={inputCls(false)}
            />
          </Field>
        </div>

        {coverImage && (
          <div className="overflow-hidden bg-[var(--muted)] aspect-[3/1]">
            <img src={coverImage} alt="Cover preview" className="w-full h-full object-cover opacity-80" />
          </div>
        )}
      </div>

      <div className="mt-12 pt-8 border-t border-[var(--border)] flex items-center gap-4">
        <button
          onClick={() => handleSubmit(isEditing)}
          className="text-[11px] tracking-[0.1em] uppercase bg-[var(--primary)] text-[var(--primary-foreground)] px-6 py-2.5 hover:bg-[var(--accent)] transition-colors cursor-pointer"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {isEditing ? "Save Changes" : "Publish Post"}
        </button>
        <button
          onClick={onCancel}
          className="text-[11px] tracking-[0.1em] uppercase text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors border border-[var(--border)] px-4 py-2.5 hover:border-[var(--foreground)] cursor-pointer"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

function inputCls(hasError: boolean) {
  return [
    "w-full bg-[var(--card)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]",
    "border px-4 py-3 text-sm leading-relaxed outline-none",
    "focus:border-[var(--foreground)] transition-colors resize-none",
    hasError ? "border-red-600" : "border-[var(--border)]",
  ].join(" ");
}

function Field({
  label,
  children,
  error,
  hint,
  required,
}: {
  label: string;
  children: React.ReactNode;
  error?: string;
  hint?: string;
  required?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        className="text-[10px] tracking-[0.12em] uppercase text-[var(--muted-foreground)] flex items-center gap-1"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {label}
        {required && <span className="text-[var(--accent)]">*</span>}
      </label>
      {children}
      {hint && !error && (
        <p
          className="text-[10px] text-[var(--muted-foreground)] leading-relaxed"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {hint}
        </p>
      )}
      {error && (
        <p
          className="text-[10px] text-red-600"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {error}
        </p>
      )}
    </div>
  );
}
