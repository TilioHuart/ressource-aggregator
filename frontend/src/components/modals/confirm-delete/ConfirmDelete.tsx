import React from "react";

import { AlertTypes, Button, Modal, useUser } from "@edifice-ui/react";
import { useTranslation } from "react-i18next";

import { Pin } from "~/model/Pin.model";
import { useAlertProvider } from "~/providers/AlertProvider";
import { useModalProvider } from "~/providers/ModalsProvider";
import { useDeletePinMutation } from "~/services/api/pin.service";
import "../Modal.scss";

interface ConfirmDeleteProps {
  refetch: () => void;
}

export const ConfirmDelete: React.FC<ConfirmDeleteProps> = ({ refetch }) => {
  const { user } = useUser();
  const { t } = useTranslation();
  const { modalResource, isDeleteOpen, setIsDeleteOpen } = useModalProvider();
  const { setAlertText, setAlertType } = useAlertProvider();
  const [deletePin] = useDeletePinMutation();

  const handleCloseModal = () => {
    setIsDeleteOpen(false);
  };

  const notify = (message: string, type: AlertTypes) => {
    setAlertText(message);
    setAlertType(type);
  };

  const onSubmitDelete = async () => {
    try {
      const idResource = (modalResource as Pin)?._id;
      const idStructure =
        (user?.structures && user.structures.length > 0
          ? user?.structures[0]
          : "") ?? "";
      const response = await deletePin({ idStructure, idResource });

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

  if (!modalResource || !isDeleteOpen) {
    return null;
  }

  return (
    <Modal
      onModalClose={handleCloseModal}
      isOpen={isDeleteOpen}
      id="delete-pins"
    >
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
