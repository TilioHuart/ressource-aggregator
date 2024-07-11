import { Card } from "@edifice-ui/react";

import { IconMapping } from "~/core/const/icon-mapping.const";
import { CardTypeEnum } from "~/core/enum/card-type.enum";
import { SearchCardTypeEnum } from "~/core/enum/search-card-type.enum";
import { ExternalResource } from "~/model/ExternalResource.model";
import { Favorite } from "~/model/Favorite.model";
import { GlobalResource } from "~/model/GlobalResource.model";
import { Signet } from "~/model/Signet.model";
import { Textbook } from "~/model/Textbook.model";

import "./ResourceTitle.scss";

interface ResourceTitleProps {
  type: CardTypeEnum;
  title: string;
  resource: Signet | Favorite | Textbook | ExternalResource | GlobalResource;
}

export const ResourceTitle: React.FC<ResourceTitleProps> = ({
  type,
  title,
  resource,
}) => {
  const isFavorite = type === CardTypeEnum.favorites;
  const getIconComponent = () => {
    if (resource.source === "fr.openent.mediacentre.source.GAR") {
      if (resource?.is_textbook ?? false) {
        return IconMapping[CardTypeEnum.manuals];
      }
      return IconMapping[SearchCardTypeEnum.external_resources];
    }
    if (resource.source === "fr.openent.mediacentre.source.Signet") {
      return IconMapping[SearchCardTypeEnum.book_mark];
    }
  };

  const IconComponent = getIconComponent();

  return (
    <Card.Title>
      {isFavorite &&
        (resource.source === "fr.openent.mediacentre.source.Moodle" ? (
          <img
            src={IconMapping[SearchCardTypeEnum.moodle]}
            alt={"mooodle"}
            className="med-fav-title-icon"
          />
        ) : (
          <IconComponent className="med-fav-title-icon" />
        ))}
      {title}
    </Card.Title>
  );
};
