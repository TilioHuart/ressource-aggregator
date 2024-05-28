import React, { useEffect, useState } from "react";

import "./Resource.scss";
import { Card } from "@edifice-ui/react";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import PushPinIcon from "@mui/icons-material/PushPin";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";

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
  setAlertText: (arg: string) => void;
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
  setAlertText,
}) => {
  const [newLink, setNewLink] = useState<string>("");
  const copy = () => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(link);
    } else {
      console.error("Clipboard not available");
    }
    setAlertText("Le lien a bien été copié dans le presse-papier.");
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

  if (type === ListCardTypeEnum.book_mark) {
    return (
      <Card
        isSelectable={false}
        isClickable={false}
        className={`med-resource-card ${type}`}
      >
        <a className="med-body" href={newLink !== "/" ? newLink : "/"}>
          <Card.Body space={"0"}>
            {image && (
              <img src={image} alt="Resource" className="med-resource-image" />
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
                  currentTarget.src = "/img/no-avatar.svg";
                }}
              />
              {footerText}
            </div>
          ) : null}
          <div className="med-footer-svg">
            <PushPinIcon className="med-pin" onClick={() => pin()} />
            <ContentCopyIcon className="med-link" onClick={() => copy()} />
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
        <a href={newLink !== "/" ? newLink : "/"} className="med-link-card">
          <Card.Title>{title}</Card.Title>
          <Card.Text>{subtitle}</Card.Text>
          <Card.Body space={"0"}>
            {image && (
              <img src={image} alt="Resource" className="med-resource-image" />
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
            <PushPinIcon className="med-pin" onClick={() => pin()} />
            <ContentCopyIcon className="med-link" onClick={() => copy()} />
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
