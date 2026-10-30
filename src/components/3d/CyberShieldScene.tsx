"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

export function CyberShieldScene() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [webGlSupported, setWebGlSupported] = useState(true);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Check WebGL availability
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2") || canvas.getContext("webgl");
    if (!gl) {
      setWebGlSupported(false);
      return;
    }

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Three.js Scene Setup
    const scene = new THREE.Scene();

    const width = container.clientWidth || 420;
    const height = container.clientHeight || 420;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.z = 7;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // Parent group for all interactive rotation
    const shieldGroup = new THREE.Group();
    scene.add(shieldGroup);

    // 1. Inner Core: Holographic Geodesic Sphere (Cybersecurity Core)
    const coreGeo = new THREE.IcosahedronGeometry(1.9, 1);
    const coreWireMat = new THREE.MeshBasicMaterial({
      color: 0x06b6d4, // Electric cyan
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreWireMat);
    shieldGroup.add(coreMesh);

    // Inner solid core glow
    const innerGeo = new THREE.SphereGeometry(1.2, 16, 16);
    const innerMat = new THREE.MeshBasicMaterial({
      color: 0x1e3a8a, // Deep blue
      wireframe: true,
      transparent: true,
      opacity: 0.25,
    });
    const innerMesh = new THREE.Mesh(innerGeo, innerMat);
    shieldGroup.add(innerMesh);

    // 2. Neural Nodes & Connections (AI / ML Network)
    const nodeCount = 36;
    const nodeCoords: THREE.Vector3[] = [];
    const nodeGeo = new THREE.SphereGeometry(0.045, 8, 8);
    const nodeMat = new THREE.MeshBasicMaterial({ color: 0x10b981 }); // Neon emerald

    const nodesGroup = new THREE.Group();
    for (let i = 0; i < nodeCount; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 2.15 + (Math.random() - 0.5) * 0.3;

      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);

      const pos = new THREE.Vector3(x, y, z);
      nodeCoords.push(pos);

      const nodeMesh = new THREE.Mesh(nodeGeo, nodeMat);
      nodeMesh.position.copy(pos);
      nodesGroup.add(nodeMesh);
    }
    shieldGroup.add(nodesGroup);

    // Line connections between nearby neural nodes
    const linePositions: number[] = [];
    for (let i = 0; i < nodeCoords.length; i++) {
      for (let j = i + 1; j < nodeCoords.length; j++) {
        const dist = nodeCoords[i].distanceTo(nodeCoords[j]);
        if (dist < 1.4) {
          linePositions.push(
            nodeCoords[i].x, nodeCoords[i].y, nodeCoords[i].z,
            nodeCoords[j].x, nodeCoords[j].y, nodeCoords[j].z
          );
        }
      }
    }

    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute("position", new THREE.Float32BufferAttribute(linePositions, 3));
    const lineMat = new THREE.LineBasicMaterial({
      color: 0x3b82f6,
      transparent: true,
      opacity: 0.3,
    });
    const lineSegments = new THREE.LineSegments(lineGeo, lineMat);
    shieldGroup.add(lineSegments);

    // 3. Orbiting Defensive Ring 1 (Cyber Defense Horizon)
    const ring1Geo = new THREE.TorusGeometry(2.6, 0.02, 16, 64);
    const ring1Mat = new THREE.MeshBasicMaterial({
      color: 0x10b981, // Emerald
      transparent: true,
      opacity: 0.5,
    });
    const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
    ring1.rotation.x = Math.PI / 3;
    shieldGroup.add(ring1);

    // 4. Orbiting AI Layer Ring 2 (Machine Learning Vector)
    const ring2Geo = new THREE.TorusGeometry(2.8, 0.015, 16, 64);
    const ring2Mat = new THREE.MeshBasicMaterial({
      color: 0x8b5cf6, // Violet
      transparent: true,
      opacity: 0.45,
    });
    const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2.rotation.y = Math.PI / 4;
    ring2.rotation.x = -Math.PI / 6;
    shieldGroup.add(ring2);

    // 5. Data Particles Field
    const particleCount = 80;
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 8;
      particlePositions[i + 1] = (Math.random() - 0.5) * 8;
      particlePositions[i + 2] = (Math.random() - 0.5) * 6;
    }
    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x60a5fa,
      size: 0.05,
      transparent: true,
      opacity: 0.6,
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(particleSystem);

    // Pointer Interaction (Smooth mouse tilt)
    let mouseX = 0;
    let mouseY = 0;
    let targetRotationX = 0;
    let targetRotationY = 0;

    const handlePointerMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Normalized coordinates (-1 to 1)
      const nx = (x / rect.width) * 2 - 1;
      const ny = -(y / rect.height) * 2 + 1;

      targetRotationY = nx * 0.7;
      targetRotationX = -ny * 0.5;
    };

    const handlePointerLeave = () => {
      targetRotationX = 0;
      targetRotationY = 0;
    };

    window.addEventListener("mousemove", handlePointerMove, { passive: true });
    container.addEventListener("mouseleave", handlePointerLeave);

    // Animation Loop
    let animId: number;
    const startTime = performance.now();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = (performance.now() - startTime) / 1000;

      if (!prefersReducedMotion) {
        // Subtle base idle spin
        coreMesh.rotation.y += 0.003;
        coreMesh.rotation.x += 0.001;

        nodesGroup.rotation.y += 0.0025;
        lineSegments.rotation.y += 0.0025;

        ring1.rotation.z += 0.006;
        ring2.rotation.z -= 0.005;

        particleSystem.rotation.y = elapsed * 0.03;

        // Smooth damping toward mouse target
        shieldGroup.rotation.y += (targetRotationY - shieldGroup.rotation.y) * 0.05;
        shieldGroup.rotation.x += (targetRotationX - shieldGroup.rotation.x) * 0.05;
      }

      renderer.render(scene, camera);
    };

    animate();

    // Handle Resize
    const handleResize = () => {
      if (!container) return;
      const newW = container.clientWidth || 420;
      const newH = container.clientHeight || 420;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };

    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("mousemove", handlePointerMove);
      window.removeEventListener("resize", handleResize);
      container.removeEventListener("mouseleave", handlePointerLeave);

      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }

      // Dispose resources
      coreGeo.dispose();
      coreWireMat.dispose();
      innerGeo.dispose();
      innerMat.dispose();
      nodeGeo.dispose();
      nodeMat.dispose();
      lineGeo.dispose();
      lineMat.dispose();
      ring1Geo.dispose();
      ring1Mat.dispose();
      ring2Geo.dispose();
      ring2Mat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      renderer.dispose();
    };
  }, []);

  if (!webGlSupported) {
    // Elegant SVG fallback for environments without WebGL
    return (
      <div className="w-full h-full flex items-center justify-center p-8">
        <div className="relative w-72 h-72 rounded-full border border-blue-500/30 flex items-center justify-center bg-blue-950/20 backdrop-blur-md animate-pulse-slow">
          <div className="absolute inset-4 rounded-full border border-emerald-500/30 border-dashed animate-spin" style={{ animationDuration: "25s" }} />
          <div className="w-40 h-40 rounded-full border border-cyan-400/40 flex items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-blue-600/20 border border-blue-400 flex items-center justify-center text-xs font-mono text-cyan-300">
              AI / CYBER
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[360px] sm:h-[420px] lg:h-[460px] flex items-center justify-center pointer-events-auto"
      style={{ touchAction: "none" }}
    />
  );
}
