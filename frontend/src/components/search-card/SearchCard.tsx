import "./SearchCard.scss";
import React, { useEffect, useState } from "react";

import { AlertTypes, Card, Tooltip } from "@edifice-ui/react";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import { useTranslation } from "react-i18next";

import { SearchCardDescription } from "./search-card-description/SearchCardDescription";
import { SearchCardDetails } from "./search-card-details/SearchCardDetails";
import { SearchCardType } from "./search-card-type/SearchCardType";
import { SearchCardTypeEnum } from "~/core/enum/search-card-type.enum";
import { SearchResource } from "~/model/SearchResource.model";
import {
  useAddFavoriteMutation,
  useRemoveFavoriteMutation,
} from "~/services/api/favorite.service";

interface SearchResourceProps {
  searchResource: SearchResource;
  link: string;
  setAlertText: (arg: string, type: AlertTypes) => void;
  refetchSearch: () => void;
}

export const SearchCard: React.FC<SearchResourceProps> = ({
  searchResource,
  link,
  setAlertText,
  refetchSearch,
}) => {
  const [newLink, setNewLink] = useState<string>("");
  const { t } = useTranslation();
  const [addFavorite] = useAddFavoriteMutation();
  const [isFavorite, setIsFavorite] = useState<boolean>(
    searchResource?.favorite ?? false,
  );
  const [removeFavorite] = useRemoveFavoriteMutation();
  const [isExpanded, setIsExpanded] = useState(false);
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

  const type = (): SearchCardTypeEnum => {
    if (searchResource?.source) {
      switch (searchResource.source) {
        case "fr.openent.mediacentre.source.Moodle":
          return SearchCardTypeEnum.moodle;
        case "fr.openent.mediacentre.source.Signet":
          return SearchCardTypeEnum.book_mark;
        case "fr.openent.mediacentre.source.GAR":
          if (searchResource?.document_types?.includes("livre numérique")) {
            return SearchCardTypeEnum.manuals;
          }
          return SearchCardTypeEnum.external_resources;
        default:
          return SearchCardTypeEnum.manuals;
      }
    } else {
      return SearchCardTypeEnum.manuals;
    }
  };

  const copy = () => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(
        searchResource?.link ?? searchResource?.url ?? "",
      );
      setAlertText(t("mediacentre.notification.copy"), "success");
    } else {
      console.error("Clipboard not available");
    }
  };

  const fav = async () => {
    try {
      if (
        searchResource.source === "fr.openent.mediacentre.source.Signet" ||
        searchResource.source === "fr.openent.mediacentre.source.GlobalResource"
      ) {
        const newId = searchResource.id
          ? parseInt(searchResource.id.toString())
          : searchResource.id;
        const newSearchResource = {
          ...searchResource,
          id: newId,
        };
        await addFavorite({
          id: newId,
          resource: newSearchResource,
        });
      } else {
        await addFavorite({
          id: searchResource._id,
          resource: searchResource,
        });
      }
      setAlertText(t("mediacentre.notification.addFavorite"), "success");
      refetchSearch();
      setIsFavorite(true);
    } catch (e) {
      console.error(e);
    }
  };

  const unfav = async () => {
    try {
      if (
        searchResource.source === "fr.openent.mediacentre.source.Signet" ||
        searchResource.source === "fr.openent.mediacentre.source.GlobalResource"
      ) {
        const newId = searchResource.id
          ? parseInt(searchResource.id.toString())
          : searchResource.id;
        await removeFavorite({
          id: newId,
          source: searchResource?.source,
        });
      } else {
        await removeFavorite({
          id: searchResource.favoriteId ?? searchResource._id,
          source: searchResource?.source,
        });
      }
      setAlertText(t("mediacentre.notification.removeFavorite"), "success");
      refetchSearch();
      setIsFavorite(false);
    } catch (e) {
      console.error(e);
    }
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
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

  // case of large screen
  if (windowWidth > 480) {
    return (
      <Card
        isSelectable={false}
        isClickable={false}
        className={`med-search-resource-card ${
          isExpanded ? "expanded" : "not-expanded"
        }`}
      >
        <div className="med-search-resource-top-container">
          <a href={newLink !== "/" ? newLink : "/"} target="_blank">
            <div className="med-search-resource-left-container">
              {searchResource.image && (
                <img
                  src={searchResource.image}
                  alt="Resource"
                  className="med-search-resource-image"
                  onError={({ currentTarget }) => {
                    currentTarget.onerror = null;
                    currentTarget.src = "/mediacentre/public/img/no-avatar.svg";
                  }}
                />
              )}
            </div>
          </a>
          <div className="med-search-resource-right-container">
            <Card.Body space={"0"}>
              <a href={newLink !== "/" ? newLink : "/"} target="_blank">
                <SearchCardType type={type()} />
                <Card.Title>{searchResource.title}</Card.Title>
                <Card.Text>
                  {searchResource.editors && searchResource.editors[0]}
                </Card.Text>
              </a>
            </Card.Body>
            <Card.Footer>
              <div
                className="med-footer-details"
                role="button"
                onClick={toggleExpand}
                onKeyDown={() => {}}
                tabIndex={0}
              >
                <InfoOutlinedIcon className="med-footer-icon" />
                {t("mediacentre.description.button")}
                {isExpanded ? (
                  <KeyboardArrowDownIcon className="med-footer-icon" />
                ) : (
                  <KeyboardArrowRight className="med-footer-icon" />
                )}
              </div>
              <div className="med-footer-svg">
                <Tooltip message={t("mediacentre.card.copy")} placement="top">
                  <ContentCopyIcon
                    className="med-link"
                    onClick={() => copy()}
                  />
                </Tooltip>
                {searchResource.source !=
                "fr.openent.mediacentre.source.GlobalResource" ? (
                  isFavorite ? (
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
                      <StarBorderIcon
                        className="med-star"
                        onClick={() => fav()}
                      />
                    </Tooltip>
                  )
                ) : null}
              </div>
            </Card.Footer>
          </div>
        </div>
        <div className={`med-search-resource-bottom-container`}>
          {searchResource.description && (
            <SearchCardDescription searchResource={searchResource} />
          )}
          <SearchCardDetails searchResource={searchResource} />
        </div>
      </Card>
    );
  }
  //case of mobile screen
  else {
    return (
      <Card
        isSelectable={false}
        isClickable={false}
        className={`med-search-resource-card ${
          isExpanded ? "expanded" : "not-expanded"
        }`}
      >
        <div className="med-search-resource-top-container">
          <a href={newLink !== "/" ? newLink : "/"} target="_blank">
            <div className="med-search-resource-left-container">
              {searchResource.image && (
                <img
                  src={searchResource.image}
                  alt="Resource"
                  className="med-search-resource-image"
                  onError={({ currentTarget }) => {
                    currentTarget.onerror = null;
                    currentTarget.src = "/mediacentre/public/img/no-avatar.svg";
                  }}
                />
              )}
            </div>
          </a>
          <div className="med-search-resource-right-container">
            <Card.Body space={"0"}>
              <a href={newLink !== "/" ? newLink : "/"} target="_blank">
                <SearchCardType type={type()} />
                <Card.Title>{searchResource.title}</Card.Title>
                <Card.Text>
                  {searchResource.editors && searchResource.editors[0]}
                </Card.Text>
              </a>
            </Card.Body>
            <Card.Footer>
              <div className="med-footer-svg">
                <Tooltip message={t("mediacentre.card.copy")} placement="top">
                  <ContentCopyIcon
                    className="med-link"
                    onClick={() => copy()}
                  />
                </Tooltip>
                {searchResource.source !=
                "fr.openent.mediacentre.source.GlobalResource" ? (
                  isFavorite ? (
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
                      <StarBorderIcon
                        className="med-star"
                        onClick={() => fav()}
                      />
                    </Tooltip>
                  )
                ) : null}
              </div>
              <div
                className="med-footer-details"
                role="button"
                onClick={toggleExpand}
                onKeyDown={() => {}}
                tabIndex={0}
              >
                {/* <InfoOutlinedIcon className="med-footer-icon" /> */}
                {t("mediacentre.description.button")}
                {isExpanded ? (
                  <KeyboardArrowDownIcon className="med-footer-icon" />
                ) : (
                  <KeyboardArrowRight className="med-footer-icon" />
                )}
              </div>
            </Card.Footer>
          </div>
        </div>
        <div className={`med-search-resource-bottom-container`}>
          {searchResource.description && (
            <SearchCardDescription searchResource={searchResource} />
          )}
          <SearchCardDetails searchResource={searchResource} />
        </div>
      </Card>
    );
  }
};
