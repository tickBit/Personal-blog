import { useState, useCallback, useEffect } from "react";
import { HttpStatusCode } from "axios";

import { Post } from "./types";
import PostList from "./components/PostList";
import PostReader from "./components/PostReader";
import PostEditor from "./components/PostEditor";
import Login from "./components/Login";
import { postService } from "./services/postService";
import { AUTH_CONNECTION_ERROR, authService } from "./services/authService";
import Contact from "./components/Contact";
import Banner from "./components/Banner";
import { STORAGE_KEY, useGuestAuth } from "./context/GuestContext";
import { Header } from "./components/Header";

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
  const [isEmojiAdded, setIsEmojiAdded] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  
  const { guestId, setGuestId, hasAgreed, setHasAgreed, isAnswered, setIsAnswered } = useGuestAuth();
  
  const navigate = useCallback((v: View) => {   
    console.log(v);
    setView(v);
    const path = v.kind === "login" ? "/admin/login" : "/";
    window.history.pushState({}, "", path);
    setDeleteConfirm(null);
    window.scrollTo(0, 0);
  }, []);

  // if the user clears local storage, ask consent again
  useEffect(() => {

    if (localStorage.getItem(STORAGE_KEY) === null) {
      setGuestId(null);
    }

  }, [guestId]);
  
  useEffect(() => {
    const onPopState = () => setView(initialView());
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);
  
  const login = async (username: string, password: string) => {
    const status = await authService.login(username, password);

    if (status >= 200 && status < 300) {
      setAuthenticated(true);
      setError(false);
      setErrorMessage("");
      navigate({ kind: "list" });
      return;
    }

    setAuthenticated(false);
    setError(true);

    if (status === HttpStatusCode.Unauthorized || status === HttpStatusCode.Forbidden) {
      setErrorMessage("Invalid username or password.");
    } else if (status === AUTH_CONNECTION_ERROR) {
      setErrorMessage("Could not connect to the server.");
    } else if (status >= 500) {
      setErrorMessage("Login service is temporarily unavailable.");
    } else {
      setErrorMessage("Login failed. Please try again.");
    }
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
      setErrorMessage("Could not fetch the posts.");
      setPosts([]);
      return;
    }

    if (response && typeof response === "object" && "data" in response) {
      const payload = response.data as { totalElements?: number; content?: Post[] };
      const content = Array.isArray(payload.content) ? payload.content : [];

      setError(false);
      setTotalPosts(payload.totalElements ?? 0);
      setPosts(content);
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
          setErrorMessage("Could not create the post.");
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
          if (await deletePost(id, page) > 0) {
            setError(true);
            setErrorMessage("Could not delete the post.")
          } else {        
            setError(false);
            navigate({ kind: "list" });
          }
          setDeleteConfirm(null);
        } catch (err) {
          // unknown error
          setError(true);
          setErrorMessage("Could not delete the post.")
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
    
  }, [page, isEmojiAdded]);
  
  return (
    <>

    <Header
        error={error}
        onHome={() => navigate({ kind: "list" })}
        onContact={() => navigate({ kind: "contact"})}
        onNew={() => navigate({ kind: "create" })}
        showNew={view.kind !== "create" && view.kind !== "edit"}
        authenticated={authenticated}
        errorMessage={errorMessage}
        onLogout={logout}
      />
    <div className="min-h-screen bg-[var(--background)]">

      <main className="max-w-3xl mx-auto px-6 pt-32 pb-24">
        
        {view.kind !== "login" && !isAnswered && !hasAgreed && (
          <Banner text_en={"Do you accept a random token into your browser's local storage? If you don't, you can't react to posts."}
                  text_fi={"Hyväksytkö satunnaisen tunnisteen selaimesi paikalliseen tallennustilaan? Jollet, et pysty reagoimaan postauksiin. (fi)"}
                  btn_no={"No / Ei"}
                  btn_yes={"Yes / Kyllä"}
                  onCancel={() => { setIsAnswered(true); setHasAgreed(false); }}
                  onConfirm={() => { setIsAnswered(true); setHasAgreed(true); }}
          />
        )}
        
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
            onReaction={async (reaction: string) => {
              if (!currentPost) return -1;
              
              setIsEmojiAdded(false);
              
              const status = await postService.reactToPost(
                  currentPost.id,
                  reaction,
              );

              if (status === HttpStatusCode.Ok) {
                  localStorage.setItem(
                      "portfolio-blog-site-guest",
                      localStorage.getItem("portfolio-blog-site-guest")
                          + "-"
                          + currentPost.id,
                  );

                  setIsEmojiAdded(true);
                  return status;
              }

              if (status === HttpStatusCode.TooManyRequests) {
                  setErrorMessage("Too many requests. Please try again later.");
              } else {
                  setErrorMessage("Reaction could not be saved.");
              }

              setError(true);
              return status;
              
            }}
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
    </>
  );
}

