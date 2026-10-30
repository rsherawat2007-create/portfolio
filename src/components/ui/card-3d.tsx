"use client";

import React, { useRef, useState, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";

interface Card3DProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  maxRotation?: number; // Maximum rotation in degrees (default 8)
  enableSpotlight?: boolean;
  spotlightColor?: string;
  glowOnHover?: boolean;
}

export function Card3D({
  children,
  className,
  maxRotation = 8,
  enableSpotlight = true,
  spotlightColor = "rgba(59, 130, 246, 0.18)",
  glowOnHover = true,
  ...props
}: Card3DProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<React.CSSProperties>({});
  const [isHovered, setIsHovered] = useState(false);
  const [spotlightPos, setSpotlightPos] = useState({ x: 0, y: 0 });
  const [canHover, setCanHover] = useState(true);

  useEffect(() => {
    // Disable 3D tilt on devices that don't support hover or if user prefers reduced motion
    const hoverQuery = window.matchMedia("(hover: hover)");
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const updateCapabilities = () => {
      setCanHover(hoverQuery.matches && !motionQuery.matches);
    };

    updateCapabilities();
    hoverQuery.addEventListener("change", updateCapabilities);
    motionQuery.addEventListener("change", updateCapabilities);

    return () => {
      hoverQuery.removeEventListener("change", updateCapabilities);
      motionQuery.removeEventListener("change", updateCapabilities);
    };
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!cardRef.current || !canHover) return;

      const rect = cardRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      setSpotlightPos({ x, y });

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      // Calculate normalized rotation (-1 to 1)
      const rotateX = ((y - centerY) / centerY) * -maxRotation;
      const rotateY = ((x - centerX) / centerX) * maxRotation;

      setStyle({
        transform: `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateZ(12px) scale3d(1.015, 1.015, 1.015)`,
        transition: "transform 0.08s ease-out",
      });
    },
    [canHover, maxRotation]
  );

  const handleMouseEnter = useCallback(() => {
    if (!canHover) return;
    setIsHovered(true);
  }, [canHover]);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    setStyle({
      transform: "perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px) scale3d(1, 1, 1)",
      transition: "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.3s ease",
    });
  }, []);

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={style}
      className={cn(
        "relative rounded-2xl border border-[#22293d] bg-[#111726]/85 backdrop-blur-md",
        "transition-all duration-300 overflow-hidden",
        isHovered && glowOnHover && "border-blue-500/40 shadow-xl shadow-blue-950/20",
        className
      )}
      {...props}
    >
      {/* Dynamic Cursor Spotlight Overlay */}
      {enableSpotlight && isHovered && canHover && (
        <div
          className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-300"
          style={{
            background: `radial-gradient(350px circle at ${spotlightPos.x}px ${spotlightPos.y}px, ${spotlightColor}, transparent 70%)`,
          }}
        />
      )}

      {/* Card Content with subtle 3D separation */}
      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </div>
  );
}
