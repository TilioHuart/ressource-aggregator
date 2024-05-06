import React from "react";

import { Breadcrumb, SearchBar, Button } from "@edifice-ui/react";
import { redirect } from "react-router-dom";
import "./Header.scss";

export const Header: React.FC = () => {
  const [searchValue, setSearchValue] = React.useState("");

  const search = () => {
    console.log(searchValue);
    return redirect("/search");
    // redirect to search page
  };

  return (
    <div className="med-header">
      <div className="med-header-container">
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
        <Button
          color="secondary"
          type="button"
          variant="outline"
          className="med-header-button"
        >
          Recherche avancée
        </Button>
      </div>
    </div>
  );
};
