import React, { useEffect, useRef } from "react";

import "./Sidebar.scss";
import { isActionAvailable } from "@edifice-ui/react";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import HomeIcon from "@mui/icons-material/Home";
import LaptopIcon from "@mui/icons-material/Laptop";
import SchoolIcon from "@mui/icons-material/School";
import StarIcon from "@mui/icons-material/Star";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";

import { SidebarIcon } from "../sidebar-icon/SidebarIcon";
import { useActions } from "~/services/queries";

interface SidebarProps {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  sidebarOpen,
  toggleSidebar,
}) => {
  const location = useLocation();
  const { t } = useTranslation();
  const navigate = useNavigate(); // uniquement pour routes react, utiliser des <a> pour rediriger vers angular
  const sidebarRef = useRef<HTMLDivElement>(null);

  const { data: actions } = useActions();
  const canAccessSignet = isActionAvailable("signets", actions);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node) &&
        sidebarOpen
      ) {
        toggleSidebar();
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  });

  return (
    <div className={`sidebar ${sidebarOpen ? "open" : ""}`} ref={sidebarRef}>
      <div className="icons-container">
        <a href="/mediacentre">
          <SidebarIcon
            action={() => {}}
            icon={<HomeIcon />}
            name={`${t("mediacentre.sidebar.home")}`}
            selected={location.pathname === "/"}
          />
        </a>
        <a href="/mediacentre?view=angular#/favorite">
          <SidebarIcon
            action={() => {}}
            icon={<StarIcon />}
            name={`${t("mediacentre.sidebar.favorite")}`}
            selected={location.pathname === "/favorites"}
          />
        </a>
        <SidebarIcon
          action={() => navigate("/textbook")}
          icon={<SchoolIcon />}
          name={`${t("mediacentre.sidebar.textbooks")}`}
          selected={location.pathname === "/textbook"}
        />
        <SidebarIcon
          action={() => navigate("/resources")}
          icon={<LaptopIcon />}
          name={`${t("mediacentre.sidebar.resources")}`}
          selected={location.pathname === "/resources"}
        />
        {canAccessSignet && (
          <a href="/mediacentre?view=angular#/signet">
            <SidebarIcon
              action={() => {}}
              icon={<BookmarkIcon />}
              name={`${t("mediacentre.sidebar.signets")}`}
              selected={location.pathname === "/signet"}
            />
          </a>
        )}
      </div>
    </div>
  );
};
