import React from "react";

import {
  Button,
  Checkbox,
  FormControl,
  Grid,
  Input,
  Modal,
  Select,
} from "@edifice-ui/react";
import { useTranslation } from "react-i18next";
import "./AdvancedSearch.scss";
import { useNavigate } from "react-router-dom";

import GAR from "~/../public/img/fr.openent.mediacentre.source.GAR.png";
import Moodle from "~/../public/img/fr.openent.mediacentre.source.Moodle.png";
import Signet from "~/../public/img/fr.openent.mediacentre.source.Signet.png";
import { AdvancedSearchSourcesEnum } from "~/core/enum/advanced-search-sources.enum";
import { AdvancedSearchEnum } from "~/core/enum/advanced-search.enum";
import {
  createEmptyAdvancedSearchData,
  addFieldData,
  toJson,
  generateAdvancedSearchParam,
  isAdvancedSearchData,
} from "~/services/utils/advancedSearch.service";
import { createEmptyFieldData } from "~/services/utils/fieldData.service";

interface AdvancedSearchProps {
  isModalOpen: boolean;
  setIsModalOpen: (value: boolean) => void;
}

type checkbox = {
  [key in AdvancedSearchSourcesEnum]: boolean;
};

type comparators = {
  [key in AdvancedSearchEnum]?: "$or" | "$and";
};

type inputValues = {
  [key in AdvancedSearchEnum]?: string;
};

export const AdvancedSearch: React.FC<AdvancedSearchProps> = ({
  isModalOpen,
  setIsModalOpen,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [enumCheckbox, setEnumCheckbox] = React.useState<checkbox>({
    [AdvancedSearchSourcesEnum.GAR]: true,
    [AdvancedSearchSourcesEnum.Moodle]: true,
    [AdvancedSearchSourcesEnum.Signet]: true,
  });

  const [enumComparators, setEnumComparators] = React.useState<comparators>({
    [AdvancedSearchEnum.author]: "$or",
    [AdvancedSearchEnum.editor]: "$or",
    [AdvancedSearchEnum.discipline]: "$or",
    [AdvancedSearchEnum.level]: "$or",
  });

  const [enumInputValues, setEnumInputValues] = React.useState<inputValues>({
    [AdvancedSearchEnum.title]: "",
    [AdvancedSearchEnum.author]: "",
    [AdvancedSearchEnum.editor]: "",
    [AdvancedSearchEnum.discipline]: "",
    [AdvancedSearchEnum.level]: "",
  });

  const allInputsAreEmpty = () => {
    return Object.values(enumInputValues).every((value) => value === "");
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const makeSearch = () => {
    const advancedSearchBody = createEmptyAdvancedSearchData();

    Object.keys(enumInputValues).forEach((key) => {
      const value = enumInputValues[key as keyof inputValues];
      const comparator = enumComparators[key as keyof comparators];

      if (value && value !== "") {
        const fieldData = createEmptyFieldData();
        fieldData.value = value;
        fieldData.comparator = comparator;
        addFieldData(advancedSearchBody, fieldData, key as AdvancedSearchEnum);
      }
    });
    const data = toJson(advancedSearchBody);

    const sources = Object.keys(enumCheckbox).filter(
      (key) => enumCheckbox[key as keyof checkbox],
    );

    if (isAdvancedSearchData(data)) {
      const searchBody = generateAdvancedSearchParam(data, sources);
      closeModal();
      navigate("/search", { state: { searchBody } });
    }
  };

  const showSelect = (type: AdvancedSearchEnum) => {
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

  const showTitle = (type: AdvancedSearchEnum) => {
    return (
      <div className="med-title-advanced-search">
        {t(`mediacentre.advanced.name.${type}`) + " :"}
      </div>
    );
  };

  const showInput = (type: AdvancedSearchEnum) => {
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

  const showCheckbox = () => {
    const getCheckbox = (type: AdvancedSearchSourcesEnum) => {
      const imagesMap = {
        [AdvancedSearchSourcesEnum.GAR]: GAR,
        [AdvancedSearchSourcesEnum.Moodle]: Moodle,
        [AdvancedSearchSourcesEnum.Signet]: Signet,
      };
      return (
        <div className="med-checkbox-container-advanced-search">
          <img
            src={imagesMap[type]}
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
    return (
      <div className="med-source-advanced-search">
        {getCheckbox(AdvancedSearchSourcesEnum.GAR)}
        {getCheckbox(AdvancedSearchSourcesEnum.Moodle)}
        {getCheckbox(AdvancedSearchSourcesEnum.Signet)}
      </div>
    );
  };

  const showRow = (type: AdvancedSearchEnum) => {
    return (
      <Grid>
        <div className="med-left-col-advanced-search">{showSelect(type)}</div>
        <div className="med-right-col-advanced-search">
          {showTitle(type)}
          {type === AdvancedSearchEnum.source
            ? showCheckbox()
            : showInput(type)}
        </div>
      </Grid>
    );
  };

  return (
    <Modal
      id="advanced-search-modal"
      isOpen={isModalOpen}
      onModalClose={closeModal}
      size="md"
      viewport={true}
      scrollable={false}
      focusId="modal-title"
    >
      <Modal.Header onModalClose={closeModal}>
        {t("mediacentre.source.search.advanced")}
      </Modal.Header>
      <Modal.Subtitle>
        {t("mediacentre.source.search.advanced.subtitle")}
      </Modal.Subtitle>
      <Modal.Body>
        {Object.values(AdvancedSearchEnum).map((type) => showRow(type))}
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={closeModal} variant="outline">
          {t("mediacentre.cancel")}
        </Button>
        <Button onClick={makeSearch} disabled={allInputsAreEmpty()}>
          {t("mediacentre.search")}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
