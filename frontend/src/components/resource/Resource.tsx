import React from "react";
import "./Resource.scss";
import { Card, Dropdown } from "@edifice-ui/react";
import { useTranslation } from "react-i18next";

interface ResourceProps {
  title: string,
  ownerName: string
}

export const Resource: React.FC<ResourceProps> = ({ title, ownerName}) => {
  const { t } = useTranslation();
  return (
    <>
      <Card className="med-resource-card">
        <Card.Body space="8" flexDirection="column">
          <Card.Image
            imageSrc="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQGdW-EXiOXecV5VMn0Rbeg7kSWveGR8bN62Z8_sHUF_A&s"
          />
          <div className="">
            <Card.Text className="med-resource-card-text">{title}</Card.Text>
            <Card.Text className="text-black-50 med-resource-card-text">{ownerName}</Card.Text>
          </div>
        </Card.Body>
      </Card>
      <Dropdown>
        <Dropdown.Trigger />
          
        <Dropdown.Menu>
          <Dropdown.Item>
            { t('mediacentre.card.open') }
          </Dropdown.Item>
          <Dropdown.Separator />
          <Dropdown.Item>
            { t('mediacentre.card.favorite') }
          </Dropdown.Item>
          <Dropdown.Item>
            { t('mediacentre.card.pin') }
          </Dropdown.Item>
          <Dropdown.Item>
            { t('mediacentre.card.copy') }
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    </>
  );
};
