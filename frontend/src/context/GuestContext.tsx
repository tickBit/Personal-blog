import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type PropsWithChildren,
} from "react";

type GuestContextValue = {
  guestId: string | null;
};

const STORAGE_KEY = "portfolio-blog-site-guest";

const GuestContext = createContext<GuestContextValue | undefined>(undefined);

export function useGuestAuth(): GuestContextValue {
  const context = useContext(GuestContext);

  if (!context) {
    throw new Error("useGuestAuth must be used inside GuestProvider");
  }

  return context;
}

export function GuestProvider({ children }: PropsWithChildren) {
  const [guestId, setGuestId] = useState<string | null>(null);
  const initialized = useRef(false);

  useEffect(() => {
    // Prevents a second run in React Strict Mode in development mode
    // from interpreting a newly created token as a previous visit.
    if (initialized.current) return;
    initialized.current = true;

    try {
      const existingGuestId = localStorage.getItem(STORAGE_KEY);

      if (existingGuestId) {
        setGuestId(existingGuestId);
        return;
      } else {
        const newGuestId = crypto.randomUUID();
        localStorage.setItem(STORAGE_KEY, newGuestId);
        setGuestId(newGuestId);
      }
    } catch {
      // null means that the visitor status could not be verified
      setGuestId(null);
    }
  }, []);

  return (
    <GuestContext.Provider value={{ guestId }}>
      {children}
    </GuestContext.Provider>
  );
}