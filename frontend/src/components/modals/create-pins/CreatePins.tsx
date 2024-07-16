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

import { links } from "~/core/const/links.const";
import { useAlertProvider } from "~/providers/AlertProvider";
import { useModalProvider } from "~/providers/ModalsProvider";
import { useCreatePinMutation } from "~/services/api/pin.service";
import "../Modal.scss";

interface CreatePinsProps {
  refetch: () => void;
}

export const CreatePins: React.FC<CreatePinsProps> = ({ refetch }) => {
  const { user } = useUser();
  const { t } = useTranslation();
  const { modalResource, isCreatedOpen, setIsCreatedOpen } = useModalProvider();
  const { setAlertText, setAlertType } = useAlertProvider();
  const [createPin] = useCreatePinMutation();
  const [title, setTitle] = useState<string>(modalResource?.title ?? "");
  const [description, setDescription] = useState<string>(
    (modalResource as any)?.description ?? "",
  );

  const handleCloseModal = () => {
    setIsCreatedOpen(false);
  };

  const resetFields = () => {
    setTitle("");
    setDescription("");
  };

  const notify = (message: string, type: AlertTypes) => {
    setAlertText(message);
    setAlertType(type);
  };

  const onSubmit = async () => {
    try {
      const payload = {
        pinned_title: title,
        pinned_description: description,
        id: modalResource?.id,
        source: modalResource?.source,
      };
      const idStructure =
        (user?.structures && user.structures.length > 0
          ? user?.structures[0]
          : "") ?? "";
      const response = await createPin({ idStructure, payload });

      if (response?.error) {
        notify(t("mediacentre.error.pin"), "danger");
      }

      refetch();
      handleCloseModal();
      resetFields();
      notify(t("mediacentre.pin.success"), "success");
    } catch (error) {
      notify(t("mediacentre.error.pin"), "danger");
      console.error(error);
    }
  };

  useEffect(() => {
    setTitle(modalResource?.title ?? "");
    setDescription((modalResource as any)?.description ?? "");
  }, [modalResource]);

  if (!modalResource || !isCreatedOpen) {
    return null;
  }

  return (
    <Modal
      onModalClose={handleCloseModal}
      isOpen={isCreatedOpen}
      id="create-pins"
    >
      <Modal.Header onModalClose={handleCloseModal}>
        {t("mediacentre.pins.modal.create.title")}
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
                currentTarget.src = links.IMAGE_NO_RESOURCE;
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
                placeholder="Description"
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
        <Button color="tertiary" onClick={handleCloseModal}>
          {t("mediacentre.cancel")}
        </Button>
        <Button
          color="primary"
          type="submit"
          disabled={title == ""}
          onClick={onSubmit}
        >
          {t("mediacentre.pin")}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
