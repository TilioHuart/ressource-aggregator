import React from "react";

import { Chip } from "@mui/material";
import "./ChipController.scss";

export interface ChipControllerProps {
  array: string[];
  onDelete: (index: number) => void;
  className?: string;
}

export const ChipController: React.FC<ChipControllerProps> = ({
  array,
  onDelete,
  className = "",
}) => {
  return (
    <div className={`med-chip-controller ${className}`}>
      {array.map((value, index) => (
        <Chip
          key={index}
          label={value}
          onDelete={() => onDelete(index)}
          size="medium"
          className="med-chip"
        />
      ))}
    </div>
  );
};
