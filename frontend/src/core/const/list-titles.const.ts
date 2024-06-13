import { CardTypeEnum } from "~/core/enum/card-type.enum.ts";

export const TitleListCard: { [key in string]: string } = {
  [CardTypeEnum.pinned_resources]: "mediacentre.list.card.pinned.resources",
  [CardTypeEnum.favorites]: "mediacentre.list.card.favorites",
  [CardTypeEnum.manuals]: "mediacentre.list.card.manuals",
  [CardTypeEnum.book_mark]: "mediacentre.list.card.book.mark",
  [CardTypeEnum.external_resources]: "mediacentre.sidebar.resources",
  [CardTypeEnum.moodle]: "fr.openent.mediacentre.source.Moodle",
};
