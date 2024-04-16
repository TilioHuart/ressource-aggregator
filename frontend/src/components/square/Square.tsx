import React from "react";
import "./Square.scss";

interface SquareProps {
  width: string;
  height: string;
  color: string;
  margin: string;
}

export const Square: React.FC<SquareProps> = ({
  width,
  height,
  color,
  margin,
}) => {
  return (
    <div
      style={{
        width: width,
        height: height,
        backgroundColor: color,
        margin: margin,
      }}
    ></div>
  );
};
