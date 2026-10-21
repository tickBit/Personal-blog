export function Header({
  onHome,
  onNew,
  error,
  onContact,
  showNew,
  errorMessage,
  authenticated,
  onLogout,
}: {
  onHome: () => void;
  onNew: () => void;
  error: boolean;
  onContact: () => void;
  showNew: boolean;
  errorMessage: string;
  authenticated: boolean;
  onLogout: () => void;
}) {
  return (
    <header className="fixed inset-x-0 top-0 z-50 max-w-3xl mx-auto bg-[var(--background)] px-6 pt-10 pb-8">
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
        {error === true ? (
           <div className="flex flex bg-red-100 items-right gap-4 text-[var(--muted-foreground)] transition-colors border-[var(--border)] px-3 py-1.5">
            Status:
            <div>
              {errorMessage}
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
        {!authenticated && (
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
        )}
      </div>
    </header>
  );
}
