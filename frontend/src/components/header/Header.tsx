import React from "react";

import { Breadcrumb } from "@edifice-ui/react";
import "./Header.scss";

export const Header: React.FC = () => {
  return (
    <div className="med-header">
      <Breadcrumb
        app={{
          address: "/mediacentre",
          display: false,
          displayName: "Médiacentre",
          icon: "mediacentre",
          isExternal: false,
          name: "",
          scope: [],
        }}
      />
    </div>
  );
};
