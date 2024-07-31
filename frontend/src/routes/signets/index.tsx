import { useEffect, useState } from "react";

import { Alert } from "@edifice-ui/react";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import { useTranslation } from "react-i18next";

// import { AdminSignet } from "~/components/admin-signet/AdminSignet";
import { EmptyState } from "~/components/empty-state/empty-state";
import { FilterLayout } from "~/components/filter-layout/FilterLayout";
import { InfiniteScrollList } from "~/components/infinite-scroll-list/InfiniteScrollList";
import { MainLayout } from "~/components/main-layout/MainLayout";
import { CreatePins } from "~/components/modals/create-pins/CreatePins";
import { useSignet } from "~/hooks/useSignet";
import { Resource } from "~/model/Resource.model";
import { useAlertProvider } from "~/providers/AlertProvider";
import { usePinProvider } from "~/providers/PinProvider";
import { sortByAlphabet } from "~/utils/sortResources.util";
// import "~/styles/page/signet.scss";
import "~/styles/page/search.scss";

export const SignetPage: React.FC = () => {
  const { t } = useTranslation();
  const { refetchPins } = usePinProvider();
  const { alertType, alertText, setAlertText } = useAlertProvider();

  const { homeSignets } = useSignet();
  const [allResourcesDisplayed, setAllResourcesDisplayed] = useState<
    Resource[] | null
  >(null); // all resources after the filters
  const [signetResourcesData, setSignetResourcesData] = useState<
    Resource[] | null
  >(null);
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  useEffect(() => {
    if (!homeSignets) return;
    if (!initialLoadDone) {
      setInitialLoadDone(true);
    }
    setSignetResourcesData(homeSignets);
  }, [homeSignets, initialLoadDone]);

  useEffect(() => {
    if (signetResourcesData) {
      setAllResourcesDisplayed(sortByAlphabet(signetResourcesData));
    }
  }, [signetResourcesData]);

  return (
    <>
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
        <div className="med-root-container">
          <div className={`med-search-container`}>
            <div className={`med-search-page-content`}>
              <div className={`med-search-page-header`}>
                <div className={`med-search-page-title`}>
                  <BookmarkIcon className={`med-search-icon`} />
                  <h1 className={`med-search-title`}>
                    {t("mediacentre.sidebar.signets")}
                  </h1>
                </div>
              </div>
              <div className={`med-search-page-content-body`}>
                {signetResourcesData && !signetResourcesData.length ? (
                  <EmptyState
                    imgSource="empty-state-signets.png"
                    title="mediacentre.empty.state.signets"
                  />
                ) : (
                  <>
                    <FilterLayout
                      resources={signetResourcesData}
                      allResourcesDisplayed={allResourcesDisplayed}
                      setAllResourcesDisplayed={setAllResourcesDisplayed}
                    />
                    {allResourcesDisplayed && !allResourcesDisplayed.length ? (
                      <EmptyState title="mediacentre.empty.state.filter" />
                    ) : (
                      <InfiniteScrollList
                        redirectLink="/signets"
                        allResourcesDisplayed={allResourcesDisplayed}
                      />
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </>
    </>
  );
};
