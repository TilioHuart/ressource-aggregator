import React, { useEffect, useState } from "react";

import {
  AlertTypes,
  Card,
  isActionAvailable,
  Tooltip,
  useUser,
} from "@edifice-ui/react";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import PushPinIcon from "@mui/icons-material/PushPin";
import { useTranslation } from "react-i18next";

import { Pin } from "~/model/Pin.model";
import { useAlertProvider } from "~/providers/AlertProvider";
import { useModalProvider } from "~/providers/ModalsProvider";
import "./PinsCarouselCard.scss";
import { useActions } from "~/services/queries";

interface PinsCarouselCardProps {
  pin: Pin;
  link: string;
}

export const PinsCarouselCard: React.FC<PinsCarouselCardProps> = ({
  pin,
  link,
}) => {
  const [newLink, setNewLink] = useState<string>("");
  const { setAlertText, setAlertType } = useAlertProvider();
  const { setModalResource, setIsEditOpen } = useModalProvider();
  const { user } = useUser();

  // used to check if the user has the right to pin a resource
  const { data: actions } = useActions();
  const idStructure =
    (user?.structures && user.structures.length > 0
      ? user?.structures[0]
      : "") ?? "";
  const hasPinRight =
    isActionAvailable("pins", actions) && idStructure === pin.structure_owner;

  const { t } = useTranslation();

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

  const edit = () => {
    setModalResource(pin);
    setIsEditOpen(true);
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

  return (
    <Card isClickable={false} isSelectable={false} className="med-pin-card">
      <a
        className="med-link-card-pin"
        href={newLink !== "/" ? newLink : "/"}
        target="_blank"
      >
        <Card.Title>{pin.pinned_title}</Card.Title>
        <Card.Body space={"0"}>
          <span className="med-pin-description">{pin.pinned_description}</span>
          <div className="med-pin-image-container">
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
          </div>
        </Card.Body>
      </a>
      <Card.Footer>
        <div className="med-left-footer">
          <AutoAwesomeIcon />
          <span className="med-text-footer">
            {t("mediacentre.card.offered.by.the.region")}
          </span>
        </div>
        <div className="med-footer-svg">
          {hasPinRight && (
            <Tooltip message={t("mediacentre.card.edit.pin")} placement="top">
              <PushPinIcon className="med-pin" onClick={() => edit()} />
            </Tooltip>
          )}
          <Tooltip message={t("mediacentre.card.copy")} placement="top">
            <ContentCopyIcon className="med-link" onClick={() => copy()} />
          </Tooltip>
        </div>
      </Card.Footer>
    </Card>
  );
};
