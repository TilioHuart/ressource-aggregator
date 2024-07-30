import { useEffect, useState } from "react";

import { Button, Image, Modal } from "@edifice-ui/react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import { PREF_EXPLORER_MODAL } from "~/core/const/preferences.const";
import { useOnboardingModal } from "~/hooks/useOnboardingModal";

import "./ModalExplorer.scss";

interface ModalExplorerProps {}

export const ModalExplorer: React.FC<ModalExplorerProps> = () => {
  const { t } = useTranslation();
  const [swiperInstance, setSwiperInstance] = useState<any>();
  const [swiperProgress, setSwiperprogress] = useState<number>(0);
  const { isOpen, isOnboarding, setIsOpen, handleSavePreference } =
    useOnboardingModal(PREF_EXPLORER_MODAL);
  const items = [
    {
      src: "/mediacentre/public/img/modal-explorer-first.svg",
      alt: t("mediacentre.modal.explorer.screen1.alt"),
      text: t("mediacentre.modal.explorer.screen1.text"),
    },
    {
      src: "mediacentre/public/img/modal-explorer-second.png",
      alt: t("mediacentre.modal.explorer.screen2.alt"),
      text: t("mediacentre.modal.explorer.screen2.text"),
    },
    {
      src: "mediacentre/public/img/modal-explorer-third.png",
      alt: t("mediacentre.modal.explorer.screen3.alt"),
      text: t("mediacentre.modal.explorer.screen3.text"),
    },
  ];
  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css";
    link.rel = "stylesheet";
    link.type = "text/css";

    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
    };
  }, []);

  return isOnboarding
    ? createPortal(
        <Modal
          id="onboarding-modal"
          size="md"
          isOpen={isOpen}
          focusId="nextButtonId"
          onModalClose={() => setIsOpen(false)}
        >
          <Modal.Header onModalClose={() => setIsOpen(false)}>
            {t("mediacentre.modal.explorer.title")}
          </Modal.Header>
          <Modal.Body>
            <Swiper
              modules={[Pagination]}
              onSwiper={(swiper) => {
                setSwiperInstance(swiper);
              }}
              onSlideChange={(swiper) => {
                setSwiperprogress(swiper.progress);
              }}
              pagination={{
                clickable: true,
              }}
            >
              {items.map((item, index) => {
                return (
                  <SwiperSlide
                    key={index}
                    className="med-modal-explorer-swiper"
                  >
                    <Image
                      className="mx-auto my-12 med-modal-explorer-image"
                      loading="lazy"
                      src={`${item.src}`}
                      alt={t(item.alt)}
                    />
                    <p>{t(item.text)}</p>
                  </SwiperSlide>
                );
              })}
            </Swiper>
          </Modal.Body>
          <Modal.Footer>
            <Button
              type="button"
              color="tertiary"
              variant="ghost"
              onClick={() => setIsOpen(false)}
            >
              {t("mediacentre.modal.explorer.trash.later")}
            </Button>

            {swiperProgress > 0 && (
              <Button
                type="button"
                color="primary"
                variant="outline"
                onClick={() => swiperInstance.slidePrev()}
              >
                {t("mediacentre.modal.explorer.prev")}
              </Button>
            )}
            {swiperProgress < 1 && (
              <Button
                id="nextButtonId"
                type="button"
                color="primary"
                variant="filled"
                onClick={() => swiperInstance.slideNext()}
              >
                {t("mediacentre.modal.explorer.next")}
              </Button>
            )}
            {swiperProgress === 1 && (
              <Button
                type="button"
                color="primary"
                variant="filled"
                onClick={handleSavePreference}
              >
                {t("mediacentre.modal.explorer.close")}
              </Button>
            )}
          </Modal.Footer>
        </Modal>,
        document.getElementById("portal") as HTMLElement,
      )
    : null;
};
