import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "border-blue-800 bg-blue-950 text-blue-400",
        secondary: "border-[#2a3142] bg-[#222736] text-slate-400",
        destructive: "border-red-800 bg-red-950 text-red-400",
        success: "border-emerald-800 bg-emerald-950 text-emerald-400",
        warning: "border-amber-800 bg-amber-950 text-amber-400",
        outline: "border-[#2a3142] text-slate-400",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
