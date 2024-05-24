import React from "react";

import { Breadcrumb, SearchBar, Button } from "@edifice-ui/react";
import MenuIcon from "@mui/icons-material/Menu";
import { redirect } from "react-router-dom";

import "./Header.scss";
import { AdvancedSearch } from "../advanced-search/AdvancedSearch";

interface HeaderProps {
  toggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  const [searchValue, setSearchValue] = React.useState("");
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const search = () => {
    console.log(searchValue);
    return redirect("/search");
    // redirect to search page
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
      {isModalOpen && (
        <AdvancedSearch
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
        />
      )}
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
        <Button
          color="secondary"
          type="button"
          variant="outline"
          className="med-header-button"
          onClick={() => setIsModalOpen(true)}
        >
          Recherche avancée
        </Button>
      </div>
    </div>
  );
};
