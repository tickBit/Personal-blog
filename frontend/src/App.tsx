import { useState, useCallback, useEffect } from "react";
import { Post } from "./types";
import PostList from "./components/PostList";
import PostReader from "./components/PostReader";
import PostEditor from "./components/PostEditor";
import axios from "axios";

const credentials = btoa(
  `${import.meta.env.VITE_ADMIN_USERNAME}:${import.meta.env.VITE_ADMIN_PASSWORD}`
);

const PAGE_SIZE = 5;

type View =
  | { kind: "list" }
  | { kind: "read"; id: string }
  | { kind: "edit"; id: string }
  | { kind: "create" };

function slugify(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function App() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [view, setView] = useState<View>({ kind: "list" });
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [totalPosts, setTotalPosts] = useState(0);
  
  const navigate = useCallback((v: View) => {
    setView(v);
    setDeleteConfirm(null);
    window.scrollTo(0, 0);
  }, []);

  const deletePost = async(id: string) => {
  
      try {  
      const response = await axios.delete(`http://localhost:8080/api/posts/${id}`,
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
  }

  const readPosts = async () => {
    try {
      const response = await axios.get("http://localhost:8080/api/posts", {
        headers: {
          "Content-Type": "application/json",
        },
        params: {
          page,
          size: PAGE_SIZE,
          sortBy: "createdAt",
          descending: true,
        },
      });

      if (response.data.content) {
        setPosts(response.data.content);
        setPage(response.data.page);
        setTotalPosts(response.data.totalElements);
      }
    } catch (error) {
      console.log(error);
    }
  };
    
   const handleSave = useCallback(
    (newPost: Post) => {
      if (view.kind === "create") {
        
        console.log(newPost);
        setPosts((prev) => [newPost, ...prev]);
        navigate({ kind: "list" });
      } else if (view.kind === "edit") {
        console.log(newPost.id)
        setPosts((prev) => [newPost, ...prev]);
          
        navigate({ kind: "read", id: newPost.id });
      }
    },
    [view, navigate]
  );

  const handleDelete = useCallback(
    (id: string) => {
      if (deleteConfirm === id) {
        
        deletePost(id);
        
        setPosts((prev) => prev.filter((p) => p.id !== id));
        navigate({ kind: "list" });
        setDeleteConfirm(null);
      } else {
        setDeleteConfirm(id);
      }
    },
    [deleteConfirm, navigate]
  );

  const currentPost =
    view.kind === "read" || view.kind === "edit"
      ? posts.find((p) => p?.id === view.id) ?? null
      : null;
  
  useEffect(() => {
    readPosts();
  }, [page]);
  
  return (
    <div className="min-h-full bg-[var(--background)]">
      <Header
        onHome={() => navigate({ kind: "list" })}
        onNew={() => navigate({ kind: "create" })}
        showNew={view.kind !== "create" && view.kind !== "edit"}
      />

      <main className="max-w-3xl mx-auto px-6 pb-24">
        {view.kind === "list" && (
          <PostList
            posts={posts}
            page={page}
            totalElements={totalPosts}
            onPageChange={setPage}
            onRead={(id) => navigate({ kind: "read", id })}
          />
        )}
        {view.kind === "read" && currentPost && (
          <PostReader
            post={currentPost}
            onEdit={() => navigate({ kind: "edit", id: currentPost.id })}
            onDelete={() => handleDelete(currentPost.id)}
            deleteConfirm={deleteConfirm === currentPost.id}
            onCancelDelete={() => setDeleteConfirm(null)}
          />
        )}
        {view.kind === "create" && (
          <PostEditor
            post={null}
            onSave={ handleSave }
            onCancel={() => navigate({ kind: "list" })}
          />
        )}
        {view.kind === "edit" && currentPost && (
          <PostEditor
            post={currentPost}
            onSave={handleSave}
            onCancel={() => navigate({ kind: "read", id: currentPost.id })}
          />
        )}
      </main>
    </div>
  );
}

function Header({
  onHome,
  onNew,
  showNew,
}: {
  onHome: () => void;
  onNew: () => void;
  showNew: boolean;
}) {
  return (
    <header className="max-w-3xl mx-auto px-6 pt-10 pb-8">
      <div className="flex items-baseline justify-between border-b border-[var(--border)] pb-5">
        <button
          onClick={onHome}
          className="group flex flex-col gap-0.5 text-left cursor-pointer"
        >
          <span
            className="font-serif text-2xl font-semibold tracking-tight text-[var(--foreground)] group-hover:text-[var(--accent)] transition-colors"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            Marginal Notes
          </span>
          <span
            className="text-[11px] tracking-[0.12em] uppercase text-[var(--muted-foreground)]"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            A Personal Journal
          </span>
        </button>
        {showNew && (
          <button
            onClick={onNew}
            className="flex items-center gap-1.5 text-[11px] tracking-[0.1em] uppercase text-[var(--muted-foreground)] hover:text-[var(--accent)] transition-colors cursor-pointer border border-[var(--border)] hover:border-[var(--accent)] px-3 py-1.5"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            <span>+</span>
            <span>New Post</span>
          </button>
        )}
      </div>
    </header>
  );
}
