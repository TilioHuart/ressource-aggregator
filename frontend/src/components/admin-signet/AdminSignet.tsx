import React from "react";

import DeleteForeverIcon from "@mui/icons-material/DeleteForeverOutlined";
import FolderIcon from "@mui/icons-material/FolderOutlined";
import FolderSharedIcon from "@mui/icons-material/FolderSharedOutlined";
import PublicIcon from "@mui/icons-material/PublicOutlined";
import "./AdminSignet.scss";
import { useTranslation } from "react-i18next";

interface AdminSignetProps {}

export const AdminSignet: React.FC<AdminSignetProps> = () => {
  const { t } = useTranslation();
  return (
    <div className="med-signets-admin-list">
      <div className="med-signets-admin-box active">
        <FolderIcon style={{ width: "1.75em", height: "1.75em" }} />
        <p className="med-signets-admin-box-text">
          {t("mediacentre.signets.mine")}
        </p>
      </div>
      <div className="med-signets-admin-box">
        <FolderSharedIcon style={{ width: "1.75em", height: "1.75em" }} />
        <p className="med-signets-admin-box-text">
          {t("mediacentre.signets.shared")}
        </p>
      </div>
      <div className="med-signets-admin-box">
        <PublicIcon style={{ width: "1.75em", height: "1.75em" }} />
        <p className="med-signets-admin-box-text">
          {t("mediacentre.signets.published")}
        </p>
      </div>
      <div className="med-signets-admin-box">
        <DeleteForeverIcon style={{ width: "1.75em", height: "1.75em" }} />
        <p className="med-signets-admin-box-text">
          {t("mediacentre.signets.archived")}
        </p>
      </div>
    </div>
  );
};
