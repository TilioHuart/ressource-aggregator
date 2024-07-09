import React, { useEffect, useState } from "react";

import { Alert, AlertTypes, useUser } from "@edifice-ui/react";
import LaptopIcon from "@mui/icons-material/Laptop";
import { useTranslation } from "react-i18next";

import { FilterLayout } from "~/components/filter-layout/FilterLayout";
import { InfiniteScrollList } from "~/components/infinite-scroll-list/InfiniteScrollList";
import { MainLayout } from "~/components/main-layout/MainLayout";
import "~/styles/page/search.scss";
import { useExternalResource } from "~/hooks/useExternalResource";
import { useGlobal } from "~/hooks/useGlobal";
import { Resource } from "~/model/Resource.model";

export const ResourcePage: React.FC = () => {
  const { user } = useUser();
  const { t } = useTranslation();
  const [alertText, setAlertText] = useState<string>("");
  const [alertType, setAlertType] = useState<AlertTypes>("success");
  const { globals } = useGlobal();
  const { externalResources, refetchSearch } = useExternalResource();

  const [externalResourcesData, setExternalResourcesData] = useState<
    Resource[] | null
  >(null);
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  const [allResourcesDisplayed, setAllResourcesDisplayed] = useState<
    Resource[] | null
  >(null); // all resources after the filters

  useEffect(() => {
    if (!initialLoadDone) {
      refetchSearch();
      setInitialLoadDone(true);
    }
    if (user?.type.length === 1 && user.type.includes("Relative")) {
      if (globals) {
        setExternalResourcesData(globals);
      }
    } else {
      setExternalResourcesData(externalResources);
    }
  }, [user, externalResources, globals, initialLoadDone, refetchSearch]);

  useEffect(() => {
    if (externalResourcesData) {
      setAllResourcesDisplayed(externalResourcesData);
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
            <FilterLayout
              resources={externalResourcesData}
              setAllResourcesDisplayed={setAllResourcesDisplayed}
            />
            <InfiniteScrollList
              redirectLink="/resources"
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
