import { AlertTypes, LoadingScreen } from "@edifice-ui/react";
import { useTranslation } from "react-i18next";

import { ListCard } from "../list-card/ListCard";
import { Resource } from "../resource/Resource";
import { CardTypeEnum } from "~/core/enum/card-type.enum";
import { ExternalResource } from "~/model/ExternalResource.model";
import { Favorite } from "~/model/Favorite.model";
import { GlobalResource } from "~/model/GlobalResource.model";
import { Signet } from "~/model/Signet.model";
import { Textbook } from "~/model/Textbook.model";

import "./HomeList.scss";

interface HomeListProps {
  resources:
    | Textbook[]
    | ExternalResource[]
    | GlobalResource[]
    | Favorite[]
    | Signet[]
    | null;
  type: CardTypeEnum;
  setAlertText: (arg: string) => void;
  setAlertType: (arg: AlertTypes) => void;
  handleAddFavorite: (resource: any) => void;
  handleRemoveFavorite: (id: string | number) => void;
  isDouble?: boolean;
  isPinsEmpty: boolean;
}

export const HomeList: React.FC<HomeListProps> = ({
  resources,
  type,
  setAlertText,
  setAlertType,
  handleAddFavorite,
  handleRemoveFavorite,
  isDouble,
  isPinsEmpty,
}) => {
  const { t } = useTranslation();
  const redirectLink = () => {
    if (type === CardTypeEnum.manuals) {
      return "/mediacentre#/textbook";
    }
    if (type === CardTypeEnum.external_resources) {
      return "/mediacentre#/resources";
    }
    if (type === CardTypeEnum.favorites) {
      return "/mediacentre#/favorites";
    }
    if (type === CardTypeEnum.book_mark) {
      return "/mediacentre?view=angular#/signet";
    }
    return "/mediacentre";
  };

  if (!resources) {
    return (
      <div className={type === CardTypeEnum.favorites ? "" : "med-double-list"}>
        <LoadingScreen />
      </div>
    );
  }

  return (
    <div
      className={
        isDouble || type === CardTypeEnum.favorites
          ? "med-simple-list"
          : "med-double-list"
      }
    >
      <ListCard
        scrollable={false}
        type={type}
        components={resources.map(
          (
            resource:
              | Textbook
              | ExternalResource
              | GlobalResource
              | Favorite
              | Signet,
          ) => (
            <Resource
              id={resource?.id ?? ""}
              key={resource.id}
              image={
                resource?.image ??
                "/mediacentre/public/img/no-image-resource.png"
              }
              title={resource?.title}
              subtitle={
                type === CardTypeEnum.favorites
                  ? (resource as Favorite).description
                  : type === CardTypeEnum.book_mark
                  ? (resource as Signet).orientation
                    ? t("mediacentre.signet.orientation")
                    : ""
                  : resource?.editors?.join(", ") ?? ""
              }
              type={
                type === CardTypeEnum.external_resources
                  ? CardTypeEnum.manuals
                  : type
              }
              favorite={resource.favorite}
              link={resource?.link ?? resource?.url ?? "/"}
              setAlertText={(arg: string, type: AlertTypes) => {
                setAlertText(arg);
                setAlertType(type);
              }}
              {...(type === CardTypeEnum.book_mark && {
                shared: (resource as Signet).shared ?? false,
                footerImage: (resource as Signet).owner_id
                  ? `/userbook/avatar/${
                      (resource as Signet).owner_id
                    }?thumbnail=48x48`
                  : `/mediacentre/public/img/no-avatar.svg`,
                footerText:
                  (resource as Signet).owner_name ??
                  (resource?.authors ? resource?.authors[0] : " ") ??
                  "",
              })}
              resource={resource}
              handleAddFavorite={handleAddFavorite}
              handleRemoveFavorite={handleRemoveFavorite}
            />
          ),
        )}
        redirectLink={redirectLink()}
        homeDouble={isDouble}
        isPinsEmpty={isPinsEmpty}
      />
    </div>
  );
};
