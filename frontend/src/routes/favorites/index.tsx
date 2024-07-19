import React, { useEffect, useState } from "react";

import { Alert } from "@edifice-ui/react";
import StarIcon from "@mui/icons-material/Star";
import { useTranslation } from "react-i18next";

import { FilterLayout } from "../../components/filter-layout/FilterLayout";
import { InfiniteScrollList } from "~/components/infinite-scroll-list/InfiniteScrollList";
import { MainLayout } from "~/components/main-layout/MainLayout";
import "~/styles/page/search.scss";
import { CreatePins } from "~/components/modals/create-pins/CreatePins";
import { useFavorite } from "~/hooks/useFavorite";
import { Resource } from "~/model/Resource.model";
import { useAlertProvider } from "~/providers/AlertProvider";
import { usePinProvider } from "~/providers/PinProvider";
import { sortByAlphabet } from "~/utils/sortResources.util";

export const FavoritePage: React.FC = () => {
  const { t } = useTranslation();
  const { refetchPins } = usePinProvider();
  const { alertType, alertText, setAlertText } = useAlertProvider();

  const { favorites, refetchFavorite } = useFavorite();
  const [allResourcesDisplayed, setAllResourcesDisplayed] = useState<
    Resource[] | null
  >(null); // all resources after the filters
  const [favoriteResourcesData, setFavoriteResourcesData] = useState<
    Resource[] | null
  >(null);
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  useEffect(() => {
    if (!favorites) return;
    if (!initialLoadDone) {
      refetchFavorite();
      setInitialLoadDone(true);
    }
    setFavoriteResourcesData(favorites);
  }, [favorites, refetchFavorite, initialLoadDone]);

  useEffect(() => {
    if (favoriteResourcesData) {
      setAllResourcesDisplayed(sortByAlphabet(favoriteResourcesData));
    }
  }, [favoriteResourcesData]);

  return (
    <>
      <MainLayout />
      {alertText !== "" && (
        <Alert
          autoClose
          autoCloseDelay={3000}
          isDismissible
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
              <StarIcon className="med-search-icon" />
              <h1 className="med-search-title">
                {t("mediacentre.list.card.favorites")}
              </h1>
            </div>
          </div>
          <div className="med-search-page-content-body">
            <FilterLayout
              resources={favoriteResourcesData}
              setAllResourcesDisplayed={setAllResourcesDisplayed}
            />
            <InfiniteScrollList
              redirectLink="/favorites"
              allResourcesDisplayed={allResourcesDisplayed}
            />
          </div>
        </div>
      </div>
    </>
  );
};