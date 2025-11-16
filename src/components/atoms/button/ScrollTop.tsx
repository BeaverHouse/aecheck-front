import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface ScrollTopProps {
  children: React.ReactElement;
}

function ScrollTop({ children }: ScrollTopProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 100) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const handleClick = () => {
    const anchor = document.querySelector("#back-to-top-anchor");
    if (anchor) {
      anchor.scrollIntoView({
        block: "center",
        behavior: "smooth",
      });
    }
  };

  return (
    <div
      onClick={handleClick}
      className={cn(
        "fixed bottom-4 right-4 transition-opacity duration-200",
        isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
      )}
    >
      {children}
    </div>
  );
}

export default ScrollTop;
