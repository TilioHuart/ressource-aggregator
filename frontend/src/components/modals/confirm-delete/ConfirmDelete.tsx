import React from "react";

import { AlertTypes, Button, Modal } from "@edifice-ui/react";
import { useTranslation } from "react-i18next";

import { Pin } from "~/model/Pin.model";
import { useAlertProvider } from "~/providers/AlertProvider";
import { useModalProvider } from "~/providers/ModalsProvider";
import { useSelectedStructureProvider } from "~/providers/SelectedStructureProvider";
import { useDeletePinMutation } from "~/services/api/pin.service";
import "../Modal.scss";

interface ConfirmDeleteProps {
  refetch: () => void;
}

export const ConfirmDelete: React.FC<ConfirmDeleteProps> = ({ refetch }) => {
  const { t } = useTranslation();
  const { idSelectedStructure } = useSelectedStructureProvider();
  const { modalResource, openModal, closeAllModals } = useModalProvider();
  const { setAlertText, setAlertType } = useAlertProvider();
  const [deletePin] = useDeletePinMutation();

  const handleCloseModal = () => {
    closeAllModals();
  };

  const notify = (message: string, type: AlertTypes) => {
    setAlertText(message);
    setAlertType(type);
  };

  const onSubmitDelete = async () => {
    try {
      const idResource = (modalResource as Pin)?._id;
      const response = await deletePin({
        idStructure: idSelectedStructure,
        idResource,
      });

      if (response?.error) {
        notify(t("mediacentre.error.pin"), "danger");
      }

      refetch();
      handleCloseModal();
      notify(t("mediacentre.pin.delete.success"), "success");
    } catch (e) {
      console.error(e);
      notify(t("mediacentre.error.pin.delete"), "danger");
    }
  };

  if (!modalResource || openModal !== ModalEnum.CONFIRM_DELETE_PIN) {
    return null;
  }

  return (
    <Modal onModalClose={handleCloseModal} isOpen={true} id="delete-pins">
      <Modal.Header onModalClose={handleCloseModal}>
        {t("mediacentre.pins.modal.delete.title")}
      </Modal.Header>
      <Modal.Body>{t("mediacentre.pins.modal.delete.subtitle")}</Modal.Body>
      <Modal.Footer>
        <Button color="tertiary" onClick={handleCloseModal}>
          {t("mediacentre.cancel")}
        </Button>
        <Button color="danger" type="submit" onClick={onSubmitDelete}>
          {t("mediacentre.delete")}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
