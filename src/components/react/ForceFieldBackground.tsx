/**
 * ForceFieldBackground.tsx
 * 
 * Interactive particle background using p5.js
 * Adapted for neomorphic design with subtle blue-purple particles
 */

import React, { useEffect, useRef } from 'react';

interface ForceFieldBackgroundProps {
  className?: string;
}

export function ForceFieldBackground({ className = '' }: ForceFieldBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const mouseRef = useRef({ x: 0, y: 0, vx: 0, vy: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resize = () => {
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Particle system
    const particles: Array<{
      x: number;
      y: number;
      originX: number;
      originY: number;
      vx: number;
      vy: number;
      size: number;
      color: string;
    }> = [];

    // Create particles in a grid pattern
    const spacing = 25;
    const cols = Math.ceil(canvas.width / spacing);
    const rows = Math.ceil(canvas.height / spacing);
    
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        if (Math.random() > 0.7) continue; // Skip some for organic feel
        
        const x = i * spacing + spacing / 2;
        const y = j * spacing + spacing / 2;
        
        // Vary the hue around blue-purple (220-260)
        const hue = 230 + Math.random() * 40 - 20;
        const lightness = 50 + Math.random() * 30;
        
        particles.push({
          x,
          y,
          originX: x,
          originY: y,
          vx: 0,
          vy: 0,
          size: 1.5 + Math.random() * 2,
          color: `hsla(${hue}, 60%, ${lightness}%, 0.4)`,
        });
      }
    }

    // Track mouse with smoothing
    let targetX = canvas.width / 2;
    let targetY = canvas.height / 2;
    let currentX = targetX;
    let currentY = targetY;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      targetX = e.clientX - rect.left;
      targetY = e.clientY - rect.top;
    };

    canvas.addEventListener('mousemove', handleMouseMove);

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Smooth mouse following
      currentX += (targetX - currentX) * 0.08;
      currentY += (targetY - currentY) * 0.08;

      // Update and draw particles
      particles.forEach((p) => {
        // Calculate distance to mouse
        const dx = p.x - currentX;
        const dy = p.y - currentY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const maxDist = 120;

        // Force field effect
        if (dist < maxDist && dist > 0) {
          const force = (maxDist - dist) / maxDist;
          const angle = Math.atan2(dy, dx);
          const pushStrength = force * 3;
          
          p.vx += Math.cos(angle) * pushStrength;
          p.vy += Math.sin(angle) * pushStrength;
        }

        // Apply friction
        p.vx *= 0.92;
        p.vy *= 0.92;

        // Return to origin (spring force)
        const homeDx = p.originX - p.x;
        const homeDy = p.originY - p.y;
        p.vx += homeDx * 0.03;
        p.vy += homeDy * 0.03;

        // Update position
        p.x += p.vx;
        p.y += p.vy;

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();

        // Draw connection to origin (subtle trail)
        const trailDist = Math.sqrt(
          Math.pow(p.x - p.originX, 2) + 
          Math.pow(p.y - p.originY, 2)
        );
        if (trailDist > 5) {
          ctx.beginPath();
          ctx.moveTo(p.originX, p.originY);
          ctx.lineTo(p.x, p.y);
          ctx.strokeStyle = `hsla(230, 60%, 60%, ${0.1 * (trailDist / 50)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className={`absolute inset-0 pointer-events-auto overflow-hidden ${className}`}
      style={{ zIndex: 0 }}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ opacity: 0.6 }}
      />
    </div>
  );
}

export default ForceFieldBackground;
