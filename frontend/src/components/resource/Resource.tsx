import React from "react";

import "./Resource.scss";
import { Card } from "@edifice-ui/react";
import LinkIcon from "@mui/icons-material/Link";
import PushPinIcon from "@mui/icons-material/PushPin";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";

interface ResourceProps {
  image: string;
  title: string;
  subtitle: string;
  size?: "small" | "medium";
  favorite?: boolean;
}

export const Resource: React.FC<ResourceProps> = ({
  image,
  title,
  subtitle,
  size = "medium",
  favorite = false,
}) => {
  const link = () => {
    console.log("link");
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

  return (
    <Card
      isSelectable={false}
      isClickable={false}
      className={`med-resource-card ${size}`}
    >
      <Card.Body space="8" flexDirection="column">
        <div className="med-resource-body-text">
          <Card.Text className="med-resource-card-text">{title}</Card.Text>
          <Card.Text className="text-black-50 med-resource-card-text">
            {subtitle}
          </Card.Text>
        </div>
        {image && (
          <img src={image} alt="Resource" className="med-resource-image" />
        )}
        <div className="med-resource-footer">
          <LinkIcon className="med-link" onClick={() => link()} />
          <PushPinIcon className="med-pin" onClick={() => pin()} />
          {favorite ? (
            <StarIcon className="med-star" onClick={() => unfav()} />
          ) : (
            <StarBorderIcon className="med-star" onClick={() => fav()} />
          )}
        </div>
      </Card.Body>
    </Card>
  );
};
