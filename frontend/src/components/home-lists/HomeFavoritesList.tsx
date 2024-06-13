import { AlertTypes } from "@edifice-ui/react";

import { ListCard } from "../list-card/ListCard";
import { Resource } from "../resource/Resource";
import { CardTypeEnum } from "~/core/enum/card-type.enum";
import { Favorite } from "~/model/Favorite.model";

interface HomeFavoritesListProps {
  favorites: Favorite[];
  setAlertText: (arg: string) => void;
  setAlertType: (arg: AlertTypes) => void;
  handleAddFavorite: (resource: any) => void;
  handleRemoveFavorite: (id: string | number) => void;
  double?: boolean;
}

export const HomeFavoritesList: React.FC<HomeFavoritesListProps> = ({
  favorites,
  setAlertText,
  setAlertType,
  handleAddFavorite,
  handleRemoveFavorite,
  double,
}) => (
  <ListCard
    scrollable={false}
    type={CardTypeEnum.favorites}
    components={favorites.map((favorite: Favorite) => (
      <Resource
        id={favorite?.id ?? ""}
        key={favorite?.id ?? ""}
        image={favorite?.image ?? "/mediacentre/public/img/no-avatar.svg"}
        title={favorite.title}
        subtitle={favorite.description}
        type={CardTypeEnum.favorites}
        favorite={favorite.favorite}
        link={favorite.link ?? favorite.url ?? "/"}
        setAlertText={(arg: string, type: AlertTypes) => {
          setAlertText(arg);
          setAlertType(type);
        }}
        resource={favorite}
        handleAddFavorite={handleAddFavorite}
        handleRemoveFavorite={handleRemoveFavorite}
      />
    ))}
    redirectLink="/mediacentre?view=angular#/favorite"
    homeDouble={double}
  />
);
