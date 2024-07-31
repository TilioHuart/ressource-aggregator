import { useCallback, useEffect, useRef, useState } from "react";

import { LoadingScreen } from "@edifice-ui/react";
import { useNavigate } from "react-router-dom";

import { ListCard } from "../list-card/ListCard";
import { SearchCard } from "../search-card/SearchCard";
import { CardTypeEnum } from "~/core/enum/card-type.enum";
import { Resource } from "~/model/Resource.model";

interface InfiniteScrollListProps {
  redirectLink: string;
  allResourcesDisplayed: Resource[] | null;
}

export const InfiniteScrollList: React.FC<InfiniteScrollListProps> = ({
  redirectLink,
  allResourcesDisplayed,
}) => {
  const loaderRef = useRef(null);
  const navigate = useNavigate();
  const [indexVisibleResources, setIndexVisibleResources] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [visibleResources, setVisibleResources] = useState<Resource[] | null>(
    null,
  ); // resources visible (load more with infinite scroll)
  const [isRemoveResource, setIsRemoveResource] = useState(false); // only used to remove a resource (when unfav) on favorite page

  const loadMoreResources = useCallback(() => {
    if (!allResourcesDisplayed) return;
    if (
      JSON.stringify(visibleResources) === JSON.stringify(allResourcesDisplayed)
    )
      return;
    setIndexVisibleResources(indexVisibleResources + 1);
    if (redirectLink === "/favorites") {
      setVisibleResources(
        allResourcesDisplayed
          .filter((resource) => resource.favorite)
          .slice(0, indexVisibleResources * 10),
      );
    } else {
      setVisibleResources(
        allResourcesDisplayed.slice(0, indexVisibleResources * 10),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    visibleResources,
    allResourcesDisplayed,
    indexVisibleResources,
    redirectLink,
  ]);

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
    if (allResourcesDisplayed) {
      if (redirectLink === "/favorites") {
        setVisibleResources(
          allResourcesDisplayed
            .filter((resource) => resource.favorite)
            .slice(0, indexVisibleResources * 10),
        );
      } else {
        setVisibleResources(
          allResourcesDisplayed.slice(0, indexVisibleResources * 10),
        );
      }
      setIsLoading(false);
      setIsRemoveResource(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allResourcesDisplayed, isRemoveResource]);

  return (
    <>
      {isLoading ? (
        <LoadingScreen position={false} />
      ) : (
        <>
          <ListCard
            scrollable={false}
            type={CardTypeEnum.search}
            components={visibleResources?.map((searchResource: any) => (
              <SearchCard
                searchResource={searchResource}
                link={searchResource.link ?? searchResource.url ?? "/"}
                setIsRemoveResource={setIsRemoveResource}
                allResourcesDisplayed={allResourcesDisplayed}
                key={searchResource.id}
              />
            ))}
            redirectLink={() => navigate(redirectLink)}
          />
          <div ref={loaderRef} />
        </>
      )}
    </>
  );
};
