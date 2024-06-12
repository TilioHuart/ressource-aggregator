import { AlertTypes } from "@edifice-ui/react";
import { useNavigate } from "react-router-dom";

import { ListCard } from "../list-card/ListCard";
import { Resource } from "../resource/Resource";
import { CardTypeEnum } from "~/core/enum/card-type.enum";
import { Textbook } from "~/model/Textbook.model";

interface HomeManualsListProps {
  textbooks: Textbook[];
  setAlertText: (arg: string) => void;
  setAlertType: (arg: AlertTypes) => void;
  handleAddFavorite: (resource: any) => void;
  handleRemoveFavorite: (id: string) => void;
  double?: boolean;
}

export const HomeManualsList: React.FC<HomeManualsListProps> = ({
  textbooks,
  setAlertText,
  setAlertType,
  handleAddFavorite,
  handleRemoveFavorite,
  double,
}) => {
  const navigate = useNavigate();
  return (
    <ListCard
      scrollable={false}
      type={CardTypeEnum.manuals}
      components={textbooks.map((textbook: Textbook) => (
        <Resource
          id={textbook?.id ?? ""}
          key={textbook.id}
          image={textbook?.image ?? "/mediacentre/public/img/no-avatar.svg"}
          title={textbook.title}
          subtitle={textbook?.editors?.join(", ") ?? ""}
          type={CardTypeEnum.manuals}
          favorite={textbook.favorite}
          link={textbook.link ?? textbook.url ?? "/"}
          setAlertText={(arg: string, type: AlertTypes) => {
            setAlertText(arg);
            setAlertType(type);
          }}
          resource={textbook}
          handleAddFavorite={handleAddFavorite}
          handleRemoveFavorite={handleRemoveFavorite}
        />
      ))}
      redirectLink={() => navigate("/textbook")}
      homeDouble={double}
    />
  );
};
