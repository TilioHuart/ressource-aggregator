import React from "react";

import { Card, Tooltip } from "@edifice-ui/react";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import PushPinIcon from "@mui/icons-material/PushPin";
import { useTranslation } from "react-i18next";

import { PinResource } from "~/model/PinResource.model";

import "./PinsCarouselCard.scss";

interface PinsCarouselCardProps {
  pin: PinResource;
}

export const PinsCarouselCard: React.FC<PinsCarouselCardProps> = ({ pin }) => {
  const { t } = useTranslation();
  return (
    <Card isClickable={false} isSelectable={false} className="med-pin-card">
      <Card.Title>{pin.pinned_title}</Card.Title>
      <Card.Text>{pin.pinned_description}</Card.Text>
      <Card.Body space={"0"}>
        {pin.image ? (
          <img
            src={pin.image}
            alt={pin.pinned_title}
            className="med-pin-image"
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
            className="med-pin-image"
          />
        )}
      </Card.Body>
      <Card.Footer>
        <div className="med-left-footer">
          <AutoAwesomeIcon />
          <span className="med-text-footer">
            {t("mediacentre.card.offered.by.the.region")}
          </span>
        </div>
        <div className="med-footer-svg">
          <Tooltip message={t("mediacentre.card.copy")} placement="top">
            <PushPinIcon className="med-pin" onClick={() => {}} />
          </Tooltip>
          <Tooltip message={t("mediacentre.card.copy")} placement="top">
            <ContentCopyIcon className="med-link" onClick={() => {}} />
          </Tooltip>
        </div>
      </Card.Footer>
    </Card>
  );
};
