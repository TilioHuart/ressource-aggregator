import React, { useState, useEffect } from "react";

import { Button, Grid } from "@edifice-ui/react";

import "./ListCard.scss";
import { ListCardTypeEnum } from "~/core/enum/list-card-type.enum.ts";
import { ElementSize } from "~/model/elementSize.tsx";

interface ListCardProps {
  scrollable: boolean;
  type: ListCardTypeEnum;
  title: string;
  nbColumns: ElementSize;
  nbComponent: ElementSize;
  components?: any[];
}

export const ListCard: React.FC<ListCardProps> = ({
  scrollable,
  type,
  title,
  nbColumns,
  nbComponent,
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
    if (windowWidth < 768) return nbComponent.sm;
    if (windowWidth < 1280) return nbComponent.md;
    return nbComponent.lg;
  };

  const NbColumns = (windowWidth: number) => {
    if (windowWidth < 768) return nbColumns.sm;
    if (windowWidth < 1280) return nbColumns.md;
    return nbColumns.lg;
  };

  const tooMuchComponents = (components: any[]) => {
    return components.length > NbComponents(windowWidth);
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
          <span className="title">{title}</span>
          {components && tooMuchComponents(components) && (
            <button className="right-button">Voir plus</button>
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
          <span className="title">{title}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center" }}>
          <Button
            color="primary"
            type="button"
            variant="filled"
            style={{ width: "5%", height: "50px", marginRight: "auto" }}
          >
            {"<"}
          </Button>
          <Grid className={`grid-${NbColumns(windowWidth)}-scrollable`}>
            {components &&
              components.map((component, index) =>
                showComponent(component, index),
              )}
          </Grid>
          <Button
            color="primary"
            type="button"
            variant="filled"
            style={{ width: "5%", height: "50px", marginLeft: "auto" }}
          >
            {">"}
          </Button>
        </div>
      </div>
    );
  }
};
