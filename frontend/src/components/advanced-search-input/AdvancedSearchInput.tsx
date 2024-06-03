import React from "react";

import { FormControl, Input } from "@edifice-ui/react";
import { useTranslation } from "react-i18next";

import { AdvancedSearchEnum } from "~/core/enum/advanced-search.enum";
import { advancedSearchInput } from "~/model/AdvancedSearchInput";

interface InputAdvancedSearchProps {
  type: AdvancedSearchEnum;
  enumInputValues: advancedSearchInput;
  setEnumInputValues: (value: advancedSearchInput) => void;
}

export const AdvancedSearchInput: React.FC<InputAdvancedSearchProps> = ({
  type,
  enumInputValues,
  setEnumInputValues,
}) => {
  const { t } = useTranslation();
  return (
    <div className="med-input-advanced-search">
      <FormControl id={`input-${type}`}>
        <Input
          placeholder={t(`mediacentre.advanced.placeholder.${type}`)}
          size="md"
          type="text"
          onChange={(e) =>
            setEnumInputValues({
              ...enumInputValues,
              [type]: e.target.value,
            })
          }
        />
      </FormControl>
    </div>
  );
};
