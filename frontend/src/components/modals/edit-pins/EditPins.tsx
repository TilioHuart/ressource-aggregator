import React, { useEffect, useState } from "react";

import {
  AlertTypes,
  Button,
  FormControl,
  Input,
  Label,
  Modal,
  useUser,
} from "@edifice-ui/react";
import { useTranslation } from "react-i18next";

import "../Modal.scss";
import { Pin } from "~/model/Pin.model";
import { useAlertProvider } from "~/providers/AlertProvider";
import { useModalProvider } from "~/providers/ModalsProvider";
import { useUpdatePinMutation } from "~/services/api/pin.service";

interface EditPinsProps {
  refetch: () => void;
}

export const EditPins: React.FC<EditPinsProps> = ({ refetch }) => {
  const { user } = useUser();
  const { t } = useTranslation();
  const { modalResource, isEditOpen, setIsEditOpen, setIsDeleteOpen } =
    useModalProvider();
  const { setAlertText, setAlertType } = useAlertProvider();
  const [updatePin] = useUpdatePinMutation();
  const [title, setTitle] = useState<string>(
    (modalResource as Pin)?.pinned_title ?? "",
  );
  const [description, setDescription] = useState<string>(
    (modalResource as Pin)?.pinned_description ?? "",
  );

  const handleCloseModal = () => {
    setIsEditOpen(false);
  };

  const resetFields = () => {
    setTitle("");
    setDescription("");
  };

  const notify = (message: string, type: AlertTypes) => {
    setAlertText(message);
    setAlertType(type);
  };

  const onSubmitDelete = async () => {
    setIsDeleteOpen(true);
    handleCloseModal();
  };

  const onSubmit = async () => {
    try {
      const idResource = (modalResource as Pin)?._id;
      const idStructure =
        (user?.structures && user.structures.length > 0
          ? user?.structures[0]
          : "") ?? "";
      const payload = {
        pinned_title: title,
        pinned_description: description,
      };
      const response = await updatePin({ idStructure, idResource, payload });

      if (response?.error) {
        notify(t("mediacentre.error.pin"), "danger");
      }

      refetch();
      handleCloseModal();
      resetFields();
      notify(t("mediacentre.pin.edit.success"), "success");
    } catch (e) {
      console.error(e);
      notify(t("mediacentre.error.pin.edit"), "danger");
    }
  };

  useEffect(() => {
    setTitle((modalResource as Pin)?.pinned_title ?? "");
    setDescription((modalResource as Pin)?.pinned_description ?? "");
  }, [modalResource]);

  if (!modalResource || !isEditOpen) {
    return null;
  }

  return (
    <Modal onModalClose={handleCloseModal} isOpen={isEditOpen} id="create-pins">
      <Modal.Header onModalClose={handleCloseModal}>
        {t("mediacentre.pins.modal.edit.title")}
      </Modal.Header>
      <Modal.Subtitle>{t("mediacentre.pins.modal.subtitle")}</Modal.Subtitle>
      <Modal.Body>
        <div className="med-modal-container">
          <div className="med-modal-image">
            <img
              src={modalResource?.image}
              alt="Resource"
              className="med-image"
              onError={({ currentTarget }) => {
                currentTarget.onerror = null;
                currentTarget.src =
                  "/mediacentre/public/img/no-image-resource.svg";
              }}
            />
          </div>
          <div className="med-modal-content">
            <FormControl id="create-pin-title" isRequired={true}>
              <Label>{t("mediacentre.advanced.name.title")}</Label>
              <Input
                placeholder="Votre titre"
                size="md"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </FormControl>
            <FormControl id="create-pin-description">
              <Label>
                {t("mediacentre.description.title.description")}{" "}
                <span className="med-optional">
                  - {t("mediacentre.pins.modal.optional")}
                </span>
              </Label>
              <Input
                placeholder="Votre titre"
                size="md"
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </FormControl>
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button
          color="danger"
          className="med-delete-pin"
          onClick={onSubmitDelete}
        >
          {t("mediacentre.pins.modal.remove.pin")}
        </Button>
        <Button color="tertiary" onClick={handleCloseModal}>
          {t("mediacentre.cancel")}
        </Button>
        <Button color="primary" type="submit" onClick={onSubmit}>
          {t("mediacentre.save")}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
