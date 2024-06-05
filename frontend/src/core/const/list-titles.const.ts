import { CardTypeEnum } from "~/core/enum/card-type.enum.ts";
import { SearchCardTypeEnum } from "~/core/enum/search-card-type.enum";

export const TitleListCard: { [key in string]: string } = {
  [CardTypeEnum.pinned_resources]: "mediacentre.list.card.pinned.resources",
  [CardTypeEnum.favorites]: "mediacentre.list.card.favorites",
  [CardTypeEnum.manuals]: "mediacentre.list.card.manuals",
  [CardTypeEnum.book_mark]: "mediacentre.list.card.book.mark",

  [SearchCardTypeEnum.external_resources]: "mediacentre.sidebar.resource",
  [SearchCardTypeEnum.moodle]: "fr.openent.mediacentre.source.Moodle",
};
