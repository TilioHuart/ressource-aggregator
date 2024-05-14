import { ID } from "edifice-ts-client";

import { Header } from "~/components/header/Header.tsx";
import { ListCard } from "~/components/list-card/ListCard.tsx";
import { Resource } from "~/components/resource/Resource";
import { Sidebar } from "~/components/sidebar/Sidebar.tsx";
import { Square } from "~/components/square/Square.tsx";
import {
  NbColumnsListCard,
  NbComponentsListCard,
  TitleListCard,
} from "~/core/const/home-element-list-sizes.const.ts";
import { ListCardTypeEnum } from "~/core/enum/list-card-type.enum.ts";

export interface AppProps {
  _id: string;
  created: Date;
  description: string;
  map: string;
  modified: Date;
  name: string;
  owner: { userId: ID; displayName: string };
  shared: any[];
  thumbnail: string;
}

export const App = () => {
  const getResourceCard = () => {
    return (
      <Resource
        image="https://via.placeholder.com/150"
        title="Resource Title"
        subtitle="Resource Subtitle"
        size="medium"
        favorite={false}
      />
    );
  };
  return (
    <>
      <Sidebar />
      <div className="home-container">
        <Header />
        <div className="square-container">
          <Square
            width="60%"
            height="300px"
            color="#c3c3c3"
            margin="0 5% 10px 0"
          />
          <Square
            width="40%"
            height="300px"
            color="#d0d0d0"
            margin="0 0 10px 0"
          />
        </div>
        <ListCard
          scrollable={false}
          type={ListCardTypeEnum.manuals}
          title={TitleListCard[ListCardTypeEnum.manuals]}
          nbColumns={NbColumnsListCard[ListCardTypeEnum.manuals]}
          nbComponent={NbComponentsListCard[ListCardTypeEnum.manuals]}
          components={[
            getResourceCard(),
            getResourceCard(),
            getResourceCard(),
            getResourceCard(),
            getResourceCard(),
            getResourceCard(),
          ]}
        />
        <ListCard
          scrollable={false}
          type={ListCardTypeEnum.util_links}
          title={TitleListCard[ListCardTypeEnum.util_links]}
          nbColumns={NbColumnsListCard[ListCardTypeEnum.util_links]}
          nbComponent={NbComponentsListCard[ListCardTypeEnum.util_links]}
          components={[
            getResourceCard(),
            getResourceCard(),
            getResourceCard(),
            getResourceCard(),
            getResourceCard(),
          ]}
        />
      </div>
    </>
  );
};
