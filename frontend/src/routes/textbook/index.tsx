import React, { useCallback, useEffect, useState } from "react";

import { Alert } from "@edifice-ui/react";
import SchoolIcon from "@mui/icons-material/School";
import { useTranslation } from "react-i18next";

import { EmptyState } from "~/components/empty-state/empty-state";
import { FilterLayout } from "~/components/filter-layout/FilterLayout";
import { InfiniteScrollList } from "~/components/infinite-scroll-list/InfiniteScrollList";
import { MainLayout } from "~/components/main-layout/MainLayout";
import "~/styles/page/search.scss";
import { CreatePins } from "~/components/modals/create-pins/CreatePins";
import { useFavorite } from "~/hooks/useFavorite";
import { useTextbook } from "~/hooks/useTextbook";
import { Favorite } from "~/model/Favorite.model";
import { Resource } from "~/model/Resource.model";
import { Textbook } from "~/model/Textbook.model";
import { useAlertProvider } from "~/providers/AlertProvider";
import { usePinProvider } from "~/providers/PinProvider";
import { sortByAlphabet } from "~/utils/sortResources.util";

export const TextbookPage: React.FC = () => {
  const { t } = useTranslation();
  const { refetchPins } = usePinProvider();
  const { alertType, alertText, setAlertText } = useAlertProvider();
  const { textbooks, refetchTextbooks } = useTextbook();
  const [textbooksData, setTextbooksData] = useState<Resource[] | null>(null);
  const { favorites, refetchFavorite } = useFavorite();
  const [allResourcesDisplayed, setAllResourcesDisplayed] = useState<
    Resource[] | null
  >(null); // all resources after the filters
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  const fetchFavoriteTextbook: () => Textbook[] | null = useCallback(() => {
    if (textbooks && favorites) {
      return textbooks.map((textbook: Textbook) => {
        const favorite = favorites.find(
          (fav: Favorite) => fav.id === textbook.id,
        );
        if (favorite) {
          return { ...textbook, favoriteId: favorite._id };
        }
        return textbook;
      });
    } else {
      return textbooks;
    }
  }, [textbooks, favorites]);

  useEffect(() => {
    if (!initialLoadDone) {
      refetchFavorite();
      refetchTextbooks();
      setInitialLoadDone(true);
    }
    const updated: Textbook[] | null = fetchFavoriteTextbook();
    setTextbooksData(updated ?? []);
  }, [
    textbooks,
    fetchFavoriteTextbook,
    refetchFavorite,
    refetchTextbooks,
    initialLoadDone,
  ]);

  useEffect(() => {
    if (textbooksData) {
      setAllResourcesDisplayed(sortByAlphabet(textbooksData));
    }
  }, [textbooksData]);

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
      <CreatePins refetch={refetchPins} />
      <div className="med-search-container">
        <div className="med-search-page-content">
          <div className="med-search-page-header">
            <div className="med-search-page-title">
              <SchoolIcon className="med-search-icon" />
              <h1 className="med-search-title">
                {t("mediacentre.list.card.manuals")}
              </h1>
            </div>
          </div>
          <div className="med-search-page-content-body">
            {textbooksData && !textbooksData.length ? (
              <EmptyState
                imgSource="empty-state-textbooks.png"
                title="mediacentre.empty.state.textbooks"
              />
            ) : (
              <>
                <FilterLayout
                  resources={textbooksData}
                  allResourcesDisplayed={allResourcesDisplayed}
                  setAllResourcesDisplayed={setAllResourcesDisplayed}
                />
                {allResourcesDisplayed && !allResourcesDisplayed.length ? (
                  <EmptyState title="mediacentre.empty.state.filter" />
                ) : (
                  <InfiniteScrollList
                    redirectLink="/textbook"
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
