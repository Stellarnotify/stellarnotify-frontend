"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";

interface AnnouncerContextValue {
  announce: (message: string, politeness?: "polite" | "assertive") => void;
}

const AnnouncerContext = createContext<AnnouncerContextValue>({
  announce: () => {},
});

export function useAnnouncer() {
  return useContext(AnnouncerContext);
}

interface Props {
  children: React.ReactNode;
}

export function LiveAnnouncer({ children }: Props) {
  const [politeMsg, setPoliteMsg] = useState("");
  const [assertiveMsg, setAssertiveMsg] = useState("");
  // Use a counter suffix to force React to update even for identical messages
  const countRef = useRef(0);

  const announce = useCallback(
    (message: string, politeness: "polite" | "assertive" = "polite") => {
      countRef.current += 1;
      const stamped = `${message} `; // trailing space forces DOM update
      if (politeness === "assertive") {
        setAssertiveMsg(stamped);
      } else {
        setPoliteMsg(stamped);
      }
    },
    []
  );

  return (
    <AnnouncerContext.Provider value={{ announce }}>
      {children}
      {/* Visually hidden live regions — always in the DOM */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {politeMsg}
      </div>
      <div className="sr-only" aria-live="assertive" aria-atomic="true">
        {assertiveMsg}
      </div>
    </AnnouncerContext.Provider>
  );
}
