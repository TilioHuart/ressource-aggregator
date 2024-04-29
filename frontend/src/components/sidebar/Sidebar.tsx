import React, { useState, useEffect } from "react";
import "./Sidebar.scss";

interface SidebarProps {}

export const Sidebar: React.FC<SidebarProps> = () => {
  const [scrollPosition, setScrollPosition] = useState(0);
  const headerHeight = document.querySelector("header")?.offsetHeight ?? 67;
  console.log(headerHeight);
  const handleScroll = () => {
    const position = window.pageYOffset;
    setScrollPosition(position);
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div
      className="sidebar"
      style={{
        top: `calc(${headerHeight}px - ${
          scrollPosition >= headerHeight ? headerHeight : scrollPosition
        }px`,
      }}
    ></div>
  );
};
