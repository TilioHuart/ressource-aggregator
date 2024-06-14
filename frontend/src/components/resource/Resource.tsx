import React, { useEffect, useState } from "react";

import "./Resource.scss";
import { AlertTypes, Card } from "@edifice-ui/react";
import { Tooltip } from "@edifice-ui/react";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import { useTranslation } from "react-i18next";

import { CardTypeEnum } from "~/core/enum/card-type.enum.ts";
import { ExternalResource } from "~/model/ExternalResource.model";
import { Favorite } from "~/model/Favorite.model";
import { GlobalResource } from "~/model/GlobalResource";
import { Signet } from "~/model/Signet.model";
import { Textbook } from "~/model/Textbook.model";
import {
  useAddFavoriteMutation,
  useRemoveFavoriteMutation,
} from "~/services/api/favorite.service";

interface ResourceProps {
  resource: Signet | Favorite | Textbook | ExternalResource | GlobalResource;
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
  setAlertText: (arg: string, type: AlertTypes) => void;
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
  setAlertText,
  handleAddFavorite,
  handleRemoveFavorite,
}) => {
  const [newLink, setNewLink] = useState<string>("");
  const [addFavorite] = useAddFavoriteMutation();
  const [removeFavorite] = useRemoveFavoriteMutation();
  const { t } = useTranslation();
  const copy = () => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(link);
    } else {
      console.error("Clipboard not available");
    }
    setAlertText(t("mediacentre.notification.copy"), "success");
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
        await addFavorite({ id: newId, newResource });
      } else {
        await addFavorite({ id: resource._id, resource });
      }
      setAlertText(t("mediacentre.notification.addFavorite"), "success");
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
          id: resource._id,
          source: resource?.source,
        });
      }
      setAlertText(t("mediacentre.notification.removeFavorite"), "success");
      handleRemoveFavorite(id);
    } catch (e) {
      console.error(e);
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

  if (type === CardTypeEnum.book_mark) {
    return (
      <Card
        isSelectable={false}
        isClickable={false}
        className={`med-resource-card ${type}`}
      >
        <a
          className="med-body"
          href={newLink !== "/" ? newLink : "/"}
          target="_blank"
        >
          <Card.Body space={"0"}>
            {image ? (
              <img
                src={image}
                alt="Resource"
                className="med-resource-image"
                onError={({ currentTarget }) => {
                  currentTarget.onerror = null;
                  currentTarget.src = "/mediacentre/public/img/no-avatar.svg";
                }}
              />
            ) : (
              <img
                src="/mediacentre/public/img/no-avatar.svg"
                alt="Resource"
                className="med-resource-image"
              />
            )}
          </Card.Body>
          <div className="med-text-body">
            <Card.Title>{title}</Card.Title>
            <Card.Text>{subtitle}</Card.Text>
          </div>
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
                  Signet de la plateforme
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
                <Tooltip
                  message={t("mediacentre.card.favorite")}
                  placement="top"
                >
                  <StarBorderIcon className="med-star" onClick={() => fav()} />
                </Tooltip>
              )
            ) : null}
          </div>
        </Card.Footer>
      </Card>
    );
  } else {
    return (
      <Card
        isSelectable={false}
        isClickable={false}
        className={`med-resource-card ${type}`}
      >
        <a
          href={newLink !== "/" ? newLink : "/"}
          target="_blank"
          className="med-link-card"
        >
          <Card.Title>{title}</Card.Title>
          {type != CardTypeEnum.favorites && <Card.Text>{subtitle}</Card.Text>}
          <Card.Body space={"0"}>
            {image ? (
              <img
                src={image}
                alt="Resource"
                className="med-resource-image"
                onError={({ currentTarget }) => {
                  currentTarget.onerror = null;
                  currentTarget.src = "/mediacentre/public/img/no-avatar.svg";
                }}
              />
            ) : (
              <img
                src="/mediacentre/public/img/no-avatar.svg"
                alt="Resource"
                className="med-resource-image"
              />
            )}
          </Card.Body>
        </a>
        <Card.Footer>
          {footerText ? (
            <div className="med-footer-text">
              <AutoAwesomeIcon />
              {footerText}
            </div>
          ) : null}
          <div className="med-footer-svg">
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
                <Tooltip
                  message={t("mediacentre.card.favorite")}
                  placement="top"
                >
                  <StarBorderIcon className="med-star" onClick={() => fav()} />
                </Tooltip>
              )
            ) : null}
          </div>
        </Card.Footer>
      </Card>
    );
  }
};
