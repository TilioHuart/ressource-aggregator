import React from "react";

import SearchIcon from "@mui/icons-material/Search";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";

import { ListCard } from "~/components/list-card/ListCard";
import { MainLayout } from "~/components/main-layout/MainLayout";
import { SearchCard } from "~/components/search-card/SearchCard";
import { CardTypeEnum } from "~/core/enum/card-type.enum";
import { useSearch } from "~/hooks/useSearch";
import "~/styles/page/search.scss";
import { SearchResource } from "~/model/SearchResource.model";
export interface SearchProps {
  searchBody: object;
}

export const Search: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const searchBody = location.state?.searchBody;

  const { allResources } = useSearch(searchBody);

  const getTitleSearch = () => {
    const { title, query } = searchBody.data;
    return title?.value ? `"${title.value}"` : query ? `"${query}"` : "";
  };

  return (
    <>
      <MainLayout />
      <div className="med-container">
        <div className="med-search-page-header">
          <div className="med-search-page-title">
            <SearchIcon className="med-search-icon" />
            {t("mediacentre.search.title") + getTitleSearch()}
          </div>
        </div>
        <div className="med-search-page-content">
          <div className="med-search-page-content-body">
            <ListCard
              scrollable={false}
              type={CardTypeEnum.search}
              components={allResources.map((searchResource: SearchResource) => (
                <SearchCard searchResource={searchResource} />
              ))}
            />
          </div>
        </div>
      </div>
    </>
  );
};
