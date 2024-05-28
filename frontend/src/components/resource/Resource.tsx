import React from "react";

import "./Resource.scss";
import { Card } from "@edifice-ui/react";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import LinkIcon from "@mui/icons-material/Link";
import PushPinIcon from "@mui/icons-material/PushPin";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import { useNavigate } from "react-router-dom";

import { ListCardTypeEnum } from "~/core/enum/list-card-type.enum";

interface ResourceProps {
  image: string;
  title: string;
  subtitle?: string;
  footerText?: string;
  type?: ListCardTypeEnum;
  favorite?: boolean;
  link: string;
  footerImage?: string;
}

export const Resource: React.FC<ResourceProps> = ({
  image,
  title,
  subtitle,
  footerText,
  type = ListCardTypeEnum.favorites,
  favorite = false,
  link,
  footerImage,
}) => {
  const navigate = useNavigate();
  const redirectLink = () => {
    return navigate(link);
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

  if (type === ListCardTypeEnum.book_mark) {
    return (
      <Card
        isSelectable={false}
        isClickable={false}
        className={`med-resource-card ${type}`}
      >
        <div className="med-body">
          <Card.Body space={"0"}>
            {image && (
              <img src={image} alt="Resource" className="med-resource-image" />
            )}
          </Card.Body>
          <div className="med-text-body">
            <Card.Title>{title}</Card.Title>
            <Card.Text>{subtitle}</Card.Text>
          </div>
        </div>
        <Card.Footer>
          {footerText ? (
            <div className="med-footer-text">
              <img
                src={footerImage}
                alt="Resource"
                className="med-resource-footer-image"
                onError={({ currentTarget }) => {
                  currentTarget.onerror = null;
                  currentTarget.src = "/img/no-avatar.svg";
                }}
              />
              {footerText}
            </div>
          ) : null}
          <div className="med-footer-svg">
            <LinkIcon className="med-link" onClick={() => redirectLink()} />
            <PushPinIcon className="med-pin" onClick={() => pin()} />
            {favorite ? (
              <StarIcon className="med-star" onClick={() => unfav()} />
            ) : (
              <StarBorderIcon className="med-star" onClick={() => fav()} />
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
        <Card.Title>{title}</Card.Title>
        <Card.Text>{subtitle}</Card.Text>
        <Card.Body space={"0"}>
          {image && (
            <img src={image} alt="Resource" className="med-resource-image" />
          )}
        </Card.Body>
        <Card.Footer>
          {footerText ? (
            <div className="med-footer-text">
              <AutoAwesomeIcon />
              {footerText}
            </div>
          ) : null}
          <div className="med-footer-svg">
            <LinkIcon className="med-link" onClick={() => redirectLink()} />
            <PushPinIcon className="med-pin" onClick={() => pin()} />
            {favorite ? (
              <StarIcon className="med-star" onClick={() => unfav()} />
            ) : (
              <StarBorderIcon className="med-star" onClick={() => fav()} />
            )}
          </div>
        </Card.Footer>
      </Card>
    );
  }
};
