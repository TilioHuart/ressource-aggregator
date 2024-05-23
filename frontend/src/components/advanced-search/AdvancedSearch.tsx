import React from "react";
import { Button, Checkbox, FormControl, Grid, Input, Modal, Select } from "@edifice-ui/react";
import { useTranslation } from "react-i18next";
import { AdvancedSearchEnum } from "~/core/enum/advanced-search.enum";
import "./AdvancedSearch.scss";
import GAR from "~/../public/img/fr.openent.mediacentre.source.GAR.png";
import Moodle from "~/../public/img/fr.openent.mediacentre.source.Moodle.png";
import Signet from "~/../public/img/fr.openent.mediacentre.source.Signet.png";

interface AdvancedSearchProps {
    isModalOpen: boolean;
    setIsModalOpen: (value: boolean) => void;
}

export const AdvancedSearch: React.FC<AdvancedSearchProps> = ({ isModalOpen, setIsModalOpen }) => {
    const { t } = useTranslation();

    const closeModal = () => {
        setIsModalOpen(false);
    }

    const showSelect = (type: AdvancedSearchEnum) => {
        const shouldRenderSelect = type !== AdvancedSearchEnum.source && type !== AdvancedSearchEnum.title;

        return shouldRenderSelect ? (
            <div className="med-selector-advanced-search">
                <Select
                    onValueChange={(value) => console.log(value)}
                    options={[
                        { label: "OU", value: "ou" },
                        { label: "ET", value: "et" },
                    ]}
                    placeholderOption="OU"
                />
            </div>
        ) : (
            <div className="med-selector-advanced-search"></div>
        );
    }

    const showTitle = (type: AdvancedSearchEnum) => {
        return (
            <div className="med-title-advanced-search">
                {t(`mediacentre.advanced.name.${type}`)+" :"}
            </div>
        )
    }

    const showInput = (type: AdvancedSearchEnum) => {
        const shouldRenderInput = type !== AdvancedSearchEnum.source;
        return shouldRenderInput ? (
            <div className="med-input-advanced-search">
                <FormControl id={`input-${type}`}>
                    <Input
                        placeholder={t(`mediacentre.advanced.placeholder.${type}`)}
                        size="md"
                        type="text"
                    />
                </FormControl>
            </div>
        ) : (
            <div className="med-source-advanced-search">
                <div className="med-checkbox-container-advanced-search">
                    <img src={GAR} alt={t("fr.openent.mediacentre.source.GAR")} className="image"/>
                    <Checkbox checked={true}/>
                </div>
                <div className="med-checkbox-container-advanced-search">
                    <img src={Moodle} alt={t("fr.openent.mediacentre.source.Moodle")} className="image"/>
                    <Checkbox checked={true}/>
                </div>
                <div className="med-checkbox-container-advanced-search">
                    <img src={Signet} alt={t("fr.openent.mediacentre.source.Signet")} className="image"/>
                    <Checkbox checked={true}/>
                </div>
            </div>
        );
    }

    const showRow = (type: AdvancedSearchEnum) => {
        return (
            <Grid>
                <div className="med-left-col-advanced-search">
                    {showSelect(type)}
                </div>
                <div className="med-right-col-advanced-search">
                    {showTitle(type)}
                    {showInput(type)}
                </div>
            </Grid>
        )
    }

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
                    showRow(type)
                ))}
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={closeModal} variant="outline">
                    {t("mediacentre.cancel")}
                </Button>
                <Button onClick={() => console.log("click on search in advanced search")}>
                    {t("mediacentre.search")}
                </Button>
            </Modal.Footer>
        </Modal>
    );
}