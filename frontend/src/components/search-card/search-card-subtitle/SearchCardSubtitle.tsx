import { Card } from "@edifice-ui/react";
import { useTranslation } from "react-i18next";

import { SearchCardTypeEnum } from "~/core/enum/search-card-type.enum";
import { SearchResource } from "~/model/SearchResource.model";

interface SearchCardSubtitleProps {
  type: SearchCardTypeEnum;
  searchResource: SearchResource;
}

export const SearchCardSubtitle: React.FC<SearchCardSubtitleProps> = ({
  type,
  searchResource,
}) => {
  const { t } = useTranslation();

  const getSubtitle = () => {
    switch (type) {
      case SearchCardTypeEnum.book_mark:
        if (
          searchResource?.document_types?.some((type) =>
            type.toLowerCase().includes("orientation"),
          ) ||
          searchResource?.orientation
        ) {
          return t("mediacentre.search.card.orientation");
        }
        return "";
      case SearchCardTypeEnum.manuals:
        return searchResource?.editors?.join(", ");
      case SearchCardTypeEnum.external_resources:
        return searchResource?.document_types?.join(", ");
      default:
        return "";
    }
  };

  return <Card.Text>{getSubtitle()}</Card.Text>;
};
