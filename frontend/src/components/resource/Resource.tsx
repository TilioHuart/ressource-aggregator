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
import { Favorite } from "~/model/Favorite.model";
import { Signet } from "~/model/Signet.model";
import { Textbook } from "~/model/Textbook.model";
import {
  useAddFavoriteMutation,
  useRemoveFavoriteMutation,
} from "~/services/api/favorite.service";

interface ResourceProps {
  resource: Signet | Favorite | Textbook;
  id: string;
  image: string;
  title: string;
  subtitle?: string;
  footerText?: string;
  type?: CardTypeEnum;
  favorite?: boolean;
  link: string;
  footerImage?: string;
  setAlertText: (arg: string, type: AlertTypes) => void;
  handleAddFavorite: (resource: any) => void;
  handleRemoveFavorite: (id: string) => void;
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
      if (resource.source === "fr.openent.mediacentre.source.GAR") {
        await addFavorite({ id: resource._id ?? resource.id ?? "", resource });
      } else {
        await addFavorite({ id: resource.id ?? resource._id ?? "", resource });
      }
      setAlertText(t("mediacentre.notification.addFavorite"), "success");
      handleAddFavorite(resource);
    } catch (e) {
      console.error(e);
    }
  };
  const unfav = async () => {
    try {
      if (resource.source === "fr.openent.mediacentre.source.GAR") {
        await removeFavorite({
          id: resource._id ?? resource.id ?? "",
          source: resource?.source ?? "",
        });
      } else {
        await removeFavorite({
          id: resource.id ?? resource._id ?? "",
          source: resource?.source ?? "",
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
        <a className="med-body" href={newLink !== "/" ? newLink : "/"}>
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
              {footerText}
            </div>
          ) : null}
          <div className="med-footer-svg">
            <Tooltip message={t("mediacentre.card.copy")} placement="top">
              <ContentCopyIcon className="med-link" onClick={() => copy()} />
            </Tooltip>
            {favorite ? (
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
            )}
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
        <a href={newLink !== "/" ? newLink : "/"} className="med-link-card">
          <Card.Title>{title}</Card.Title>
          <Card.Text>{subtitle}</Card.Text>
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
            {favorite ? (
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
            )}
          </div>
        </Card.Footer>
      </Card>
    );
  }
};
