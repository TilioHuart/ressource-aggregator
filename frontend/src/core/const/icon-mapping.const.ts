import BookmarkIcon from "@mui/icons-material/Bookmark";
import FlagIcon from "@mui/icons-material/Flag";
import SchoolIcon from "@mui/icons-material/School";
import StarIcon from "@mui/icons-material/Star";

import { ListCardTypeEnum } from "~/core/enum/list-card-type.enum.ts";

export const IconMapping = {
  [ListCardTypeEnum.favorites]: StarIcon,
  [ListCardTypeEnum.manuals]: SchoolIcon,
  [ListCardTypeEnum.book_mark]: BookmarkIcon,
  [ListCardTypeEnum.pinned_resources]: FlagIcon,
};
