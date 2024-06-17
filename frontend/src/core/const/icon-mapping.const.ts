import BookIcon from "@mui/icons-material/Book";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import ComputerIcon from "@mui/icons-material/Computer";
import FlagIcon from "@mui/icons-material/Flag";
import PersonIcon from "@mui/icons-material/Person";
import SchoolIcon from "@mui/icons-material/School";
import StarIcon from "@mui/icons-material/Star";
import StarsIcon from "@mui/icons-material/Stars";

import { ResourceDetailsEnum } from "../enum/resource-details.enum";
import { CardTypeEnum } from "~/core/enum/card-type.enum.ts";
import { SearchCardTypeEnum } from "~/core/enum/search-card-type.enum.ts";
export const IconMapping: { [key in string]: any } = {
  [CardTypeEnum.favorites]: StarIcon,
  [CardTypeEnum.manuals]: SchoolIcon,
  [CardTypeEnum.book_mark]: BookmarkIcon,
  [CardTypeEnum.pinned_resources]: FlagIcon,
  [SearchCardTypeEnum.external_resources]: ComputerIcon,
  [SearchCardTypeEnum.moodle]:
    "/mediacentre/public/img/fr.openent.mediacentre.source.Moodle.png",
  [ResourceDetailsEnum.authors]: PersonIcon,
  [ResourceDetailsEnum.editors]: PersonIcon,
  [ResourceDetailsEnum.disciplines]: SchoolIcon,
  [ResourceDetailsEnum.levels]: StarsIcon,
  [ResourceDetailsEnum.keywords]: BookIcon,
};
