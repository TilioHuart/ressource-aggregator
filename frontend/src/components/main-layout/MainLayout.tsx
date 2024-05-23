import React from "react";

import { breakpoints } from "../../core/constants/breakpoints";
import { Header } from "../header/Header";
import { Sidebar } from "../sidebar/Sidebar";

interface MainLayoutProps {}

export const MainLayout: React.FC<MainLayoutProps> = () => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(
    window.innerWidth >= breakpoints.md,
  );

  const toggleSidebar = () => {
    if (window.innerWidth < breakpoints.md) {
      setIsSidebarOpen(!isSidebarOpen);
    }
  };

  return (
    <>
      <Sidebar sidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <Header toggleSidebar={toggleSidebar} />
    </>
  );
};
