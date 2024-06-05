import React from "react";

import { Breadcrumb, SearchBar } from "@edifice-ui/react";
import MenuIcon from "@mui/icons-material/Menu";
import { useNavigate } from "react-router-dom";

import "./Header.scss";

interface HeaderProps {
  toggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  const [searchValue, setSearchValue] = React.useState("");
  const navigate = useNavigate();

  const search = () => {
    const searchBody = {
      state: "PLAIN_TEXT",
      data: {
        query: searchValue,
      },
      event: "search",
      sources: [
        "fr.openent.mediacentre.source.GAR",
        "fr.openent.mediacentre.source.Moodle",
        "fr.openent.mediacentre.source.Signet",
      ],
    };
    navigate("/search", { state: { searchBody } });
  };

  return (
    <div className="med-header">
      <div className="med-header-container">
        <div className="med-burger-icon sidebar-toggle">
          <MenuIcon onClick={toggleSidebar} />
        </div>
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
      <div className="med-header-container">
        <SearchBar
          isVariant={false}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setSearchValue(e.target.value)
          }
          onClick={() => search()}
          placeholder="Rechercher une ressource"
          size="md"
        />
      </div>
    </div>
  );
};
