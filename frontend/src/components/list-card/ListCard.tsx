import React, { useState, useEffect } from "react";

import { Grid } from "@edifice-ui/react";
import Brightness1Icon from "@mui/icons-material/Brightness1";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import "./ListCard.scss";

import { ListCardTitle } from "./list-card-title/ListCardTitle";
import { breakpoints } from "~/core/const/breakpoints.ts";
import {
  NbColumnsListCard,
  NbComponentsListCard,
} from "~/core/const/home-element-list-sizes.const";
import { CardTypeEnum } from "~/core/enum/card-type.enum.ts";

interface ListCardProps {
  scrollable: boolean;
  type?: CardTypeEnum;
  components?: any[];
}

export const ListCard: React.FC<ListCardProps> = ({
  scrollable,
  type = CardTypeEnum.favorites,
  components,
}) => {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const NbComponents = (windowWidth: number) => {
    const nbComponent = NbComponentsListCard[type];
    if (windowWidth < breakpoints.md) return nbComponent.sm;
    if (windowWidth < breakpoints.lg) return nbComponent.md;
    if (windowWidth < breakpoints.xl) return nbComponent.lg;
    return nbComponent.xl;
  };

  const NbColumns = (windowWidth: number) => {
    const nbColumns = NbColumnsListCard[type];
    if (windowWidth < breakpoints.md) return nbColumns.sm;
    if (windowWidth < breakpoints.lg) return nbColumns.md;
    if (windowWidth < breakpoints.xl) return nbColumns.lg;
    return nbColumns.xl;
  };

  const tooMuchComponents = (components: any[]) => {
    return components.length > NbComponents(windowWidth);
  };

  const showComponent = (component: any, index: number) => {
    const maxComponents = NbComponents(windowWidth);
    if (maxComponents === -1 || index < maxComponents) {
      return component;
    }
  };

  if (!scrollable) {
    return (
      <div className={`list-card ${type}`}>
        {type !== CardTypeEnum.search && (
          <div className="list-card-header">
            <ListCardTitle type={type} />
            {components && tooMuchComponents(components) && (
              <a href="/" className="right-button">
                Voir plus
              </a>
            )}
          </div>
        )}
        <Grid className={`grid-${NbColumns(windowWidth)}`}>
          {components &&
            components.map((component, index) =>
              showComponent(component, index),
            )}
        </Grid>
      </div>
    );
  } else {
    return (
      <div className={`list-card ${type}`}>
        <div className="list-card-header">
          <ListCardTitle type={type} />
        </div>
        <div style={{ display: "flex", alignItems: "center" }}>
          <KeyboardArrowLeftIcon className="left-arrow" />
          <Grid className={`grid-${NbColumns(windowWidth)}`}>
            {components &&
              components.map((component, index) =>
                showComponent(component, index),
              )}
          </Grid>
          <KeyboardArrowRightIcon className="right-arrow" />
        </div>
        <div className="dots">
          <Brightness1Icon className="dot" />
          <Brightness1Icon className="dot" />
          <Brightness1Icon className="dot" />
        </div>
      </div>
    );
  }
};
