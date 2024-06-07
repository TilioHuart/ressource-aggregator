import React, { useCallback, useEffect, useRef, useState } from "react";

import { Alert, AlertTypes } from "@edifice-ui/react";
import SearchIcon from "@mui/icons-material/Search";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";

import { FilterLayout } from "../../components/filter-layout/FilterLayout";
import { ListCard } from "~/components/list-card/ListCard";
import { MainLayout } from "~/components/main-layout/MainLayout";
import { SearchCard } from "~/components/search-card/SearchCard";
import { CardTypeEnum } from "~/core/enum/card-type.enum";
import { useSearch } from "~/hooks/useSearch";
import "~/styles/page/search.scss";
import { Moodle } from "~/model/Moodle.model";
import { SearchResultData } from "~/model/SearchResultData.model";
import { Signet } from "~/model/Signet.model";
import { Textbook } from "~/model/Textbook.model";

export const Search: React.FC = () => {
  const { t } = useTranslation();
  const [alertText, setAlertText] = useState<string>("");
  const [alertType, setAlertType] = useState<AlertTypes>("success");
  const location = useLocation();
  const searchBody = location.state?.searchBody;

  const { allResources, disciplines, levels, types } = useSearch(searchBody); // all resources
  const [allResourcesDisplayed, setAllResourcesDisplayed] =
    useState<SearchResultData>(allResources); // all resources after the filters
  const [visibleResources, setVisibleResources] = useState<SearchResultData>({
    textbooks: [],
    externals_resources: [],
    signets: [],
    moodle: [],
  }); // resources visible (load more with infinite scroll)

  const [loading, setLoading] = useState(false);
  const loaderRef = useRef(null);
  const navigate = useNavigate();

  const flattenResources = (resources: SearchResultData) => [
    ...resources.textbooks,
    ...resources.externals_resources,
    ...resources.signets,
    ...resources.moodle,
  ];

  const redistributeResources = (
    items: (Signet | Moodle | Textbook)[],
    allResourcesDisplayed: SearchResultData,
  ): SearchResultData => {
    const newVisibleResources: SearchResultData = {
      textbooks: [],
      externals_resources: [],
      signets: [],
      moodle: [],
    };

    items.forEach((item) => {
      if (allResourcesDisplayed.textbooks.includes(item as Textbook)) {
        newVisibleResources.textbooks.push(item as Textbook);
      } else if (
        allResourcesDisplayed.externals_resources.includes(item as Textbook)
      ) {
        newVisibleResources.externals_resources.push(item as Textbook);
      } else if (allResourcesDisplayed.signets.includes(item as Signet)) {
        newVisibleResources.signets.push(item as Signet);
      } else if (allResourcesDisplayed.moodle.includes(item as Moodle)) {
        newVisibleResources.moodle.push(item as Moodle);
      }
    });

    return newVisibleResources;
  };

  const loadMoreResources = useCallback(() => {
    setLoading(true);
    const limit = 10; // items to load per scroll
    setVisibleResources((prevVisibleResources) => {
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

  const getTitleSearch = () => {
    const { title, query } = searchBody.data;
    return title?.value ? `"${title.value}"` : query ? `"${query}"` : "";
  };

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
        <div className="med-search-page-header">
          <div className="med-search-page-title">
            <SearchIcon className="med-search-icon" />
            {t("mediacentre.search.title") + getTitleSearch()}
          </div>
        </div>
        <div className="med-search-page-content">
          <div className="med-search-page-content-body">
            <FilterLayout
              resources={allResources}
              disciplines={disciplines}
              levels={levels}
              setAllResourcesDisplayed={setAllResourcesDisplayed}
              types={types}
            />
            {visibleResources && (
              <ListCard
                scrollable={false}
                type={CardTypeEnum.search}
                components={[
                  ...visibleResources.textbooks,
                  ...visibleResources.externals_resources,
                  ...visibleResources.signets,
                  ...visibleResources.moodle,
                ].map((searchResource: any) => (
                  <SearchCard
                    searchResource={searchResource}
                    setAlertText={setAlertText}
                  />
                ))}
                redirectLink={() => navigate("/search")}
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
