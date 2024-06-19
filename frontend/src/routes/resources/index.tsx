import React, { useCallback, useEffect, useRef, useState } from "react";

import { Alert, AlertTypes, useUser } from "@edifice-ui/react";
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
  const [externalsResourcesData, setExternalResourcesData] = useState<
    ExternalResource[] | GlobalResource[]
  >(externalResources ?? []);
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  const [allResourcesDisplayed, setAllResourcesDisplayed] =
    useState<SearchResultData>({
      signets: [],
      moodle: [],
      externals_resources: externalsResourcesData,
    }); // all resources after the filters
  const [visibleResources, setVisibleResources] = useState<SearchResultData>({
    externals_resources: [],
    signets: [],
    moodle: [],
  }); // resources visible (load more with infinite scroll)

  const [loading, setLoading] = useState(false);
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
    ...resources.externals_resources,
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
      }
    });

    return newVisibleResources;
  };

  const loadMoreResources = useCallback(() => {
    setLoading(true);
    const limit = 10; // items to load per scroll
    setVisibleResources((prevVisibleResources) => {
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
    setVisibleResources({
      externals_resources: [],
      signets: [],
      moodle: [],
    });
    loadMoreResources();
  }, [allResourcesDisplayed, loadMoreResources]);

  useEffect(() => {
    setAllResourcesDisplayed({
      signets: [],
      moodle: [],
      externals_resources: externalsResourcesData,
    });
  }, [externalsResourcesData]);

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
              <LaptopIcon className="med-search-icon" />
              <h1 className="med-search-title">
                {t("mediacentre.sidebar.resources")}
              </h1>
            </div>
          </div>
          <div className="med-search-page-content-body">
            <FilterResourceLayout
              resources={externalsResourcesData}
              disciplines={disciplines}
              levels={levels}
              setAllResourcesDisplayed={setAllResourcesDisplayed}
              types={types}
            />
            {visibleResources &&
            visibleResources.externals_resources.length !== 0 ? (
              <ListCard
                scrollable={false}
                type={CardTypeEnum.search}
                components={[...visibleResources.externals_resources].map(
                  (searchResource: any) => (
                    <SearchCard
                      searchResource={searchResource}
                      link={searchResource.link ?? searchResource.url ?? "/"}
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
            <div ref={loaderRef} />
            {loading && <p>{t("mediacentre.load.more.items")}</p>}
          </div>
        </div>
      </div>
    </>
  );
};
