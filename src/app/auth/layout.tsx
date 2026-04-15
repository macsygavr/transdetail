"use client";

import ContentContainer from "@/components/ContentContainer/ContentContainer";
import { throttle } from "lodash";
import { useEffect, useState } from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [isMobileWidth, setIsMobileWidth] = useState(true);

  useEffect(() => {
    const handleResize = throttle(() => {
      if (window.innerWidth >= 1240 && isMobileWidth) {
        setIsMobileWidth(false);
      }

      if (window.innerWidth < 1240 && !isMobileWidth) {
        setIsMobileWidth(true);
      }
    });

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      handleResize.cancel();
      window.removeEventListener("resize", handleResize);
    };
  }, [isMobileWidth]);

  return <ContentContainer>{children}</ContentContainer>;
}
