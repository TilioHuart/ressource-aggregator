import React from "react";

import { Checkbox } from "@edifice-ui/react";
import { useTranslation } from "react-i18next";

import GAR from "~/../public/img/fr.openent.mediacentre.source.GAR.png";
import Moodle from "~/../public/img/fr.openent.mediacentre.source.Moodle.png";
import Signet from "~/../public/img/fr.openent.mediacentre.source.Signet.png";
import { AdvancedSearchSourcesEnum } from "~/core/enum/advanced-search-sources.enum";

interface CheckboxAdvancedSearchProps {
  type: AdvancedSearchSourcesEnum;
  enumCheckbox: { [key in AdvancedSearchSourcesEnum]: boolean };
  setEnumCheckbox: (value: {
    [key in AdvancedSearchSourcesEnum]: boolean;
  }) => void;
}

export const AdvancedSearchCheckbox: React.FC<CheckboxAdvancedSearchProps> = ({
  type,
  enumCheckbox,
  setEnumCheckbox,
}) => {
  const { t } = useTranslation();
  const images = {
    [AdvancedSearchSourcesEnum.GAR]: GAR,
    [AdvancedSearchSourcesEnum.Moodle]: Moodle,
    [AdvancedSearchSourcesEnum.Signet]: Signet,
  };

  return (
    <div className="med-checkbox-container-advanced-search">
      <img
        src={images[type]}
        alt={t(`mediacentre.advanced.name.${type}`)}
        className="image"
      />
      <Checkbox
        checked={enumCheckbox[type]}
        onChange={(e) =>
          setEnumCheckbox({ ...enumCheckbox, [type]: e.target.checked })
        }
      />
    </div>
  );
};
