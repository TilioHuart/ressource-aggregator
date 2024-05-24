import { useState, useEffect } from "react";

import { Alert } from "@edifice-ui/react";
import { ID } from "edifice-ts-client";
import { useTranslation } from "react-i18next";

import { ListCard } from "~/components/list-card/ListCard.tsx";
import { MainLayout } from "~/components/main-layout/MainLayout";
import { Resource } from "~/components/resource/Resource";
import { ListCardTypeEnum } from "~/core/enum/list-card-type.enum.ts";
import { useFavorite } from "~/hooks/useFavorite";
import { useSignet } from "~/hooks/useSignet";
import { useTextbook } from "~/hooks/useTextbook";
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
  const { favorites } = useFavorite();
  const { homeSignets } = useSignet();
  const { textbooks } = useTextbook();
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

  const getPinnedResourceCard = () => {
    return (
      <Resource
        image="https://via.placeholder.com/150"
        title="Universalis"
        subtitle="Une encyclopédie en ligne pour tous vos exposés"
        footerText="Offert par la Région"
        type={ListCardTypeEnum.pinned_resources}
        favorite={false}
        link={"/"}
        setAlertText={(arg: string) => setAlertText(arg)}
      />
    );
  };

  function getCards(nbCards: number, type: ListCardTypeEnum) {
    const cards = [];
    for (let i = 0; i < nbCards; i++) {
      switch (type) {
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
                    components={textbooks.map((textbook: Textbook) => (
                      <Resource
                        key={textbook.id}
                        image={textbook.image}
                        title={textbook.title}
                        subtitle={textbook.editors.join(", ")}
                        type={ListCardTypeEnum.manuals}
                        favorite={textbook.favorite}
                        link={textbook.link ?? textbook.url ?? "/"}
                        setAlertText={(arg: string) => setAlertText(arg)}
                      />
                    ))}
                  />
                </div>
                <div className="bottom-right-container">
                  <ListCard
                    scrollable={false}
                    type={ListCardTypeEnum.book_mark}
                    components={homeSignets.map((signet: Signet) => (
                      <Resource
                        key={signet.id}
                        image={signet.image}
                        title={signet.title}
                        subtitle={
                          signet.orientation
                            ? t("mediacentre.signet.orientation")
                            : ""
                        }
                        type={ListCardTypeEnum.book_mark}
                        favorite={signet.favorite}
                        link={signet.link ?? signet.url ?? "/"}
                        footerImage={
                          signet.owner_id
                            ? `/userbook/avatar/${signet.owner_id}?thumbnail=48x48`
                            : `/img/no-avatar.svg`
                        }
                        footerText={
                          signet.owner_name ?? signet.authors
                            ? signet.authors[0]
                            : " "
                        }
                        setAlertText={(arg: string) => setAlertText(arg)}
                      />
                    ))}
                  />
                </div>
              </div>
            </div>
            <div className="right-container">
              <ListCard
                scrollable={false}
                type={ListCardTypeEnum.favorites}
                components={favorites.map((favorite: Favorite) => (
                  <Resource
                    key={favorite.id}
                    image={favorite.image}
                    title={favorite.title}
                    subtitle={favorite.description}
                    type={ListCardTypeEnum.favorites}
                    favorite={favorite.favorite}
                    link={favorite.link ?? favorite.url ?? "/"}
                    setAlertText={(arg: string) => setAlertText(arg)}
                  />
                ))}
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
          <ListCard
            scrollable={true}
            type={ListCardTypeEnum.pinned_resources}
            components={getCards(6, ListCardTypeEnum.pinned_resources)}
          />
          <ListCard
            scrollable={false}
            type={ListCardTypeEnum.favorites}
            components={favorites.map((favorite: Favorite) => (
              <Resource
                key={favorite.id}
                image={favorite.image}
                title={favorite.title}
                subtitle={favorite.description}
                type={ListCardTypeEnum.favorites}
                favorite={favorite.favorite}
                link={favorite.link ?? favorite.url ?? "/"}
                setAlertText={(arg: string) => setAlertText(arg)}
              />
            ))}
          />
          <div className="bottom-container">
            <div className="bottom-left-container">
              <ListCard
                scrollable={false}
                type={ListCardTypeEnum.manuals}
                components={textbooks.map((textbook: Textbook) => (
                  <Resource
                    key={textbook.id}
                    image={textbook.image}
                    title={textbook.title}
                    subtitle={textbook.editors.join(", ")}
                    type={ListCardTypeEnum.manuals}
                    favorite={textbook.favorite}
                    link={textbook.link ?? textbook.url ?? "/"}
                    setAlertText={(arg: string) => setAlertText(arg)}
                  />
                ))}
              />
            </div>
            <div className="bottom-right-container">
              <ListCard
                scrollable={false}
                type={ListCardTypeEnum.book_mark}
                components={homeSignets.map((signet: Signet) => (
                  <Resource
                    key={signet.id}
                    image={signet.image}
                    title={signet.title}
                    subtitle={
                      signet.orientation
                        ? t("mediacentre.signet.orientation")
                        : ""
                    }
                    type={ListCardTypeEnum.book_mark}
                    favorite={signet.favorite}
                    link={signet.link ?? signet.url ?? "/"}
                    footerImage={
                      signet.owner_id
                        ? `/userbook/avatar/${signet.owner_id}?thumbnail=48x48`
                        : `/img/no-avatar.svg`
                    }
                    footerText={
                      signet.owner_name ?? signet.authors
                        ? signet.authors[0]
                        : " "
                    }
                    setAlertText={(arg: string) => setAlertText(arg)}
                  />
                ))}
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
          <ListCard
            scrollable={true}
            type={ListCardTypeEnum.pinned_resources}
            components={getCards(6, ListCardTypeEnum.pinned_resources)}
          />
          <ListCard
            scrollable={false}
            type={ListCardTypeEnum.favorites}
            components={favorites.map((favorite: Favorite) => (
              <Resource
                key={favorite.id}
                image={favorite.image}
                title={favorite.title}
                subtitle={favorite.description}
                type={ListCardTypeEnum.favorites}
                favorite={favorite.favorite}
                link={favorite.link ?? favorite.url ?? "/"}
                setAlertText={(arg: string) => setAlertText(arg)}
              />
            ))}
          />
          <ListCard
            scrollable={false}
            type={ListCardTypeEnum.manuals}
            components={textbooks.map((textbook: Textbook) => (
              <Resource
                key={textbook.id}
                image={textbook.image}
                title={textbook.title}
                subtitle={textbook.editors.join(", ")}
                type={ListCardTypeEnum.manuals}
                favorite={textbook.favorite}
                link={textbook.link ?? textbook.url ?? "/"}
                setAlertText={(arg: string) => setAlertText(arg)}
              />
            ))}
          />
          <ListCard
            scrollable={false}
            type={ListCardTypeEnum.book_mark}
            components={homeSignets.map((signet: Signet) => (
              <Resource
                key={signet.id}
                image={signet.image}
                title={signet.title}
                subtitle={
                  signet.orientation ? t("mediacentre.signet.orientation") : ""
                }
                type={ListCardTypeEnum.book_mark}
                favorite={signet.favorite}
                link={signet.link ?? signet.url ?? "/"}
                footerImage={
                  signet.owner_id
                    ? `/userbook/avatar/${signet.owner_id}?thumbnail=48x48`
                    : `/img/no-avatar.svg`
                }
                footerText={
                  signet.owner_name ?? signet.authors ? signet.authors[0] : " "
                }
                setAlertText={(arg: string) => setAlertText(arg)}
              />
            ))}
          />
        </div>
      </>
    );
  }
};