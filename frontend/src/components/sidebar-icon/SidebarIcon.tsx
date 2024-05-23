import React from "react";
import "./SidebarIcon.scss";

interface SidebarIconProps {
  icon: React.ReactNode;
  name: string;
  action: () => void;
  selected?: boolean;
}

export const SidebarIcon: React.FC<SidebarIconProps> = ({
  icon,
  name,
  action,
  selected = false,
}) => {
  return (
    <>
      <div
        role="button"
        className={`sidebar-icon ${selected ? "selected" : ""}`}
        onClick={action}
        onKeyDown={action}
        tabIndex={0}
      >
        <div className="sidebar-icon-img">{icon}</div>
        <span className="sidebar-icon-text">{name}</span>
      </div>
    </>
  );
};
