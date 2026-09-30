import React from "react";
import "./Button.css";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "gold" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  loading = false,
  icon,
  iconPosition = "left",
  fullWidth = false,
  children,
  className = "",
  disabled,
  ...props
}) => {
  const classes = [
    "gf-btn",
    `gf-btn--${variant}`,
    `gf-btn--${size}`,
    fullWidth ? "gf-btn--full" : "",
    loading ? "gf-btn--loading" : "",
    className
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button className={classes} disabled={disabled || loading} {...props}>
      {loading ? (
        <span className="gf-btn__spinner" aria-hidden="true" />
      ) : (
        <>
          {icon && iconPosition === "left" && <span className="gf-btn__icon">{icon}</span>}
          <span className="gf-btn__text">{children}</span>
          {icon && iconPosition === "right" && <span className="gf-btn__icon">{icon}</span>}
        </>
      )}
    </button>
  );
};
