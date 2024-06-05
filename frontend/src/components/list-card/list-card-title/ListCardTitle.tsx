import "./ListCardTitle.scss";
import { useTranslation } from "react-i18next";

import { IconMapping } from "~/core/const/icon-mapping.const";
import { TitleListCard } from "~/core/const/list-titles.const";
import { CardTypeEnum } from "~/core/enum/card-type.enum";

interface ListCardTitleProps {
  type: CardTypeEnum;
}
export const ListCardTitle: React.FC<ListCardTitleProps> = ({ type }) => {
  const { t } = useTranslation();
  const IconComponent = IconMapping[type];

  return (
    <span className="title">
      <IconComponent className="icon" />
      {t(TitleListCard[type])}
    </span>
  );
};
