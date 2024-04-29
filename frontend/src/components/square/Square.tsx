import React from "react";

interface SquareProps {
  width: string;
  height: string;
  color: string;
  margin: string;
}

export const Square: React.FC<SquareProps> = (square: SquareProps) => {
  return (
    <div
      style={{
        width: square.width,
        height: square.height,
        backgroundColor: square.color,
        margin: square.margin,
      }}
    ></div>
  );
};
