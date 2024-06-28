import React, { useCallback, useEffect, useRef, useState } from "react";

import { Alert, AlertTypes, LoadingScreen, useUser } from "@edifice-ui/react";
import LaptopIcon from "@mui/icons-material/Laptop";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { EmptyState } from "~/components/empty-state/empty-state";
import { FilterResourceLayout } from "~/components/filter-resource-layout/FilterResourceLayout";
import { ListCard } from "~/components/list-card/ListCard";
import { MainLayout } from "~/components/main-layout/MainLayout";
import { SearchCard } from "~/components/search-card/SearchCard";
import { CardTypeEnum } from "~/core/enum/card-type.enum";
import "~/styles/page/search.scss";
import { useExternalResource } from "~/hooks/useExternalResource";
import { useGlobal } from "~/hooks/useGlobal";
import { ExternalResource } from "~/model/ExternalResource.model";
import { GlobalResource } from "~/model/GlobalResource";
import { Moodle } from "~/model/Moodle.model";
import { SearchResultData } from "~/model/SearchResultData.model";
import { Signet } from "~/model/Signet.model";

export const ResourcePage: React.FC = () => {
  const { user } = useUser();
  const { t } = useTranslation();
  const [alertText, setAlertText] = useState<string>("");
  const [alertType, setAlertType] = useState<AlertTypes>("success");
  const {
    globals,
    disciplines: disciplinesGlobal,
    levels: levelsGlobal,
    types: typesGlobal,
  } = useGlobal();
  const {
    externalResources,
    disciplines: disciplinesExternal,
    levels: levelsExternal,
    types: typesExternal,
    refetchSearch,
  } = useExternalResource();
  const [disciplines, setDisciplines] = useState<string[]>([]);
  const [levels, setLevels] = useState<string[]>([]);
  const [types, setTypes] = useState<string[]>([]);
  const [externalResourcesData, setExternalResourcesData] = useState<
    ExternalResource[] | GlobalResource[] | null
  >(null);
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  const [allResourcesDisplayed, setAllResourcesDisplayed] =
    useState<SearchResultData | null>(null); // all resources after the filters
  const [visibleResources, setVisibleResources] =
    useState<SearchResultData | null>(null); // resources visible (load more with infinite scroll)

  const [isLoading, setIsLoading] = useState(true);
  const [limit, setLimit] = useState(0);
  const loaderRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!initialLoadDone) {
      refetchSearch();
      setInitialLoadDone(true);
    }
    if (user?.type.length === 1 && user.type.includes("Relative")) {
      if (globals) {
        setDisciplines(disciplinesGlobal);
        setLevels(levelsGlobal);
        setTypes(typesGlobal);
        setExternalResourcesData(globals);
      }
    } else {
      setDisciplines(disciplinesExternal);
      setLevels(levelsExternal);
      setTypes(typesExternal);
      setExternalResourcesData(externalResources);
    }
  }, [
    user,
    externalResources,
    globals,
    disciplinesExternal,
    disciplinesGlobal,
    levelsGlobal,
    levelsExternal,
    typesExternal,
    typesGlobal,
    initialLoadDone,
    refetchSearch,
  ]);

  const flattenResources = (resources: SearchResultData) => [
    ...resources.external_resources,
  ];

  const redistributeResources = (
    items: (Signet | Moodle | ExternalResource)[],
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
          (resource: ExternalResource) => resource.id === item.id,
        )
      ) {
        newVisibleResources.external_resources.push(item as ExternalResource);
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

  useEffect(() => {
    if (externalResourcesData) {
      setAllResourcesDisplayed({
        signets: [],
        moodle: [],
        external_resources: externalResourcesData,
      });
    }
  }, [externalResourcesData]);

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
              <LaptopIcon className="med-search-icon" />
              <h1 className="med-search-title">
                {t("mediacentre.sidebar.resources")}
              </h1>
            </div>
          </div>
          <div className="med-search-page-content-body">
            <FilterResourceLayout
              resources={externalResourcesData}
              disciplines={disciplines}
              levels={levels}
              setAllResourcesDisplayed={setAllResourcesDisplayed}
              types={types}
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
                          refetchSearch={refetchSearch}
                        />
                      ),
                    )}
                    redirectLink={() => navigate("/resource")}
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
