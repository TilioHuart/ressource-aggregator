import React, { useCallback, useEffect, useRef, useState } from "react";

import { Alert, AlertTypes } from "@edifice-ui/react";
import SearchIcon from "@mui/icons-material/Search";
import { useTranslation } from "react-i18next";
import { useLocation, useSearchParams, useNavigate } from "react-router-dom";

import { FilterLayout } from "../../components/filter-layout/FilterLayout";
import { EmptyState } from "~/components/empty-state/empty-state";
import { ListCard } from "~/components/list-card/ListCard";
import { MainLayout } from "~/components/main-layout/MainLayout";
import { SearchCard } from "~/components/search-card/SearchCard";
import { CardTypeEnum } from "~/core/enum/card-type.enum";
import { useSearch } from "~/hooks/useSearch";
import "~/styles/page/search.scss";
import { ExternalResource } from "~/model/ExternalResource.model";
import { Moodle } from "~/model/Moodle.model";
import { SearchResultData } from "~/model/SearchResultData.model";
import { Signet } from "~/model/Signet.model";

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

  const { allResources, disciplines, levels, types, refetchSearch } = useSearch(
    createSearchBody(searchQuery),
  );
  const [allResourcesDisplayed, setAllResourcesDisplayed] =
    useState<SearchResultData>(allResources); // all resources after the filters
  const [visibleResources, setVisibleResources] = useState<SearchResultData>({
    externals_resources: [],
    signets: [],
    moodle: [],
  }); // resources visible (load more with infinite scroll)

  const [loading, setLoading] = useState(false);
  const loaderRef = useRef(null);
  const navigate = useNavigate();

  const flattenResources = (resources: SearchResultData) => [
    ...resources.externals_resources,
    ...resources.signets,
    ...resources.moodle,
  ];

  const redistributeResources = (
    items: (Signet | Moodle | ExternalResource)[],
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
          (resource: ExternalResource) => resource.id === item.id,
        )
      ) {
        newVisibleResources.externals_resources.push(item as ExternalResource);
      } else if (
        allResourcesDisplayed.signets.some(
          (resource: Signet) => resource.id === item.id,
        )
      ) {
        newVisibleResources.signets.push(item as Signet);
      } else if (
        allResourcesDisplayed.moodle.some(
          (resource: Moodle) => resource.id === item.id,
        )
      ) {
        newVisibleResources.moodle.push(item as Moodle);
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
              disciplines={disciplines}
              levels={levels}
              setAllResourcesDisplayed={setAllResourcesDisplayed}
              types={types}
              refetchSearch={refetchSearch}
            />
            {visibleResources &&
            (visibleResources.externals_resources.length !== 0 ||
              visibleResources.signets.length !== 0 ||
              visibleResources.moodle.length !== 0) ? (
              <ListCard
                scrollable={false}
                type={CardTypeEnum.search}
                components={[
                  ...visibleResources.externals_resources,
                  ...visibleResources.signets,
                  ...visibleResources.moodle,
                ].map((searchResource: any) => (
                  <SearchCard
                    searchResource={searchResource}
                    link={searchResource.link ?? searchResource.url ?? "/"}
                    setAlertText={setAlertText}
                    refetchSearch={refetchSearch}
                  />
                ))}
                redirectLink={() => navigate("/search")}
              />
            ) : (
              <EmptyState title="mediacentre.search.empty" />
            )}
            <div ref={loaderRef} />
            {loading && <p>{t("mediacentre.load.more.items")}</p>}
          </div>
        </div>
      </div>
    </>
  );
};
