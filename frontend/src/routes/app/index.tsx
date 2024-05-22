import React, { useState, useEffect } from "react";

import { ID } from "edifice-ts-client";

import { Header } from "~/components/header/Header.tsx";
import { ListCard } from "~/components/list-card/ListCard.tsx";
import { Resource } from "~/components/resource/Resource";
import { Sidebar } from "~/components/sidebar/Sidebar.tsx";
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

    // Nettoyage du listener lors du démontage du composant
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const getResourceCard = () => {
    return (
      <Resource
        image="https://via.placeholder.com/150"
        title="Resource Title"
        subtitle="Resource Subtitle"
        size="medium"
        favorite={false}
      />
    );
  };
  function getCards(nbCards: number) {
    const cards = [];
    for (let i = 0; i < nbCards; i++) {
      cards.push(getResourceCard());
    }
    return cards;
  }

  if (windowWidth >= 1280) {
    return (
      <>
        <Sidebar />
        <div className="med-container">
          <Header />
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div style={{ width: "70%" }}>
              <ListCard
                scrollable={true}
                type={ListCardTypeEnum.pinned_resources}
                components={getCards(6)}
              />
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <ListCard
                  scrollable={false}
                  type={ListCardTypeEnum.manuals}
                  components={getCards(8)}
                />
                <ListCard
                  scrollable={false}
                  type={ListCardTypeEnum.util_links}
                  components={getCards(8)}
                />
              </div>
            </div>
            <div style={{ width: "30%" }}>
              <ListCard
                scrollable={false}
                type={ListCardTypeEnum.favorites}
                components={getCards(8)}
              />
            </div>
          </div>
        </div>
      </>
    );
  } else if (windowWidth >= 768) {
    return (
      <>
        <Sidebar />
        <div className="med-container">
          <Header />
          <ListCard
            scrollable={true}
            type={ListCardTypeEnum.pinned_resources}
            components={getCards(6)}
          />
          <ListCard
            scrollable={false}
            type={ListCardTypeEnum.favorites}
            components={getCards(8)}
          />
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <ListCard
              scrollable={false}
              type={ListCardTypeEnum.manuals}
              components={getCards(8)}
            />
            <ListCard
              scrollable={false}
              type={ListCardTypeEnum.util_links}
              components={getCards(8)}
            />
          </div>
        </div>
      </>
    );
  } else {
    return (
      <>
        <Sidebar />
        <div className="med-container">
          <Header />
          <ListCard
            scrollable={true}
            type={ListCardTypeEnum.pinned_resources}
            components={getCards(6)}
          />
          <ListCard
            scrollable={false}
            type={ListCardTypeEnum.favorites}
            components={getCards(8)}
          />
          <ListCard
            scrollable={false}
            type={ListCardTypeEnum.manuals}
            components={getCards(8)}
          />
          <ListCard
            scrollable={false}
            type={ListCardTypeEnum.util_links}
            components={getCards(8)}
          />
        </div>
      </>
    );
  }
};
