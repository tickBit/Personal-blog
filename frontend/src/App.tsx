import { useState, useCallback, useEffect } from "react";
import { Post } from "./types";
import PostList from "./components/PostList";
import PostReader from "./components/PostReader";
import PostEditor from "./components/PostEditor";
import Login from "./components/Login";
import { postService } from "./services/postService";
import { authService } from "./services/authService";
import Contact from "./components/Contact";
import { HttpStatusCode } from "axios";

export const PAGE_SIZE = 5;

type View =
  | { kind: "list" }
  | { kind: "read"; id: string }
  | { kind: "edit"; id: string }
  | { kind: "create" }
  | { kind: "contact" }
  | { kind: "login" };

const initialView = (): View =>
  window.location.pathname === "/admin/login" ? { kind: "login" } : { kind: "list" };

export default function App() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [view, setView] = useState<View>(initialView);
  const [authenticated, setAuthenticated] = useState(authService.isAuthenticated);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [totalPosts, setTotalPosts] = useState(0);
  const [error, setError] = useState<boolean>(false);
  
  const navigate = useCallback((v: View) => {   
    console.log(v);
    setView(v);
    const path = v.kind === "login" ? "/admin/login" : "/";
    window.history.pushState({}, "", path);
    setDeleteConfirm(null);
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const onPopState = () => setView(initialView());
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const login = async (username: string, password: string) => {
    await authService.login(username, password);
    setAuthenticated(true);
    navigate({ kind: "list" });
  };

  const logout = () => {
    authService.logout();
    setAuthenticated(false);
    navigate({ kind: "list" });
  };

  const deletePost = async(id: string, page: number) => {
  
    const response = await postService.deletePost(id, page);
    
    if (typeof(response) === 'number' && response >= 400) {
      console.log("Error code:", response);
      setError(true);
      return response;
    }
    if (response !== undefined && (typeof response !== 'number')) {
      setPosts(prev => prev.filter(post => post.id !== id));
      
      if (posts.length < 5) readPosts(page);
      
      setError(false);
      return 0;
    }
    else {
      // unknown error
      setError(true);
      setPosts([])
      return HttpStatusCode.InternalServerError;
    }
  }

  const readPosts = async (page: number) => {
    const response = await postService.readPosts(page, PAGE_SIZE);

    if (typeof response === "number") {
      setError(true);
      setPosts([]);
      return;
    }

    if (response && typeof response === "object" && "data" in response) {
      const payload = response.data as { totalElements?: number; content?: Post[] };
      const content = Array.isArray(payload.content) ? payload.content : [];

      setError(false);
      setTotalPosts(payload.totalElements ?? 0);
      setPosts(content);
      
      navigate({kind: "list"});
      return;
    }

    setError(true);
    setPosts([]);
  };
    
   const handleSave = useCallback(
    (data: Post | number) => {
      
      if (view.kind === "create") {
        
        if (typeof data !== "number" && data && typeof data === "object") {
          setError(false);
          setPosts(prevPosts => [data as Post, ...prevPosts]);
        }
        navigate({ kind: "list" });
        return;
      } else if (view.kind === "edit") {
        
        if (typeof data !== "number" && data && typeof data === "object") {
          
          // convert id to String in data
          const savedPost = { ...data, id: String(data.id)}
          
          setPosts(prevPosts => [...prevPosts.map(post => post.id === savedPost.id ? savedPost as Post : post)]);
          setError(false);
          navigate({ kind: "read", id: savedPost.id });
          return;
        } else {
          setError(true);
          navigate({ kind: "list" });
          return;
        }
      }
    },
    [view, navigate]
  );

  const handleDelete = useCallback (
    async(id: string, page: number) => {
      if (deleteConfirm === id) {
        
        try {
          if (await deletePost(id, page) > 0) setError(true); else {        
            setError(false);
            navigate({ kind: "list" });
          }
          setDeleteConfirm(null);
        } catch (err) {
          // unknown error
          setError(true);
        }
        
      } else {
        setDeleteConfirm(id);
      }
    },
    [deleteConfirm, navigate]
  );
  
  const handleContact = () => {
    console.log("handle contact");
  };
  
  const currentPost =
    (view.kind === "read" || view.kind === "edit")
      ? posts!.find((p) => p?.id === view.id) ?? null
      : null;
  
  useEffect(() => {
   
    readPosts(page); 
    
  }, [page]);
  
  return (
    <div className="min-h-full bg-[var(--background)]">
      <Header
        error={error}
        onHome={() => navigate({ kind: "list" })}
        onContact={() => navigate({ kind: "contact"})}
        onNew={() => navigate({ kind: "create" })}
        showNew={view.kind !== "create" && view.kind !== "edit"}
        authenticated={authenticated}
        onLogout={logout}
      />

      <main className="max-w-3xl mx-auto px-6 pb-24">
        {view.kind === "login" && <Login onLogin={login} onCancel={() => navigate({ kind: "list" })} />}
        {view.kind === "list" && (
          <PostList
            posts={posts}
            page={page}
            totalElements={totalPosts}
            onPageChange={setPage}
            onRead={(id) => navigate({ kind: "read", id: id.toString() })}
          />
        )}
        {view.kind === "read" && currentPost && (
          <PostReader
            post={currentPost}
            onEdit={authenticated ? () => navigate({ kind: "edit", id: currentPost!.id.toString() }) : undefined}
            onDelete={authenticated ? () => handleDelete(currentPost!.id, page) : undefined}
            deleteConfirm={deleteConfirm === currentPost.id}
            onCancelDelete={() => setDeleteConfirm(null)}
          />
        )}
        {view.kind === "create" && authenticated && (
          <PostEditor
            post={null}
            page={page}
            onSave={ handleSave }
            onCancel={() => navigate({ kind: "list" })}
          />
        )}
        {view.kind === "edit" && currentPost && authenticated && (
          <PostEditor
            post={currentPost}
            page={page}
            onSave={handleSave}
            onCancel={() => navigate({ kind: "read", id: currentPost!.id.toString() })}
          />
        )}
        {view.kind === "contact" && (
          <Contact
            onContact={() => handleContact()}
            onCancel={() => navigate({ kind: "list"})}
          />
        )}
      </main>
    </div>
  );
}

function Header({
  onHome,
  onNew,
  error,
  onContact,
  showNew,
  authenticated,
  onLogout,
}: {
  onHome: () => void;
  onNew: () => void;
  error: boolean;
  onContact: () => void;
  showNew: boolean;
  authenticated: boolean;
  onLogout: () => void;
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
            Full-stack Notes
          </span>
          <span
            className="text-[11px] tracking-[0.12em] uppercase text-[var(--muted-foreground)]"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            A Portfolio Project
          </span>
        </button>
        {!authenticated ? (
        <div className="flex items-right gap-4">
          <button onClick={ onContact }
            className="flex items-center gap-1.5 text-[11px] tracking-[0.1em] uppercase text-[var(--muted-foreground)] hover:text-[var(--accent)] transition-colors cursor-pointer border border-[var(--border)] hover:border-[var(--accent)] px-3 py-1.5"
            style={{ fontFamily: "var(--font-mono)" }}
          >
          <span>
            Contact
          </span>
          </button>
        </div>
        ) : (<>
          {error === true ? (
           <div className="flex flex bg-red-100 items-right gap-4 text-[var(--muted-foreground)] transition-colors border-[var(--border)] px-3 py-1.5">
            Status:
            <div>
              Error.
            </div>
           </div>
                    )
                  : (
           <div className="flex flex bg-green-100 items-right gap-4 text-[var(--muted-foreground)] transition-colors border border-[var(--border)] px-3 py-1.5">
            Status:
            <div>
              Ok.
            </div>
          </div> 
        )}
          </>)
        }
         
        {authenticated && (
          <div className="flex items-center gap-4">
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
            <button onClick={onLogout} className="text-[11px] uppercase tracking-[0.1em] text-[var(--muted-foreground)] hover:text-[var(--accent)] cursor-pointer">
              Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
