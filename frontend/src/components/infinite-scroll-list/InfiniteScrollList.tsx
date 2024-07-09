import { useCallback, useEffect, useRef, useState } from "react";

import { LoadingScreen } from "@edifice-ui/react";
import { useNavigate } from "react-router-dom";

import { EmptyState } from "../empty-state/empty-state";
import { ListCard } from "../list-card/ListCard";
import { SearchCard } from "../search-card/SearchCard";
import { CardTypeEnum } from "~/core/enum/card-type.enum";
import { Resource } from "~/model/Resource.model";

interface InfiniteScrollListProps {
  redirectLink: string;
  allResourcesDisplayed: Resource[] | null;
  setAlertText: (alertText: string) => void;
  refetchData: () => void;
}

export const InfiniteScrollList: React.FC<InfiniteScrollListProps> = ({
  redirectLink,
  allResourcesDisplayed,
  setAlertText,
  refetchData,
}) => {
  const loaderRef = useRef(null);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [visibleResources, setVisibleResources] = useState<Resource[] | null>(
    null,
  ); // resources visible (load more with infinite scroll)

  const loadMoreResources = useCallback(() => {
    if (!allResourcesDisplayed) return;
    if (
      allResourcesDisplayed &&
      JSON.stringify(visibleResources) !== JSON.stringify(allResourcesDisplayed)
    ) {
      const nbVisibleResources = visibleResources?.length ?? 0;
      setVisibleResources((prevVisibleResources) => {
        let previtems = prevVisibleResources;
        if (
          JSON.stringify(prevVisibleResources) !==
          JSON.stringify(allResourcesDisplayed.slice(0, nbVisibleResources))
        ) {
          previtems = allResourcesDisplayed.slice(0, nbVisibleResources);
        }
        return [
          ...previtems,
          ...allResourcesDisplayed.slice(
            nbVisibleResources,
            nbVisibleResources + 10,
          ),
        ];
      });
    }
    setIsLoading(false);
  }, [allResourcesDisplayed, visibleResources]);

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const target = entries[0];
      if (target.isIntersecting && !isLoading) {
        setIsLoading(true);
        loadMoreResources();
      }
    },
    [isLoading, loadMoreResources],
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allResourcesDisplayed]);

  return (
    <>
      {isLoading ? (
        <LoadingScreen position={false} />
      ) : (
        <>
          {visibleResources && visibleResources.length !== 0 ? (
            <>
              <ListCard
                scrollable={false}
                type={CardTypeEnum.search}
                components={visibleResources.map((searchResource: any) => (
                  <SearchCard
                    searchResource={searchResource}
                    link={searchResource.link ?? searchResource.url ?? "/"}
                    setAlertText={setAlertText}
                    refetchData={refetchData}
                  />
                ))}
                redirectLink={() => navigate(redirectLink)}
              />
              <div ref={loaderRef} />
            </>
          ) : (
            <EmptyState title="mediacentre.search.empty" />
          )}
        </>
      )}
    </>
  );
};
