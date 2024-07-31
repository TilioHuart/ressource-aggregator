import React, { useEffect, useState } from "react";

import { Alert } from "@edifice-ui/react";
import SearchIcon from "@mui/icons-material/Search";
import { useTranslation } from "react-i18next";
import { useLocation, useSearchParams } from "react-router-dom";

import { FilterLayout } from "../../components/filter-layout/FilterLayout";
import { EmptyState } from "~/components/empty-state/empty-state";
import { InfiniteScrollList } from "~/components/infinite-scroll-list/InfiniteScrollList";
import { MainLayout } from "~/components/main-layout/MainLayout";
import { CreatePins } from "~/components/modals/create-pins/CreatePins";
import { ModalEnum } from "~/core/enum/modal.enum";
import { useResourceListInfo } from "~/hooks/useResourceListInfo";
import { useSearch } from "~/hooks/useSearch";
import "~/styles/page/search.scss";
import { Resource } from "~/model/Resource.model";
import { useAlertProvider } from "~/providers/AlertProvider";
import { useModalProvider } from "~/providers/ModalsProvider";
import { usePinProvider } from "~/providers/PinProvider";
import { useSelectedStructureProvider } from "~/providers/SelectedStructureProvider";
import { sortByAlphabet } from "~/utils/sortResources.util";

export const Search: React.FC = () => {
  const { t } = useTranslation();
  const { idSelectedStructure } = useSelectedStructureProvider();
  const { refetchPins } = usePinProvider();
  const { alertType, alertText, setAlertText } = useAlertProvider();
  const { openModal } = useModalProvider();

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
    idSelectedStructure,
  );
  const [allResourcesDisplayed, setAllResourcesDisplayed] = useState<
    Resource[] | null
  >(null); // all resources after the filters
  const [searchResourcesData, setSearchResourcesData] = useState<
    Resource[] | null
  >(null);
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  const { resourcesMap } = useResourceListInfo(allResources);

  useEffect(() => {
    if (!allResources) return;
    if (!initialLoadDone) {
      refetchSearch();
      setInitialLoadDone(true);
    }
    const sortedSearchResources = [
      ...sortByAlphabet(resourcesMap.textbooks),
      ...sortByAlphabet(resourcesMap.externalResources),
      ...sortByAlphabet(resourcesMap.signets),
      ...sortByAlphabet(resourcesMap.moodle),
    ];
    setSearchResourcesData(sortedSearchResources);
    setAllResourcesDisplayed(sortedSearchResources);
  }, [allResources, refetchSearch, initialLoadDone, resourcesMap]);

  return (
    <>
      <MainLayout />
      {alertText !== "" && (
        <Alert
          autoClose
          autoCloseDelay={3000}
          isDismissible={false}
          isToast
          onClose={() => setAlertText("")}
          position="top-right"
          type={alertType}
          className="med-alert"
        >
          {alertText}
        </Alert>
      )}
      {openModal === ModalEnum.CREATE_PIN && (
        <CreatePins refetch={refetchPins} />
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
            {searchResourcesData && !searchResourcesData.length ? (
              <EmptyState
                imgSource="empty-state-search.png"
                title="mediacentre.empty.state.search"
              />
            ) : (
              <>
                <FilterLayout
                  resources={searchResourcesData}
                  allResourcesDisplayed={allResourcesDisplayed}
                  setAllResourcesDisplayed={setAllResourcesDisplayed}
                />
                {allResourcesDisplayed && !allResourcesDisplayed.length ? (
                  <EmptyState title="mediacentre.empty.state.filter" />
                ) : (
                  <InfiniteScrollList
                    redirectLink="/search"
                    allResourcesDisplayed={allResourcesDisplayed}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
