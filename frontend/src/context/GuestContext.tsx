import {
  createContext,
  useContext,
  useEffect,
  useState,
  type Dispatch,
  type SetStateAction,
  type PropsWithChildren,
} from "react";

type GuestContextValue = {
  guestId: string | null;
  setGuestId: Dispatch<SetStateAction<string | null>>;
  hasAgreed: boolean;
  setHasAgreed: Dispatch<SetStateAction<boolean>>;
  isAnswered: boolean;
  setIsAnswered: Dispatch<SetStateAction<boolean>>;
};

export const STORAGE_KEY = "portfolio-blog-site-guest";

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
  const [hasAgreed, setHasAgreed] = useState<boolean>(false);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  
  useEffect(() => {
    if (guestId !== null || hasAgreed === false) return;

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
  }, [guestId, hasAgreed]);

  return (
    <GuestContext.Provider value={{ guestId, setGuestId, hasAgreed, setHasAgreed, setIsAnswered, isAnswered }}>
      {children}
    </GuestContext.Provider>
  );
}
