import { useEffect, useState } from "react";

import { Alert, Button, isActionAvailable } from "@edifice-ui/react";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import { useTranslation } from "react-i18next";

import { AdminSignet } from "~/components/admin-signet/AdminSignet";
import { EmptyState } from "~/components/empty-state/empty-state";
import { FilterLayout } from "~/components/filter-layout/FilterLayout";
import { InfiniteScrollList } from "~/components/infinite-scroll-list/InfiniteScrollList";
import { MainLayout } from "~/components/main-layout/MainLayout";
import { CreatePins } from "~/components/modals/create-pins/CreatePins";
import { useSignet } from "~/hooks/useSignet";
import { Resource } from "~/model/Resource.model";
import { useAlertProvider } from "~/providers/AlertProvider";
import { usePinProvider } from "~/providers/PinProvider";
import { useActions } from "~/services/queries";
import { sortByAlphabet } from "~/utils/sortResources.util";
import "~/styles/page/signet.scss";
import "~/styles/page/search.scss";

export const SignetPage: React.FC = () => {
  const { t } = useTranslation();
  const { refetchPins } = usePinProvider();
  const { alertType, alertText, setAlertText } = useAlertProvider();

  // RIGHTS
  const { data: actions } = useActions();
  const canAccessSignet = isActionAvailable("signets", actions);

  const { homeSignets } = useSignet();
  const [allResourcesDisplayed, setAllResourcesDisplayed] = useState<
    Resource[] | null
  >(null); // all resources after the filters
  const [signetResourcesData, setSignetResourcesData] = useState<
    Resource[] | null
  >(null);
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  const canAccess = () => (canAccessSignet ? "signets" : "search");

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
          <div className={`med-${canAccess()}-container`}>
            {canAccessSignet && (
              <div className="med-signets-admin-container">
                <AdminSignet />
              </div>
            )}
            <div className={`med-${canAccess()}-page-content`}>
              <div className={`med-${canAccess()}-page-header`}>
                <div className={`med-${canAccess()}-page-title`}>
                  <BookmarkIcon className={`med-${canAccess()}-icon`} />
                  <h1 className={`med-${canAccess()}-title`}>
                    {t("mediacentre.sidebar.signets")}
                  </h1>
                </div>
                {canAccessSignet && (
                  <Button
                    color="primary"
                    type="button"
                    className="med-signets-create-button"
                  >
                    {t("mediacentre.signet.create.button")}
                  </Button>
                )}
              </div>
              <div className={`med-${canAccess()}-page-content-body`}>
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
