import React from "react";

type BadgeVariant = "light" | "solid";
type BadgeSize = "sm" | "md";
type BadgeColor =
  | "primary"
  | "success"
  | "error"
  | "warning"
  | "info"
  | "light"
  | "dark";

interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  color?: BadgeColor;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  children: React.ReactNode;
}

const Badge: React.FC<BadgeProps> = ({
  variant = "light",
  color = "primary",
  size = "md",
  startIcon,
  endIcon,
  children,
}) => {
  const baseStyles =
    "inline-flex items-center px-2.5 py-0.5 justify-center gap-1 rounded-full font-medium";

  const sizeStyles = {
    sm: "text-xs",
    md: "text-sm",
  };

  const variants = {
    light: {
      primary:
        "bg-[#eff6ff] text-[#2563eb]",
      success:
        "bg-[#ecfdf3] text-[#027a48]",
      error:
        "bg-[#fef3f2] text-[#b42318]",
      warning:
        "bg-[#fffaeb] text-[#b54708]",
      info: "bg-[#f0f9ff] text-[#0086c9]",
      light: "bg-[#f2f4f7] text-[#434655]",
      dark: "bg-[#344054] text-white",
    },
    solid: {
      primary: "bg-[#2563eb] text-white",
      success: "bg-[#12b76a] text-white",
      error: "bg-[#f04438] text-white",
      warning: "bg-[#f79009] text-white",
      info: "bg-[#0ba5ec] text-white",
      light: "bg-[#98a2b3] text-white",
      dark: "bg-[#1d2939] text-white",
    },
  };

  const sizeClass = sizeStyles[size];
  const colorStyles = variants[variant][color];

  return (
    <span className={`${baseStyles} ${sizeClass} ${colorStyles}`}>
      {startIcon && <span className="mr-1">{startIcon}</span>}
      {children}
      {endIcon && <span className="ml-1">{endIcon}</span>}
    </span>
  );
};

export default Badge;