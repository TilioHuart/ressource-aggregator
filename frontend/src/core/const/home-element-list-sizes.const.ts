import { ListCardTypeEnum } from "~/core/enum/list-card-type.enum.ts";
import { ElementSize } from "~/model/ElementSize.ts";

export const NbColumnsListCard = {
  [ListCardTypeEnum.pinned_resources]: new ElementSize(2, 3, 4, 4),
  [ListCardTypeEnum.favorites]: new ElementSize(3, 4, 6, 2),
  [ListCardTypeEnum.manuals]: new ElementSize(3, 2, 2, 2),
  [ListCardTypeEnum.book_mark]: new ElementSize(2, 2, 2, 2),
};

export const NbComponentsListCard = {
  [ListCardTypeEnum.pinned_resources]: new ElementSize(2, 3, 4, 4),
  [ListCardTypeEnum.favorites]: new ElementSize(3, 4, 6, 8),
  [ListCardTypeEnum.manuals]: new ElementSize(3, 4, 4, 4),
  [ListCardTypeEnum.book_mark]: new ElementSize(2, 6, 6, 6),
};
