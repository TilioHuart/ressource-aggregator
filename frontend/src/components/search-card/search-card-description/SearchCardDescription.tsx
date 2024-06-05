import "./SearchCardDescription.scss";
import { useTranslation } from "react-i18next";

import { SearchResource } from "~/model/SearchResource.model";

interface SearchCardDescriptionProps {
  searchResource: SearchResource;
}

export const SearchCardDescription: React.FC<SearchCardDescriptionProps> = ({
  searchResource,
}) => {
  const { t } = useTranslation();
  return (
    <div className="med-search-resource-description">
      <span className="med-search-resource-description-title">
        {t("mediacentre.description.title.description")}
      </span>
      <span className="med-search-resource-description-content">
        {searchResource.description}
      </span>
    </div>
  );
};
