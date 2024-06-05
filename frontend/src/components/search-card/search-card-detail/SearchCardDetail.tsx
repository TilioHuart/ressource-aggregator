import "./SearchCardDetail.scss";
import { useTranslation } from "react-i18next";

import { IconMapping } from "~/core/const/icon-mapping.const";
import { ResourceDetailsEnum } from "~/core/enum/resource-details.enum";

interface SearchCardDetailProps {
  type: ResourceDetailsEnum;
  list: string[] | undefined;
  separator: string;
}

export const SearchCardDetail: React.FC<SearchCardDetailProps> = ({
  type,
  list,
  separator,
}) => {
  const { t } = useTranslation();
  const IconComponent = IconMapping[type];
  const name = list && list.length > 1 ? type + "s" : type;
  return (
    <div className="med-search-resource-details-content">
      {IconComponent && (
        <IconComponent className="med-search-resource-details-icon" />
      )}
      <span className="med-search-resource-details-name">
        {t(`mediacentre.description.name.${name}`)}
      </span>
      <span className="med-search-resource-details-value">
        {list &&
          list.map((item, index) => {
            return (
              <span>
                {<strong>{item}</strong>}
                {index < list.length - 1 && separator}
              </span>
            );
          })}
      </span>
    </div>
  );
};
