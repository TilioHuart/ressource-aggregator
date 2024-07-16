import React, { useEffect, useState } from "react";

import "./Resource.scss";
import { AlertTypes, Card, isActionAvailable } from "@edifice-ui/react";
import { Tooltip } from "@edifice-ui/react";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import PinIcon from "@mui/icons-material/PushPin";
import UnPinIcon from "@mui/icons-material/PushPinOutlined";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import { useTranslation } from "react-i18next";

import { ResourceTitle } from "./resource-title/ResourceTitle";
import { CardTypeEnum } from "~/core/enum/card-type.enum.ts";
import { ExternalResource } from "~/model/ExternalResource.model";
import { Favorite } from "~/model/Favorite.model";
import { GlobalResource } from "~/model/GlobalResource.model";
import { Pin } from "~/model/Pin.model";
import { SearchResource } from "~/model/SearchResource.model";
import { Signet } from "~/model/Signet.model";
import { Textbook } from "~/model/Textbook.model";
import { useAlertProvider } from "~/providers/AlertProvider";
import { useModalProvider } from "~/providers/ModalsProvider";
import {
  useAddFavoriteMutation,
  useRemoveFavoriteMutation,
} from "~/services/api/favorite.service";
import { useActions } from "~/services/queries";

interface ResourceProps {
  resource:
    | Signet
    | Favorite
    | Textbook
    | ExternalResource
    | GlobalResource
    | Pin;
  id: string | number;
  image: string;
  title: string;
  subtitle?: string;
  footerText?: string;
  type?: CardTypeEnum;
  favorite?: boolean;
  link: string;
  footerImage?: string;
  shared?: boolean;
  handleAddFavorite: (resource: any) => void;
  handleRemoveFavorite: (id: string | number) => void;
}

export const Resource: React.FC<ResourceProps> = ({
  resource,
  id,
  image,
  title,
  subtitle,
  footerText,
  type = CardTypeEnum.favorites,
  favorite = false,
  shared = false,
  link,
  footerImage,
  handleAddFavorite,
  handleRemoveFavorite,
}) => {
  const [newLink, setNewLink] = useState<string>("");
  const [addFavorite] = useAddFavoriteMutation();
  const [removeFavorite] = useRemoveFavoriteMutation();
  const { t } = useTranslation();
  const { setAlertText, setAlertType } = useAlertProvider();
  const { setModalResource, setIsCreatedOpen } = useModalProvider();

  // used to check if the user has the right to pin a resource
  const { data: actions } = useActions();
  const hasPinRight = isActionAvailable("pins", actions);

  const notify = (message: string, type: AlertTypes) => {
    setAlertText(message);
    setAlertType(type);
  };

  const copy = () => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(link);
    } else {
      console.error("Clipboard not available");
    }
    notify(t("mediacentre.notification.copy"), "success");
  };

  const fav = async () => {
    try {
      if (
        resource.source === "fr.openent.mediacentre.source.Signet" ||
        resource.source === "fr.openent.mediacentre.source.GlobalResource"
      ) {
        const newId = parseInt(resource.id as string);
        const newResource = {
          ...resource,
          id: newId,
        };
        await addFavorite({ id: newId, resource: newResource });
      } else {
        await addFavorite({ id: resource._id, resource });
      }
      notify(t("mediacentre.notification.addFavorite"), "success");
      handleAddFavorite(resource);
    } catch (e) {
      console.error(e);
    }
  };

  const unfav = async () => {
    try {
      if (
        resource.source === "fr.openent.mediacentre.source.Signet" ||
        resource.source === "fr.openent.mediacentre.source.GlobalResource"
      ) {
        const newId = resource.id
          ? parseInt(resource.id.toString())
          : resource.id;
        await removeFavorite({
          id: newId,
          source: resource?.source,
        });
      } else {
        await removeFavorite({
          id: resource.favoriteId ?? resource._id,
          source: resource?.source,
        });
      }
      notify(t("mediacentre.notification.removeFavorite"), "success");
      handleRemoveFavorite(id);
    } catch (e) {
      console.error(e);
    }
  };

  const pin = () => {
    if (resource) {
      setModalResource(resource as SearchResource);
      setIsCreatedOpen(true);
    }
  };

  useEffect(() => {
    if (
      !link.startsWith("https://") &&
      !link.startsWith("http://") &&
      link !== "/"
    ) {
      setNewLink("https://" + link);
    } else {
      setNewLink(link);
    }
  }, [link]);

  const isBookMark = () => type === CardTypeEnum.book_mark;
  const isFavorite = () => type === CardTypeEnum.favorites;

  return (
    <Card
      isSelectable={false}
      isClickable={false}
      className={`med-resource-card ${type}`}
    >
      <a
        className={isBookMark() ? "med-body" : "med-link-card"}
        href={newLink !== "/" ? newLink : "/"}
        target="_blank"
      >
        {!isBookMark() && (
          <ResourceTitle type={type} title={title} resource={resource} />
        )}
        {!isBookMark() && !isFavorite() && <Card.Text>{subtitle}</Card.Text>}
        <Card.Body space={"0"}>
          {image ? (
            <img
              src={image}
              alt="Resource"
              className="med-resource-image"
              onError={({ currentTarget }) => {
                currentTarget.onerror = null;
                currentTarget.src =
                  "/mediacentre/public/img/no-image-resource.png";
              }}
            />
          ) : (
            <img
              src="/mediacentre/public/img/no-image-resource.png"
              alt="Resource"
              className="med-resource-image"
            />
          )}
        </Card.Body>
        {isBookMark() && (
          <div className="med-text-body">
            <Card.Title>{title}</Card.Title>
            <Card.Text>{subtitle}</Card.Text>
          </div>
        )}
      </a>
      <Card.Footer>
        {footerText ? (
          shared ? (
            <div className="med-footer-text">
              <img
                src="/mediacentre/public/img/no-avatar.svg"
                alt="Resource"
                className="med-resource-footer-image"
              />
              <span className="med-footer-text-text">
                {t("mediacentre.signets.platform")}
              </span>
            </div>
          ) : (
            <div className="med-footer-text">
              <img
                src={footerImage}
                alt="Resource"
                className="med-resource-footer-image"
                onError={({ currentTarget }) => {
                  currentTarget.onerror = null;
                  currentTarget.src = "/mediacentre/public/img/no-avatar.svg";
                }}
              />
              <span className="med-footer-text-text">{footerText}</span>
            </div>
          )
        ) : null}
        <div className="med-footer-svg">
          {hasPinRight &&
            (resource?.is_pinned ? (
              <Tooltip
                message={t("mediacentre.card.already.pinned")}
                placement="top"
              >
                <PinIcon className="med-pin" />
              </Tooltip>
            ) : (
              <Tooltip message={t("mediacentre.card.pin")} placement="top">
                <UnPinIcon className="med-pin" onClick={() => pin()} />
              </Tooltip>
            ))}
          <Tooltip message={t("mediacentre.card.copy")} placement="top">
            <ContentCopyIcon className="med-link" onClick={() => copy()} />
          </Tooltip>
          {resource.source !==
          "fr.openent.mediacentre.source.GlobalResource" ? (
            favorite ? (
              <Tooltip
                message={t("mediacentre.card.unfavorite")}
                placement="top"
              >
                <StarIcon className="med-star" onClick={() => unfav()} />
              </Tooltip>
            ) : (
              <Tooltip message={t("mediacentre.card.favorite")} placement="top">
                <StarBorderIcon className="med-star" onClick={() => fav()} />
              </Tooltip>
            )
          ) : null}
        </div>
      </Card.Footer>
    </Card>
  );
};
