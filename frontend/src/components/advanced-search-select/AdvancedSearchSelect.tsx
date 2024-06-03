import React from "react";

import { Select } from "@edifice-ui/react";

import { AdvancedSearchEnum } from "~/core/enum/advanced-search.enum";
import { advancedSearchComparator } from "~/model/AdvancedSearchComparator";

interface SelectAdvancedSearchProps {
  type: AdvancedSearchEnum;
  enumComparators: advancedSearchComparator;
  setEnumComparators: (value: advancedSearchComparator) => void;
}

export const AdvancedSearchSelect: React.FC<SelectAdvancedSearchProps> = ({
  type,
  enumComparators,
  setEnumComparators,
}) => {
  const shouldRenderSelect =
    type !== AdvancedSearchEnum.source && type !== AdvancedSearchEnum.title;

  return shouldRenderSelect ? (
    <div className="med-selector-advanced-search">
      <Select
        onValueChange={(value) =>
          setEnumComparators({ ...enumComparators, [type]: value })
        }
        options={[
          { label: "OU", value: "$or" },
          { label: "ET", value: "$and" },
        ]}
        placeholderOption="OU"
      />
    </div>
  ) : (
    <div className="med-selector-advanced-search"></div>
  );
};
