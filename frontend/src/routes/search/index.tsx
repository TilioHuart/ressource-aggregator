import React, { useEffect, useState } from "react";

import { Alert, AlertTypes } from "@edifice-ui/react";
import SearchIcon from "@mui/icons-material/Search";
import { useTranslation } from "react-i18next";
import { useLocation, useSearchParams } from "react-router-dom";

import { FilterLayout } from "../../components/filter-layout/FilterLayout";
import { InfiniteScrollList } from "~/components/infinite-scroll-list/InfiniteScrollList";
import { MainLayout } from "~/components/main-layout/MainLayout";
import { useSearch } from "~/hooks/useSearch";
import "~/styles/page/search.scss";
import { Resource } from "~/model/Resource.model";

export const Search: React.FC = () => {
  const { t } = useTranslation();
  const [alertText, setAlertText] = useState<string>("");
  const [alertType, setAlertType] = useState<AlertTypes>("success");
  const location = useLocation();
  const searchBody = location.state?.searchBody;
  const [searchParams] = useSearchParams();
  const searchQuery =
    searchParams.get("query") ?? searchBody?.data?.query ?? ".*"; // .* for all resources

  const createSearchBody = (searchValue: string) => {
    return {
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
  };

  const { allResources, refetchSearch } = useSearch(
    createSearchBody(searchQuery),
  );
  const [allResourcesDisplayed, setAllResourcesDisplayed] = useState<
    Resource[] | null
  >(null); // all resources after the filters
  const [searchResourcesData, setSearchResourcesData] = useState<
    Resource[] | null
  >(null);
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  useEffect(() => {
    if (!allResources) return;
    if (!initialLoadDone) {
      refetchSearch();
      setInitialLoadDone(true);
    }
    setSearchResourcesData(allResources);
  }, [allResources, refetchSearch, initialLoadDone]);

  useEffect(() => {
    if (searchResourcesData) {
      setAllResourcesDisplayed(searchResourcesData);
    }
  }, [searchResourcesData]);

  return (
    <>
      <MainLayout />
      {alertText !== "" && (
        <Alert
          autoClose
          autoCloseDelay={3000}
          isDismissible
          isToast
          onClose={() => {
            setAlertText("");
            setAlertType("success");
          }}
          position="top-right"
          type={alertType}
          className="med-alert"
        >
          {alertText}
        </Alert>
      )}
      <div className="med-search-container">
        <div className="med-search-page-content">
          <div className="med-search-page-header">
            <div className="med-search-page-title">
              <SearchIcon className="med-search-icon" />
              <h1 className="med-search-title">
                {t("mediacentre.search.title")}
                {searchQuery == ".*" ? "" : searchQuery}
              </h1>
            </div>
          </div>
          <div className="med-search-page-content-body">
            <FilterLayout
              resources={allResources}
              setAllResourcesDisplayed={setAllResourcesDisplayed}
            />
            <InfiniteScrollList
              redirectLink="/search"
              allResourcesDisplayed={allResourcesDisplayed}
              setAlertText={setAlertText}
              refetchData={refetchSearch}
            />
          </div>
        </div>
      </div>
    </>
  );
};
