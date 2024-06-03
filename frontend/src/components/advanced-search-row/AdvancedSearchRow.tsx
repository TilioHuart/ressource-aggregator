import React from "react";

import { Grid } from "@edifice-ui/react";
import { useTranslation } from "react-i18next";

import { AdvancedSearchCheckbox } from "~/components/advanced-search-checkbox/AdvancedSearchCheckbox.tsx";
import { AdvancedSearchInput } from "~/components/advanced-search-input/AdvancedSearchInput.tsx";
import { AdvancedSearchSelect } from "~/components/advanced-search-select/AdvancedSearchSelect.tsx";
import { AdvancedSearchSourcesEnum } from "~/core/enum/advanced-search-sources.enum";
import { AdvancedSearchEnum } from "~/core/enum/advanced-search.enum";
import { advancedSearchComparator } from "~/model/AdvancedSearchComparator";
import { advancedSearchInput } from "~/model/AdvancedSearchInput";

interface AdvancedSearchRowProps {
  type: AdvancedSearchEnum;
  enumComparators: advancedSearchComparator;
  setEnumComparators: (value: advancedSearchComparator) => void;
  enumInputValues: advancedSearchInput;
  setEnumInputValues: (value: advancedSearchInput) => void;
  enumCheckbox: { [key in AdvancedSearchSourcesEnum]: boolean };
  setEnumCheckbox: (value: {
    [key in AdvancedSearchSourcesEnum]: boolean;
  }) => void;
}

export const AdvancedSearchRow: React.FC<AdvancedSearchRowProps> = ({
  type,
  enumComparators,
  setEnumComparators,
  enumInputValues,
  setEnumInputValues,
  enumCheckbox,
  setEnumCheckbox,
}) => {
  const { t } = useTranslation();
  return (
    <Grid>
      <div className="med-left-col-advanced-search">
        <AdvancedSearchSelect
          type={type}
          enumComparators={enumComparators}
          setEnumComparators={setEnumComparators}
        />
      </div>
      <div className="med-right-col-advanced-search">
        <div className="med-title-advanced-search">
          {t(`mediacentre.advanced.name.${type}`) + " :"}
        </div>
        {type === AdvancedSearchEnum.source ? (
          <div className="med-source-advanced-search">
            <AdvancedSearchCheckbox
              type={AdvancedSearchSourcesEnum.GAR}
              enumCheckbox={enumCheckbox}
              setEnumCheckbox={setEnumCheckbox}
            />
            <AdvancedSearchCheckbox
              type={AdvancedSearchSourcesEnum.Moodle}
              enumCheckbox={enumCheckbox}
              setEnumCheckbox={setEnumCheckbox}
            />
            <AdvancedSearchCheckbox
              type={AdvancedSearchSourcesEnum.Signet}
              enumCheckbox={enumCheckbox}
              setEnumCheckbox={setEnumCheckbox}
            />
          </div>
        ) : (
          <AdvancedSearchInput
            type={type}
            enumInputValues={enumInputValues}
            setEnumInputValues={setEnumInputValues}
          />
        )}
      </div>
    </Grid>
  );
};
