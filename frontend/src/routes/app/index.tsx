import React, { useState, useEffect } from "react";

import { ID } from "edifice-ts-client";

import { ListCard } from "~/components/list-card/ListCard.tsx";
import { MainLayout } from "~/components/main-layout/MainLayout";
import { Resource } from "~/components/resource/Resource";
import { ListCardTypeEnum } from "~/core/enum/list-card-type.enum.ts";

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

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const getFavoriteCard = () => {
    return (
      <Resource
        image="https://via.placeholder.com/150"
        title="Favorite Resource Title"
        type={ListCardTypeEnum.favorites}
        favorite={true}
      />
    );
  };

  const getManualCard = () => {
    return (
      <Resource
        image="https://via.placeholder.com/150"
        title="Ressource Histoire Géographie"
        subtitle="Nathan"
        type={ListCardTypeEnum.manuals}
        favorite={false}
      />
    );
  };

  const getBookMarkCard = () => {
    return (
      <Resource
        image="https://via.placeholder.com/150"
        title="Parcours Sup"
        subtitle="Modifié le 06/07/2024"
        footerText="Lycée Connecté"
        type={ListCardTypeEnum.book_mark}
        favorite={false}
      />
    );
  };

  const getPinnedResourceCard = () => {
    return (
      <Resource
        image="https://via.placeholder.com/150"
        title="Universalis"
        subtitle="Une encyclopédie en ligne pour tous vos exposés"
        footerText="Offert par la Région"
        type={ListCardTypeEnum.pinned_resources}
        favorite={false}
      />
    );
  };

  function getCards(nbCards: number, type: ListCardTypeEnum) {
    const cards = [];
    for (let i = 0; i < nbCards; i++) {
      switch (type) {
        case ListCardTypeEnum.favorites:
          cards.push(getFavoriteCard());
          break;
        case ListCardTypeEnum.manuals:
          cards.push(getManualCard());
          break;
        case ListCardTypeEnum.book_mark:
          cards.push(getBookMarkCard());
          break;
        case ListCardTypeEnum.pinned_resources:
          cards.push(getPinnedResourceCard());
          break;
        default:
          break;
      }
    }
    return cards;
  }

  if (windowWidth >= 1280) {
    return (
      <>
        <MainLayout />
        <div className="med-container">
          <div className="list-container">
            <div className="left-container">
              <ListCard
                scrollable={true}
                type={ListCardTypeEnum.pinned_resources}
                components={getCards(6, ListCardTypeEnum.pinned_resources)}
              />
              <div className="bottom-container">
                <div className="bottom-left-container">
                  <ListCard
                    scrollable={false}
                    type={ListCardTypeEnum.manuals}
                    components={getCards(8, ListCardTypeEnum.manuals)}
                  />
                </div>
                <div className="bottom-right-container">
                  <ListCard
                    scrollable={false}
                    type={ListCardTypeEnum.book_mark}
                    components={getCards(8, ListCardTypeEnum.book_mark)}
                  />
                </div>
              </div>
            </div>
            <div className="right-container">
              <ListCard
                scrollable={false}
                type={ListCardTypeEnum.favorites}
                components={getCards(8, ListCardTypeEnum.favorites)}
              />
            </div>
          </div>
        </div>
      </>
    );
  } else if (windowWidth >= 768) {
    return (
      <>
        <MainLayout />
        <div className="med-container">
          <ListCard
            scrollable={true}
            type={ListCardTypeEnum.pinned_resources}
            components={getCards(6, ListCardTypeEnum.pinned_resources)}
          />
          <ListCard
            scrollable={false}
            type={ListCardTypeEnum.favorites}
            components={getCards(8, ListCardTypeEnum.favorites)}
          />
          <div className="bottom-container">
            <div className="bottom-left-container">
              <ListCard
                scrollable={false}
                type={ListCardTypeEnum.manuals}
                components={getCards(8, ListCardTypeEnum.manuals)}
              />
            </div>
            <div className="bottom-right-container">
              <ListCard
                scrollable={false}
                type={ListCardTypeEnum.book_mark}
                components={getCards(8, ListCardTypeEnum.book_mark)}
              />
            </div>
          </div>
        </div>
      </>
    );
  } else {
    return (
      <>
        <MainLayout />
        <div className="med-container">
          <ListCard
            scrollable={true}
            type={ListCardTypeEnum.pinned_resources}
            components={getCards(6, ListCardTypeEnum.pinned_resources)}
          />
          <ListCard
            scrollable={false}
            type={ListCardTypeEnum.favorites}
            components={getCards(8, ListCardTypeEnum.favorites)}
          />
          <ListCard
            scrollable={false}
            type={ListCardTypeEnum.manuals}
            components={getCards(8, ListCardTypeEnum.manuals)}
          />
          <ListCard
            scrollable={false}
            type={ListCardTypeEnum.book_mark}
            components={getCards(8, ListCardTypeEnum.book_mark)}
          />
        </div>
      </>
    );
  }
};
