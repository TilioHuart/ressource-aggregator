import React, { useCallback, useEffect, useRef, useState } from "react";

import { Alert, AlertTypes, LoadingScreen } from "@edifice-ui/react";
import SchoolIcon from "@mui/icons-material/School";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { EmptyState } from "~/components/empty-state/empty-state";
import { FilterTextbookLayout } from "~/components/filter-textbook-layout/FilterTextbookLayout";
import { ListCard } from "~/components/list-card/ListCard";
import { MainLayout } from "~/components/main-layout/MainLayout";
import { SearchCard } from "~/components/search-card/SearchCard";
import { CardTypeEnum } from "~/core/enum/card-type.enum";
import "~/styles/page/search.scss";
import { useFavorite } from "~/hooks/useFavorite";
import { useTextbook } from "~/hooks/useTextbook";
import { ExternalResource } from "~/model/ExternalResource.model";
import { Favorite } from "~/model/Favorite.model";
import { SearchResultData } from "~/model/SearchResultData.model";
import { Textbook } from "~/model/Textbook.model";

export const TextbookPage: React.FC = () => {
  const { t } = useTranslation();
  const [alertText, setAlertText] = useState<string>("");
  const [alertType, setAlertType] = useState<AlertTypes>("success");
  const { textbooks, disciplines, levels, refetchTextbooks } = useTextbook();
  const [textbooksData, setTextbooksData] = useState<Textbook[] | null>(null);
  const { favorites, refetchFavorite } = useFavorite();
  const [allResourcesDisplayed, setAllResourcesDisplayed] =
    useState<SearchResultData | null>(null); // all resources after the filters
  const [visibleResources, setVisibleResources] =
    useState<SearchResultData | null>(null); // resources visible (load more with infinite scroll)
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [limit, setLimit] = useState(0);
  const loaderRef = useRef(null);
  const navigate = useNavigate();

  const flattenResources = (resources: SearchResultData) => [
    ...resources.external_resources,
  ];

  const redistributeResources = (
    items: Textbook[] | ExternalResource[],
    allResourcesDisplayed: SearchResultData,
  ): SearchResultData => {
    const newVisibleResources: SearchResultData = {
      external_resources: [],
      signets: [],
      moodle: [],
    };

    items.forEach((item) => {
      if (
        allResourcesDisplayed.external_resources.some(
          (resource: Textbook | ExternalResource) => resource.id === item.id,
        )
      ) {
        newVisibleResources.external_resources.push(item as Textbook);
      }
    });

    return newVisibleResources;
  };

  const loadMoreResources = useCallback(() => {
    if (!allResourcesDisplayed) {
      return;
    }
    setVisibleResources((prevVisibleResources) => {
      if (!prevVisibleResources) {
        prevVisibleResources = {
          external_resources: [],
          signets: [],
          moodle: [],
        };
      }
      setLimit((prevLimit) => prevLimit + 10); // add 10 items each scroll
      const prevItems = flattenResources(prevVisibleResources);
      const allItems = flattenResources(allResourcesDisplayed);

      if (
        JSON.stringify(prevItems) !==
        JSON.stringify(allItems.slice(0, prevItems.length))
      ) {
        // If the displayed resources have changed
        prevVisibleResources = allResourcesDisplayed;
      }

      const newItems = [
        ...prevItems,
        ...allItems.slice(prevItems.length, prevItems.length + limit),
      ];

      return redistributeResources(newItems, allResourcesDisplayed);
    });
    setIsLoading(false);
  }, [allResourcesDisplayed, limit]); // for infinite scroll

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const target = entries[0];
      if (target.isIntersecting) {
        loadMoreResources();
      }
    },
    [loadMoreResources],
  ); // for infinite scroll

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
    setTextbooksData(updated);
  }, [
    textbooks,
    fetchFavoriteTextbook,
    refetchFavorite,
    refetchTextbooks,
    initialLoadDone,
  ]);

  useEffect(() => {
    const option = {
      root: null,
      rootMargin: "20px",
      threshold: 1.0,
    };
    const loader = loaderRef.current;
    const observer = new IntersectionObserver(handleObserver, option);
    if (loader) observer.observe(loader);
    return () => {
      if (loader) observer.unobserve(loader);
    };
  }, [handleObserver]); // for infinite scroll

  useEffect(() => {
    setIsLoading(true);
    loadMoreResources();
  }, [allResourcesDisplayed, loadMoreResources]);

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
              <SchoolIcon className="med-search-icon" />
              <h1 className="med-search-title">
                {t("mediacentre.list.card.manuals")}
              </h1>
            </div>
          </div>
          <div className="med-search-page-content-body">
            <FilterTextbookLayout
              resources={textbooksData}
              disciplines={disciplines}
              levels={levels}
              setAllResourcesDisplayed={setAllResourcesDisplayed}
            />
            {isLoading ? (
              <LoadingScreen position={false} />
            ) : (
              <>
                {visibleResources &&
                visibleResources.external_resources.length !== 0 ? (
                  <ListCard
                    scrollable={false}
                    type={CardTypeEnum.search}
                    components={[...visibleResources.external_resources].map(
                      (searchResource: any) => (
                        <SearchCard
                          searchResource={searchResource}
                          link={
                            searchResource.link ?? searchResource.url ?? "/"
                          }
                          setAlertText={setAlertText}
                          refetchSearch={() => {
                            refetchFavorite();
                            refetchTextbooks();
                          }}
                        />
                      ),
                    )}
                    redirectLink={() => navigate("/textbook")}
                  />
                ) : (
                  <EmptyState title="mediacentre.ressources.empty" />
                )}
              </>
            )}
            <div ref={loaderRef} />
          </div>
        </div>
      </div>
    </>
  );
};
