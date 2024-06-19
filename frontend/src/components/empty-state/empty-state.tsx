import { useTranslation } from "react-i18next";

interface EmptyStateProps {
  title: string;
  description?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
}) => {
  const { t } = useTranslation();
  return (
    <div className="empty-state">
      <img
        src="/mediacentre/public/img/empty-state.png"
        alt="empty-state"
        className="empty-state-img"
      />
      <span className="empty-state-text">
        {<p>{t(title)}</p>}
        {description && <p>{t(description)}</p>}
      </span>
    </div>
  );
};
