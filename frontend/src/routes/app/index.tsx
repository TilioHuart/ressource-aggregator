import { useState, useEffect, useReducer } from "react";

import { Alert, AlertTypes } from "@edifice-ui/react";
import { ID } from "edifice-ts-client";
import { useTranslation } from "react-i18next";

import { HomeBookMarksList } from "~/components/home-lists/HomeBookMarksList";
import { HomeExternalResourcesList } from "~/components/home-lists/HomeExternalResourcesList";
import { HomeFavoritesList } from "~/components/home-lists/HomeFavoritesList";
import { HomeManualsList } from "~/components/home-lists/HomeManualsList";
import { MainLayout } from "~/components/main-layout/MainLayout";
import { useFavorite } from "~/hooks/useFavorite";
import { useSignet } from "~/hooks/useSignet";
import { useTextbook } from "~/hooks/useTextbook";
import { ExternalResource } from "~/model/ExternalResource.model";
import { Favorite } from "~/model/Favorite.model";
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
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [alertText, setAlertText] = useState<string>("");
  const [alertType, setAlertType] = useState<AlertTypes>("success");
  const [, forceUpdate] = useReducer((x) => x + 1, 0);
  const { favorites, setFavorites } = useFavorite();
  const { homeSignets, setHomeSignets } = useSignet();

  const { textbooks, setTextbooks, externalResources, setExternalResources } =
    useTextbook();
  const { t } = useTranslation();
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [alertText]);

  const handleAddFavorite = (resource: any) => {
    resource.favorite = true;
    setFavorites((prevFavorites: Favorite[]) => [...prevFavorites, resource]);
  };

  const handleRemoveFavorite = (id: string | number) => {
    setFavorites((prevFavorites: Favorite[]) =>
      prevFavorites.filter((fav) => fav.id != id),
    );
    updateFavoriteStatus(id, false);
  };

  const updateFavoriteStatus = (id: string | number, isFavorite: boolean) => {
    let newSignets: Signet[] = [...homeSignets];
    newSignets = newSignets.map((signet: Signet) =>
      signet?.id?.toString() == id.toString()
        ? { ...signet, favorite: isFavorite }
        : signet,
    );
    setHomeSignets(newSignets);
    let newTextbooks: Textbook[] = [...textbooks];
    newTextbooks = newTextbooks.map((textbook: Textbook) =>
      textbook?.id?.toString() == id.toString()
        ? { ...textbook, favorite: isFavorite }
        : textbook,
    );
    setTextbooks(newTextbooks);
    let newExternalResources: ExternalResource[] = [...externalResources];
    newExternalResources = newExternalResources.map(
      (externalResource: ExternalResource) =>
        externalResource?.id?.toString() == id.toString()
          ? { ...externalResource, favorite: isFavorite }
          : externalResource,
    );
    setExternalResources(newExternalResources);
    forceUpdate(); // List are not re-rendering without this
  };

  function isArrayEmpty(arr: any[]) {
    return !(arr && arr.length > 0);
  }

  const leftContainer = () => {
    // case 1: textbooks and externalResources are empty and homeSignets is not empty
    if (
      isArrayEmpty(textbooks) &&
      isArrayEmpty(externalResources) &&
      !isArrayEmpty(homeSignets)
    ) {
      return (
        <HomeBookMarksList
          homeSignets={homeSignets}
          setAlertText={setAlertText}
          setAlertType={setAlertType}
          handleAddFavorite={handleAddFavorite}
          handleRemoveFavorite={handleRemoveFavorite}
          double={true}
        />
      );
    }
    // case 2: textbooks and homeSignets are empty and externalResources is not empty
    else if (
      isArrayEmpty(textbooks) &&
      isArrayEmpty(homeSignets) &&
      !isArrayEmpty(externalResources)
    ) {
      return (
        <HomeExternalResourcesList
          externalResources={externalResources}
          setAlertText={setAlertText}
          setAlertType={setAlertType}
          handleAddFavorite={handleAddFavorite}
          handleRemoveFavorite={handleRemoveFavorite}
          double={true}
        />
      );
    }
    // case 3: externalResources and homeSignets are empty and textbooks is not empty
    else if (
      isArrayEmpty(externalResources) &&
      isArrayEmpty(homeSignets) &&
      !isArrayEmpty(textbooks)
    ) {
      return (
        <HomeManualsList
          textbooks={textbooks}
          setAlertText={setAlertText}
          setAlertType={setAlertType}
          handleAddFavorite={handleAddFavorite}
          handleRemoveFavorite={handleRemoveFavorite}
          double={true}
        />
      );
    }
    // case 4: all lists are empty
    else if (
      isArrayEmpty(textbooks) &&
      isArrayEmpty(homeSignets) &&
      isArrayEmpty(externalResources)
    ) {
      return (
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
      );
    }
    // case 5: there at least two lists with data
    else {
      // case 5.1: textbooks is empty
      if (isArrayEmpty(textbooks)) {
        return (
          <>
            <div className="bottom-left-container">
              <HomeExternalResourcesList
                externalResources={externalResources}
                setAlertText={setAlertText}
                setAlertType={setAlertType}
                handleAddFavorite={handleAddFavorite}
                handleRemoveFavorite={handleRemoveFavorite}
              />
            </div>
            <div className="bottom-right-container">
              <HomeBookMarksList
                homeSignets={homeSignets}
                setAlertText={setAlertText}
                setAlertType={setAlertType}
                handleAddFavorite={handleAddFavorite}
                handleRemoveFavorite={handleRemoveFavorite}
              />
            </div>
          </>
        );
      }
      // case 5.2: bookmarks is empty
      else if (isArrayEmpty(homeSignets)) {
        return (
          <>
            <div className="bottom-left-container">
              <HomeManualsList
                textbooks={textbooks}
                setAlertText={setAlertText}
                setAlertType={setAlertType}
                handleAddFavorite={handleAddFavorite}
                handleRemoveFavorite={handleRemoveFavorite}
              />
            </div>
            <div className="bottom-right-container">
              <HomeExternalResourcesList
                externalResources={externalResources}
                setAlertText={setAlertText}
                setAlertType={setAlertType}
                handleAddFavorite={handleAddFavorite}
                handleRemoveFavorite={handleRemoveFavorite}
              />
            </div>
          </>
        );
      }
      // case 5.3: externalResources is empty or all lists have data
      else {
        return (
          <>
            <div className="bottom-left-container">
              <HomeManualsList
                textbooks={textbooks}
                setAlertText={setAlertText}
                setAlertType={setAlertType}
                handleAddFavorite={handleAddFavorite}
                handleRemoveFavorite={handleRemoveFavorite}
              />
            </div>
            <div className="bottom-right-container">
              <HomeBookMarksList
                homeSignets={homeSignets}
                setAlertText={setAlertText}
                setAlertType={setAlertType}
                handleAddFavorite={handleAddFavorite}
                handleRemoveFavorite={handleRemoveFavorite}
              />
            </div>
          </>
        );
      }
    }
  };

  if (windowWidth >= 1280) {
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
          <div className="list-container">
            <div className="left-container">
              <div className="bottom-container">{leftContainer()}</div>
            </div>
            <div className="right-container">
              {favorites && (
                <HomeFavoritesList
                  favorites={favorites}
                  setAlertText={setAlertText}
                  setAlertType={setAlertType}
                  handleAddFavorite={handleAddFavorite}
                  handleRemoveFavorite={handleRemoveFavorite}
                />
              )}
            </div>
          </div>
        </div>
      </>
    );
  } else if (windowWidth >= 992) {
    return (
      <>
        <MainLayout />
        {alertText !== "" && (
          <Alert
            autoClose
            autoCloseDelay={3000}
            isDismissible
            isToast
            onClose={() => setAlertText("")}
            position="top-right"
            type="success"
            className="med-alert"
          >
            {alertText}
          </Alert>
        )}
        <div className="med-container">
          <HomeFavoritesList
            favorites={favorites}
            setAlertText={setAlertText}
            setAlertType={setAlertType}
            handleAddFavorite={handleAddFavorite}
            handleRemoveFavorite={handleRemoveFavorite}
          />
          <div className="list-container">
            <div className="left-container">
              <div className="bottom-container">{leftContainer()}</div>
            </div>
          </div>
        </div>
      </>
    );
  } else {
    return (
      <>
        <MainLayout />
        {alertText !== "" && (
          <Alert
            autoClose
            autoCloseDelay={3000}
            isDismissible
            isToast
            onClose={() => setAlertText("")}
            position="top-right"
            type="success"
            className="med-alert"
          >
            {alertText}
          </Alert>
        )}
        <div className="med-container">
          <HomeFavoritesList
            favorites={favorites}
            setAlertText={setAlertText}
            setAlertType={setAlertType}
            handleAddFavorite={handleAddFavorite}
            handleRemoveFavorite={handleRemoveFavorite}
          />
          <HomeManualsList
            textbooks={textbooks}
            setAlertText={setAlertText}
            setAlertType={setAlertType}
            handleAddFavorite={handleAddFavorite}
            handleRemoveFavorite={handleRemoveFavorite}
          />
          <HomeBookMarksList
            homeSignets={homeSignets}
            setAlertText={setAlertText}
            setAlertType={setAlertType}
            handleAddFavorite={handleAddFavorite}
            handleRemoveFavorite={handleRemoveFavorite}
          />
        </div>
      </>
    );
  }
};
