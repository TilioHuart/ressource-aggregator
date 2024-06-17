import React, { useCallback, useEffect, useRef, useState } from "react";

import { Alert, AlertTypes } from "@edifice-ui/react";
import SchoolIcon from "@mui/icons-material/School";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { FilterTextbookLayout } from "~/components/filter-textbook-layout/FilterTextbookLayout";
import { ListCard } from "~/components/list-card/ListCard";
import { MainLayout } from "~/components/main-layout/MainLayout";
import { SearchCard } from "~/components/search-card/SearchCard";
import { CardTypeEnum } from "~/core/enum/card-type.enum";
import "~/styles/page/search.scss";
import { useFavorite } from "~/hooks/useFavorite";
import { useTextbook } from "~/hooks/useTextbook";
import { Favorite } from "~/model/Favorite.model";
import { SearchResultData } from "~/model/SearchResultData.model";
import { Textbook } from "~/model/Textbook.model";

export const TextbookPage: React.FC = () => {
  const { t } = useTranslation();
  const [alertText, setAlertText] = useState<string>("");
  const [alertType, setAlertType] = useState<AlertTypes>("success");
  const { textbooks, disciplines, levels, refetchTextbooks } = useTextbook();
  const [textbooksData, setTextbooksData] = useState<Textbook[]>([]);
  const { favorites, refetchFavorite } = useFavorite();
  const [allResourcesDisplayed, setAllResourcesDisplayed] =
    useState<SearchResultData>({
      signets: [],
      moodle: [],
      externals_resources: textbooks,
    }); // all resources after the filters
  const [visibleResources, setVisibleResources] = useState<SearchResultData>({
    externals_resources: [],
    signets: [],
    moodle: [],
  }); // resources visible (load more with infinite scroll)
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  const [loading, setLoading] = useState(false);
  const loaderRef = useRef(null);
  const navigate = useNavigate();

  const flattenResources = (resources: SearchResultData) => [
    ...resources.externals_resources,
  ];

  const redistributeResources = (
    items: Textbook[],
    allResourcesDisplayed: SearchResultData,
  ): SearchResultData => {
    const newVisibleResources: SearchResultData = {
      externals_resources: [],
      signets: [],
      moodle: [],
    };

    items.forEach((item) => {
      if (
        allResourcesDisplayed.externals_resources.some(
          (resource: Textbook) => resource.id === item.id,
        )
      ) {
        newVisibleResources.externals_resources.push(item as Textbook);
      }
    });

    return newVisibleResources;
  };

  const loadMoreResources = useCallback(() => {
    setLoading(true);
    const limit = 10; // items to load per scroll
    setVisibleResources((prevVisibleResources) => {
      if (
        flattenResources(allResourcesDisplayed).slice(
          0,
          flattenResources(allResourcesDisplayed).length,
        ) !== flattenResources(prevVisibleResources)
      ) {
        prevVisibleResources = allResourcesDisplayed;
      }
      const allItems = flattenResources(prevVisibleResources);
      const newItems = [
        ...allItems,
        ...flattenResources(allResourcesDisplayed).slice(
          allItems.length,
          allItems.length + limit,
        ),
      ];
      return redistributeResources(newItems, allResourcesDisplayed);
    });
    setLoading(false);
  }, [allResourcesDisplayed]); // for infinite scroll

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const target = entries[0];
      if (target.isIntersecting) {
        loadMoreResources();
      }
    },
    [loadMoreResources],
  ); // for infinite scroll

  const fetchFavoriteTextbook: () => Textbook[] = useCallback(() => {
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
    const updated: Textbook[] = fetchFavoriteTextbook();
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
      <div className="med-container">
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
            {visibleResources && (
              <ListCard
                scrollable={false}
                type={CardTypeEnum.search}
                components={[...visibleResources.externals_resources].map(
                  (searchResource: any) => (
                    <SearchCard
                      searchResource={searchResource}
                      link={searchResource.link ?? searchResource.url ?? "/"}
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
            )}
            <div ref={loaderRef} />
            {loading && <p>{t("mediacentre.load.more.items")}</p>}
          </div>
        </div>
      </div>
    </>
  );
};
