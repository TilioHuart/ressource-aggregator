import React from "react";

import { Button, Modal } from "@edifice-ui/react";
import { useTranslation } from "react-i18next";
import "./AdvancedSearch.scss";
import { useNavigate } from "react-router-dom";

import { AdvancedSearchRow } from "../advanced-search-row/AdvancedSearchRow";
import { AdvancedSearchSourcesEnum } from "~/core/enum/advanced-search-sources.enum";
import { AdvancedSearchEnum } from "~/core/enum/advanced-search.enum";
import { SEARCH_TYPE } from "~/core/enum/search-type.enum";
import { advancedSearchCheckbox } from "~/model/AdvancedSearchCheckbox";
import { advancedSearchComparator } from "~/model/AdvancedSearchComparator";
import { AdvancedSearchData } from "~/model/AdvancedSearchData";
import { advancedSearchInput } from "~/model/AdvancedSearchInput";

interface AdvancedSearchProps {
  isModalOpen: boolean;
  setIsModalOpen: (value: boolean) => void;
}

export const AdvancedSearch: React.FC<AdvancedSearchProps> = ({
  isModalOpen,
  setIsModalOpen,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [enumCheckbox, setEnumCheckbox] =
    React.useState<advancedSearchCheckbox>({
      [AdvancedSearchSourcesEnum.GAR]: true,
      [AdvancedSearchSourcesEnum.Moodle]: true,
      [AdvancedSearchSourcesEnum.Signet]: true,
    });

  const [enumComparators, setEnumComparators] =
    React.useState<advancedSearchComparator>({
      [AdvancedSearchEnum.author]: "$or",
      [AdvancedSearchEnum.editor]: "$or",
      [AdvancedSearchEnum.discipline]: "$or",
      [AdvancedSearchEnum.level]: "$or",
    });

  const [enumInputValues, setEnumInputValues] =
    React.useState<advancedSearchInput>({
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
    const advancedSearchData: AdvancedSearchData = {};

    Object.keys(enumInputValues).forEach((key) => {
      const value = enumInputValues[key as keyof advancedSearchInput];
      const comparator = enumComparators[key as keyof advancedSearchComparator];

      if (value && value !== "") {
        advancedSearchData[key as keyof AdvancedSearchData] =
          key === AdvancedSearchEnum.title ? { value } : { value, comparator };
      }
    });

    const sources = Object.keys(enumCheckbox).filter(
      (key) => enumCheckbox[key as keyof advancedSearchCheckbox],
    );

    const searchBody = {
      state: SEARCH_TYPE.ADVANCED,
      data: advancedSearchData,
      event: "search",
      sources: sources,
    };

    console.log(searchBody);

    closeModal();
    navigate("/search", { state: { searchBody } });
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
        {Object.values(AdvancedSearchEnum).map((type) => (
          <AdvancedSearchRow
            type={type}
            enumComparators={enumComparators}
            setEnumComparators={setEnumComparators}
            enumInputValues={enumInputValues}
            setEnumInputValues={setEnumInputValues}
            enumCheckbox={enumCheckbox}
            setEnumCheckbox={setEnumCheckbox}
          />
        ))}
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
