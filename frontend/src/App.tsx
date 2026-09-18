import { useState, useCallback, useEffect } from "react";
import { Post } from "./types";
import PostList from "./components/PostList";
import PostReader from "./components/PostReader";
import PostEditor from "./components/PostEditor";
import { postService } from "./services/postService";

const credentials = btoa(
  `${import.meta.env.VITE_ADMIN_USERNAME}:${import.meta.env.VITE_ADMIN_PASSWORD}`
);

const PAGE_SIZE = 5;

type View =
  | { kind: "list" }
  | { kind: "read"; id: string }
  | { kind: "edit"; id: string }
  | { kind: "create" };

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

  const deletePost = async(id: string, page: number) => {
  
    const response = await postService.deletePost(id, page);
    if (response !== undefined) setPosts(response);
    return undefined;
  }

  const readPosts = async (page: number) => {
    const response = await postService.readPosts(page, PAGE_SIZE);
    
    if (response !== undefined) {
      setTotalPosts(response.data.totalElements);
      setPosts(response.data.content);
    }
    
    console.log("ReadPosts: ", response);
  };
    
   const handleSave = useCallback(
    (posts: Post[]) => {
      if (view.kind === "create") {
        
        setPosts(posts);
        navigate({ kind: "list" });
      } else if (view.kind === "edit") {
        setPosts(posts);
          
        navigate({ kind: "read", id: currentPost!.slug });
      }
    },
    [view, navigate]
  );

  const handleDelete = useCallback (
    async(id: string, page: number) => {
      if (deleteConfirm === id) {
        
        console.log(await deletePost(id, page));        
        
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
      ? posts.find((p) => p?.slug === view.id) ?? null
      : null;
  
  useEffect(() => {
   
    readPosts(page); 
    
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
            onRead={(slug) => navigate({ kind: "read", id: slug })}
          />
        )}
        {view.kind === "read" && currentPost && (
          <PostReader
            post={currentPost}
            onEdit={() => navigate({ kind: "edit", id: currentPost.slug })}
            onDelete={() => handleDelete(currentPost.id, page)}
            deleteConfirm={deleteConfirm === currentPost.id}
            onCancelDelete={() => setDeleteConfirm(null)}
          />
        )}
        {view.kind === "create" && (
          <PostEditor
            post={null}
            page={page}
            onSave={ handleSave }
            onCancel={() => navigate({ kind: "list" })}
          />
        )}
        {view.kind === "edit" && currentPost && (
          <PostEditor
            post={currentPost}
            page={page}
            onSave={handleSave}
            onCancel={() => navigate({ kind: "read", id: currentPost.slug })}
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
