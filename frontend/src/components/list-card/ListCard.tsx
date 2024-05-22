import React, { useState, useEffect } from "react";

import { Grid } from "@edifice-ui/react";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import Brightness1Icon from "@mui/icons-material/Brightness1";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import SchoolIcon from "@mui/icons-material/School";
import StarIcon from "@mui/icons-material/Star";

import "./ListCard.scss";
import {
  NbColumnsListCard,
  NbComponentsListCard,
  TitleListCard,
} from "~/core/const/home-element-list-sizes.const";
import { ListCardTypeEnum } from "~/core/enum/list-card-type.enum.ts";

interface ListCardProps {
  scrollable: boolean;
  type: ListCardTypeEnum;
  components?: any[];
}

export const ListCard: React.FC<ListCardProps> = ({
  scrollable,
  type,
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
    if (windowWidth < 768) return nbComponent.sm;
    if (windowWidth < 992) return nbComponent.md;
    if (windowWidth < 1280) return nbComponent.lg;
    return nbComponent.xl;
  };

  const NbColumns = (windowWidth: number) => {
    const nbColumns = NbColumnsListCard[type];
    if (windowWidth < 768) return nbColumns.sm;
    if (windowWidth < 992) return nbColumns.md;
    if (windowWidth < 1280) return nbColumns.lg;
    return nbColumns.xl;
  };

  const tooMuchComponents = (components: any[]) => {
    return components.length > NbComponents(windowWidth);
  };

  const showTitle = (type: ListCardTypeEnum) => {
    if (type === ListCardTypeEnum.favorites) {
      return (
        <span className="title">
          <StarIcon className="icon" />
          {TitleListCard[type]}
        </span>
      );
    }
    if (type === ListCardTypeEnum.manuals) {
      return (
        <span className="title">
          <SchoolIcon className="icon" />
          {TitleListCard[type]}
        </span>
      );
    }
    if (type === ListCardTypeEnum.util_links) {
      return (
        <span className="title">
          <BookmarkIcon className="icon" />
          {TitleListCard[type]}
        </span>
      );
    }
  };

  const showComponent = (component: any, index: number) => {
    if (index < NbComponents(windowWidth)) {
      return component;
    }
  };

  if (!scrollable) {
    return (
      <div className={`list-card ${type}`}>
        <div className="list-card-header">
          {showTitle(type)}
          {components && tooMuchComponents(components) && (
            <a href="/" className="right-button">
              Voir plus
            </a>
          )}
        </div>
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
          <span className="title">{TitleListCard[type]}</span>
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
