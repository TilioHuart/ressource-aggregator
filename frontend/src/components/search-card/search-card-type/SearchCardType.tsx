import "./SearchCardType.scss";
import { useTranslation } from "react-i18next";

import { IconMapping } from "~/core/const/icon-mapping.const";
import { SearchCardTitle } from "~/core/const/search-card-title.const";
import { SearchCardTypeEnum } from "~/core/enum/search-card-type.enum";

interface SearchCardTypeProps {
  type: SearchCardTypeEnum;
}

export const SearchCardType: React.FC<SearchCardTypeProps> = ({ type }) => {
  const { t } = useTranslation();
  const IconComponent = IconMapping[type];

  return (
    <span className="med-search-resource-type">
      {type === SearchCardTypeEnum.moodle ? (
        <img
          src={IconMapping[type]}
          alt={t(`mediacentre.advanced.name.moodle`)}
          className="med-search-resource-icon"
        />
      ) : (
        <IconComponent className="med-search-resource-icon" />
      )}
      {t(SearchCardTitle[type])}
    </span>
  );
};
