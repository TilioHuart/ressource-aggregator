import "./SearchCard.scss";
import React, { useState } from "react";

import { Card } from "@edifice-ui/react";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import PushPinIcon from "@mui/icons-material/PushPin";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import { useTranslation } from "react-i18next";

import { SearchCardDescription } from "./search-card-description/SearchCardDescription";
import { SearchCardDetails } from "./search-card-details/SearchCardDetails";
import { SearchCardType } from "./search-card-type/SearchCardType";
import { SearchCardTypeEnum } from "~/core/enum/search-card-type.enum";
import { SearchResource } from "~/model/SearchResource.model";

interface SearchResourceProps {
  searchResource: SearchResource;
}

export const SearchCard: React.FC<SearchResourceProps> = ({
  searchResource,
}) => {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);

  const type = (): SearchCardTypeEnum => {
    if (
      searchResource.document_types &&
      searchResource.document_types.length > 0
    ) {
      switch (searchResource.document_types[0]) {
        case "livre numerique":
          return SearchCardTypeEnum.manuals;
        case "Parcours Moodle":
          return SearchCardTypeEnum.moodle;
        case "Signet":
          return SearchCardTypeEnum.book_mark;
        case "site Web":
          return SearchCardTypeEnum.external_resources;
        default:
          return SearchCardTypeEnum.manuals;
      }
    } else {
      return SearchCardTypeEnum.manuals;
    }
  };

  const copy = () => {
    console.log("copy");
  };
  const pin = () => {
    console.log("pin");
  };
  const fav = () => {
    console.log("fav");
  };
  const unfav = () => {
    console.log("unfav");
  };

  const toggleExpand = () => {
    console.log("test");
    setIsExpanded(!isExpanded);
  };

  return (
    <Card
      isSelectable={false}
      isClickable={false}
      className={`med-search-resource-card ${
        isExpanded ? "expanded" : "not-expanded"
      }`}
    >
      <div className="med-search-resource-top-container">
        <div className="med-search-resource-left-container">
          {searchResource.image && (
            <img
              src={searchResource.image}
              alt="Resource"
              className="med-search-resource-image"
            />
          )}
        </div>
        <div className="med-search-resource-right-container">
          <Card.Body space={"0"}>
            <SearchCardType type={type()} />
            <Card.Title>{searchResource.title}</Card.Title>
            <Card.Text>
              {searchResource.editors && searchResource.editors[0]}
            </Card.Text>
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
              <PushPinIcon className="med-pin" onClick={() => pin()} />
              <ContentCopyIcon className="med-link" onClick={() => copy()} />
              {searchResource.favorite ? (
                <StarIcon className="med-star" onClick={() => unfav()} />
              ) : (
                <StarBorderIcon className="med-star" onClick={() => fav()} />
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
};
