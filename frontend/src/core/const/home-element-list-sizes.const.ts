import { ListCardTypeEnum } from "~/core/enum/list-card-type.enum.ts";
import { ElementSize } from "~/model/elementSize.tsx";

export const NbColumnsListCard = {
  [ListCardTypeEnum.favorites]: new ElementSize(1, 2, 3),
  [ListCardTypeEnum.manuals]: new ElementSize(2, 4, 6),
  [ListCardTypeEnum.util_links]: new ElementSize(2, 4, 6),
};

export const NbComponentsListCard = {
  [ListCardTypeEnum.favorites]: new ElementSize(3, 6, 9),
  [ListCardTypeEnum.manuals]: new ElementSize(4, 4, 6),
  [ListCardTypeEnum.util_links]: new ElementSize(4, 4, 6),
};

export const TitleListCard = {
  [ListCardTypeEnum.favorites]: "Mes favoris",
  [ListCardTypeEnum.manuals]: "Mes manuels",
  [ListCardTypeEnum.util_links]: "Mes liens utiles",
};
