import { useState, useEffect, useReducer, useCallback } from "react";

import { Alert, AlertTypes, useUser } from "@edifice-ui/react";
import { ID } from "edifice-ts-client";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";

import { HomeList } from "~/components/home-lists/HomeList";
import { MainLayout } from "~/components/main-layout/MainLayout";
import { ModalExplorer } from "~/components/modal-explorer/ModalExplorer";
import { CardTypeEnum } from "~/core/enum/card-type.enum";
import { useExternalResource } from "~/hooks/useExternalResource";
import { useFavorite } from "~/hooks/useFavorite";
import { useGlobal } from "~/hooks/useGlobal";
import { useSignet } from "~/hooks/useSignet";
import { useTextbook } from "~/hooks/useTextbook";
import { ExternalResource } from "~/model/ExternalResource.model";
import { Favorite } from "~/model/Favorite.model";
import { GlobalResource } from "~/model/GlobalResource.model";
import { Signet } from "~/model/Signet.model";
import { Textbook } from "~/model/Textbook.model";

export interface AppProps {
  _id: string;
  created: Date;
  description: string;
  map: string;
  modified: Date;
  name: string;
  owner: { userId: ID; displayName: string };
  shared: any[];
  thumbnail: string;
}

export const App = () => {
  const location = useLocation();
  const { user } = useUser();
  const [alertText, setAlertText] = useState<string>("");
  const [alertType, setAlertType] = useState<AlertTypes>("success");
  const [, forceUpdate] = useReducer((x) => x + 1, 0);
  const { favorites, setFavorites, refetchFavorite } = useFavorite();
  const { homeSignets, setHomeSignets } = useSignet();

  const { textbooks, setTextbooks, refetchTextbooks } = useTextbook();
  const { externalResources, setExternalResources, refetchSearch } =
    useExternalResource();
  const { globals } = useGlobal();
  const [externalResourcesData, setExternalResourcesData] = useState<
    (ExternalResource | GlobalResource)[] | null
  >(null);
  const [textbooksData, setTextbooksData] = useState<Textbook[] | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    let newExternalResourcesData: ExternalResource[] = [];
    if (user?.type.length === 1 && user.type.includes("Relative")) {
      if (globals) {
        newExternalResourcesData = globals;
      } else {
        return;
      }
    } else {
      if (externalResources) {
        newExternalResourcesData = externalResources;
      } else {
        return;
      }
    }

    // Avoid unnecessary state update to prevent infinite loop
    if (
      JSON.stringify(newExternalResourcesData) !==
      JSON.stringify(externalResourcesData)
    ) {
      setExternalResourcesData(newExternalResourcesData);
    }
  }, [user, externalResources, globals, externalResourcesData]);

  const fetchFavoriteTextbook: () => Textbook[] | null = useCallback(() => {
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
    const updated: Textbook[] | null = fetchFavoriteTextbook();
    setTextbooksData(updated);
  }, [textbooks, fetchFavoriteTextbook]);

  const fetchFavoriteExternalResource = useCallback(() => {
    if (externalResources && favorites) {
      return externalResources.map((externalResource: ExternalResource) => {
        const favorite = favorites.find(
          (fav: Favorite) => fav.id === externalResource.id,
        );
        if (favorite) {
          return { ...externalResource, favoriteId: favorite._id };
        }
        return externalResource;
      });
    } else {
      return externalResources;
    }
  }, [externalResources, favorites]);

  useEffect(() => {
    const updated: ExternalResource[] | GlobalResource[] =
      fetchFavoriteExternalResource();
    setExternalResourcesData(updated);
  }, [externalResources, fetchFavoriteExternalResource]);

    const handleAddFavorite = (resource: any) => {
        setFavorites((prevFavorites: Favorite[]) => [...prevFavorites, resource]);
        refetchAll();
        resource.favorite = true;
    };

    const refetchAll = () => {
        refetchFavorite();
        refetchTextbooks();
        refetchSearch();
    };

  useEffect(() => {
    refetchFavorite();
  }, [location, refetchFavorite]);

  const handleRemoveFavorite = (id: string | number) => {
    setFavorites((prevFavorites: Favorite[] | null) => {
      if (!prevFavorites) {
        return null;
      }
      return prevFavorites.filter((fav) => fav.id != id);
    });
    updateFavoriteStatus(id, false);
  };

  const updateFavoriteStatus = (id: string | number, isFavorite: boolean) => {
    if (homeSignets) {
      let newSignets: Signet[] = [...homeSignets];
      newSignets = newSignets.map((signet: Signet) =>
        signet?.id?.toString() == id.toString()
          ? { ...signet, favorite: isFavorite }
          : signet,
      );
      setHomeSignets(newSignets);
    }
    if (textbooks) {
      let newTextbooks: Textbook[] = [...textbooks];
      newTextbooks = newTextbooks.map((textbook: Textbook) =>
        textbook?.id?.toString() == id.toString()
          ? { ...textbook, favorite: isFavorite }
          : textbook,
      );
      setTextbooks(newTextbooks);
    }
    if (externalResourcesData) {
      let newExternalResources: ExternalResource[] | GlobalResource[] = [
        ...externalResourcesData,
      ];
      newExternalResources = newExternalResources.map(
        (externalResource: ExternalResource | GlobalResource) =>
          externalResource?.id?.toString() == id.toString()
            ? { ...externalResource, favorite: isFavorite }
            : externalResource,
      );
      setExternalResources(newExternalResources);
    }
    forceUpdate(); // List are not re-rendering without this
  };

  const isTextbooksEmpty = () => textbooksData?.length === 0 ?? 0;

  const isExternalResourcesEmpty = () =>
    externalResourcesData?.length === 0 ?? 0;

  const isHomeSignetsEmpty = () => homeSignets?.length === 0 ?? 0;

  /*
    return the type and the resource of resources to displayed
    examples:
    - [] -> case of all lists are empty
    - [{CardTypeEnum.manuals, textbooksData}] -> case of just one list is not empty
    - [{CardTypeEnum.manuals, textbooksData}, {CardTypeEnum.book_mark, homeSignets}] -> case of at least two lists are not empty
  */
  const resourcesList = () => {
    const listToReturn = [];
    // particular case of all lists are not empty
    if (
      !isTextbooksEmpty() &&
      !isExternalResourcesEmpty() &&
      !isHomeSignetsEmpty()
    ) {
      listToReturn.push({
        type: CardTypeEnum.manuals,
        resource: textbooksData,
      });
      listToReturn.push({
        type: CardTypeEnum.book_mark,
        resource: homeSignets,
      });
      return listToReturn;
    }
    // global case follow the logic of priority of lists (1:textbooks, 2:externalResources, 3:homeSignets)
    // one list is empty
    if (!isTextbooksEmpty()) {
      listToReturn.push({
        type: CardTypeEnum.manuals,
        resource: textbooksData,
      });
    }
    if (!isExternalResourcesEmpty()) {
      listToReturn.push({
        type: CardTypeEnum.external_resources,
        resource: externalResourcesData,
      });
    }
    if (!isHomeSignetsEmpty()) {
      listToReturn.push({
        type: CardTypeEnum.book_mark,
        resource: homeSignets,
      });
    }
    return listToReturn;
  };

  const double = () => {
    return resourcesList().length === 1;
  };

  return (
    <>
      <MainLayout />
      <ModalExplorer />
      {alertText !== "" && (
        <Alert
          autoClose
          autoCloseDelay={3000}
          isDismissible
          isToast
          onClose={() => setAlertText("")}
          position="top-right"
          type={alertType}
          className="med-alert"
        >
          {alertText}
        </Alert>
      )}
      <div className="med-container">
        <div className="med-fav-container">
          <HomeList
            resources={favorites}
            type={CardTypeEnum.favorites}
            setAlertText={setAlertText}
            setAlertType={setAlertType}
            handleAddFavorite={handleAddFavorite}
            handleRemoveFavorite={handleRemoveFavorite}
          />
        </div>
        <div className="med-resources-container">
          {resourcesList().length === 0 ? (
            // empty state
            <div className="empty-state">
              <img
                src="/mediacentre/public/img/empty-state.png"
                alt="empty-state"
                className="empty-state-img"
              />
              <span className="empty-state-text">
                {t("mediacentre.ressources.empty")}
              </span>
            </div>
          ) : (
            resourcesList().map((resource) => (
              <HomeList
                resources={resource.resource}
                type={resource.type}
                setAlertText={setAlertText}
                setAlertType={setAlertType}
                handleAddFavorite={handleAddFavorite}
                handleRemoveFavorite={handleRemoveFavorite}
                double={double()}
              />
            ))
          )}
        </div>
      </div>
    </>
  );
};
