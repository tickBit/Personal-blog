import { SubmitEvent, useState } from "react";

type LoginProps = {
  onLogin: (username: string, password: string) => Promise<void>;
  onCancel: () => void;
};

export default function Login({ onLogin, onCancel }: LoginProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event: SubmitEvent) => {
    event.preventDefault();
    setSubmitting(true);
    
    try {
      await onLogin(username, password);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mx-auto max-w-sm px-0 pt-8 sm:px-4 sm:pt-14">
      <h1 className="font-serif text-3xl font-semibold mb-8">Sign in</h1>
      <form onSubmit={submit} className="flex flex-col gap-5">
        <label className="flex flex-col gap-2 text-sm">
          Username
          <input
            autoComplete="username"
            autoFocus
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            className="bg-transparent border border-[var(--border)] px-3 py-2 outline-none focus:border-[var(--accent)]"
            required
          />
        </label>
        <label className="flex flex-col gap-2 text-sm">
          Password
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="bg-transparent border border-[var(--border)] px-3 py-2 outline-none focus:border-[var(--accent)]"
            required
          />
        </label>
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="bg-[var(--primary)] text-[var(--primary-foreground)] px-4 py-2 disabled:opacity-60 cursor-pointer"
          >
            {submitting ? "Signing in…" : "Sign in"}
          </button>
          <button type="button" onClick={onCancel} className="px-4 py-2 cursor-pointer">
            Cancel
          </button>
        </div>
      </form>
    </section>
  );
}
