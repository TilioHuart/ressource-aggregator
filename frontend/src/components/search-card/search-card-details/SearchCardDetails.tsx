import "./SearchCardDetails.scss";
import React from "react";

import { useTranslation } from "react-i18next";

import { SearchCardDetail } from "../search-card-detail/SearchCardDetail";
import { ResourceDetailsEnum } from "~/core/enum/resource-details.enum";
import { SearchResource } from "~/model/SearchResource.model";

interface SearchCardDetailsProps {
  searchResource: SearchResource;
}
export const SearchCardDetails: React.FC<SearchCardDetailsProps> = ({
  searchResource,
}) => {
  const { t } = useTranslation();
  return (
    <div className="med-search-resource-details">
      <span className="med-search-resource-details-title">
        {t("mediacentre.description.title.details")}
      </span>
      <SearchCardDetail
        type={ResourceDetailsEnum.authors}
        list={searchResource.authors}
        separator={" / "}
      />
      <SearchCardDetail
        type={ResourceDetailsEnum.editors}
        list={searchResource.editors}
        separator={" / "}
      />
      <SearchCardDetail
        type={ResourceDetailsEnum.disciplines}
        list={searchResource.disciplines}
        separator={" / "}
      />
      <SearchCardDetail
        type={ResourceDetailsEnum.levels}
        list={searchResource.levels}
        separator={" / "}
      />
      <SearchCardDetail
        type={ResourceDetailsEnum.keywords}
        list={
          typeof searchResource.plain_text === "string"
            ? [searchResource.plain_text]
            : searchResource.plain_text
        }
        separator={" / "}
      />
    </div>
  );
};
