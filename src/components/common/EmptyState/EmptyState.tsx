import React from "react";
import { Link } from "react-router-dom";
import { Button } from "../Button/Button";
import "./EmptyState.css";

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionText?: string;
  actionLink?: string;
  onActionClick?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionText,
  actionLink,
  onActionClick
}) => {
  return (
    <div className="gf-empty-state">
      {icon && <div className="gf-empty-state__icon">{icon}</div>}
      <h3 className="gf-empty-state__title">{title}</h3>
      {description && <p className="gf-empty-state__desc">{description}</p>}
      {(actionText && (actionLink || onActionClick)) && (
        <div className="gf-empty-state__action">
          {actionLink ? (
            <Link to={actionLink}>
              <Button variant="primary">{actionText}</Button>
            </Link>
          ) : (
            <Button variant="primary" onClick={onActionClick}>
              {actionText}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
