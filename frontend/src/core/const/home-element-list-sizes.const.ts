import { ListCardTypeEnum } from "~/core/enum/list-card-type.enum.ts";
import { ElementSize } from "~/model/elementSize.tsx";

export const NbColumnsListCard = {
  [ListCardTypeEnum.pinned_resources]: new ElementSize(3, 4, 5, 4),
  [ListCardTypeEnum.favorites]: new ElementSize(3, 4, 5, 2),
  [ListCardTypeEnum.manuals]: new ElementSize(3, 2, 2, 2),
  [ListCardTypeEnum.util_links]: new ElementSize(3, 2, 2, 2),
};

export const NbComponentsListCard = {
  [ListCardTypeEnum.pinned_resources]: new ElementSize(3, 4, 5, 4),
  [ListCardTypeEnum.favorites]: new ElementSize(3, 4, 5, 8),
  [ListCardTypeEnum.manuals]: new ElementSize(3, 4, 4, 4),
  [ListCardTypeEnum.util_links]: new ElementSize(3, 4, 4, 4),
};

export const TitleListCard = {
  [ListCardTypeEnum.pinned_resources]: "Découvrez ces ressources !",
  [ListCardTypeEnum.favorites]: "Mes favoris",
  [ListCardTypeEnum.manuals]: "Mes manuels",
  [ListCardTypeEnum.util_links]: "Mes liens utiles",
};
