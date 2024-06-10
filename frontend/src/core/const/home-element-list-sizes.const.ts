import { CardTypeEnum } from "~/core/enum/card-type.enum.ts";
import { ElementSize } from "~/model/ElementSize.ts";

export const NbColumnsListCard: { [key: string]: ElementSize } = {
  [CardTypeEnum.pinned_resources]: new ElementSize(2, 3, 4, 4),
  [CardTypeEnum.favorites]: new ElementSize(3, 4, 6, 2),
  [CardTypeEnum.manuals]: new ElementSize(3, 2, 2, 2),
  [CardTypeEnum.book_mark]: new ElementSize(2, 2, 2, 2),
  [CardTypeEnum.search]: new ElementSize(1, 1, 1, 2),
};

export const NbComponentsListCard: { [key: string]: ElementSize } = {
  [CardTypeEnum.pinned_resources]: new ElementSize(2, 3, 4, 4),
  [CardTypeEnum.favorites]: new ElementSize(3, 4, 6, 8),
  [CardTypeEnum.manuals]: new ElementSize(3, 4, 4, 6),
  [CardTypeEnum.book_mark]: new ElementSize(2, 6, 6, 8),
  [CardTypeEnum.search]: new ElementSize(-1, -1, -1, -1),
};
