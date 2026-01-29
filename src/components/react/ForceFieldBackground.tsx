/**
 * ForceFieldBackground.tsx
 * 
 * Interactive particle background using native Canvas API
 * Fixed coordinate mapping for accurate mouse tracking
 */

import React, { useEffect, useRef } from 'react';

interface ForceFieldBackgroundProps {
  className?: string;
}

export function ForceFieldBackground({ className = '' }: ForceFieldBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const mouseRef = useRef({ x: 0, y: 0 });
  const smoothedMouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to match display size exactly
    const resize = () => {
      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      
      // Set actual canvas pixel dimensions
      canvas.width = Math.floor(rect.width * dpr);
      canvas.height = Math.floor(rect.height * dpr);
      
      // Scale context for retina displays
      ctx.scale(dpr, dpr);
      
      // Set display size via CSS
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      
      return { width: rect.width, height: rect.height };
    };
    
    const size = resize();
    window.addEventListener('resize', () => resize());

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
    const spacing = 30;
    const cols = Math.ceil(size.width / spacing);
    const rows = Math.ceil(size.height / spacing);
    
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        if (Math.random() > 0.6) continue;
        
        const x = i * spacing + spacing / 2;
        const y = j * spacing + spacing / 2;
        
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
          color: `hsla(${hue}, 60%, ${lightness}%, 0.35)`,
        });
      }
    }

    // Track mouse relative to viewport (since canvas is fixed)
    const handleMouseMove = (e: MouseEvent) => {
      // Get canvas position relative to viewport
      const rect = canvas.getBoundingClientRect();
      
      // Calculate mouse position in canvas coordinates
      // This accounts for any CSS scaling or positioning
      const scaleX = canvas.width / (window.devicePixelRatio || 1) / rect.width;
      const scaleY = canvas.height / (window.devicePixelRatio || 1) / rect.height;
      
      mouseRef.current.x = (e.clientX - rect.left) * scaleX;
      mouseRef.current.y = (e.clientY - rect.top) * scaleY;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Animation loop
    const animate = () => {
      // Get CSS pixel dimensions
      const cssWidth = canvas.width / (window.devicePixelRatio || 1);
      const cssHeight = canvas.height / (window.devicePixelRatio || 1);
      
      ctx.clearRect(0, 0, cssWidth, cssHeight);

      // Smooth mouse following
      smoothedMouseRef.current.x += (mouseRef.current.x - smoothedMouseRef.current.x) * 0.1;
      smoothedMouseRef.current.y += (mouseRef.current.y - smoothedMouseRef.current.y) * 0.1;

      const mx = smoothedMouseRef.current.x;
      const my = smoothedMouseRef.current.y;

      // Update and draw particles
      particles.forEach((p) => {
        const dx = p.x - mx;
        const dy = p.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const maxDist = 100;

        // Force field effect
        if (dist < maxDist && dist > 0) {
          const force = (maxDist - dist) / maxDist;
          const angle = Math.atan2(dy, dx);
          const pushStrength = force * 2.5;
          
          p.vx += Math.cos(angle) * pushStrength;
          p.vy += Math.sin(angle) * pushStrength;
        }

        // Apply friction
        p.vx *= 0.94;
        p.vy *= 0.94;

        // Return to origin
        p.vx += (p.originX - p.x) * 0.04;
        p.vy += (p.originY - p.y) * 0.04;

        // Update position
        p.x += p.vx;
        p.y += p.vy;

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className={`fixed inset-0 pointer-events-none overflow-hidden ${className}`}
      style={{ zIndex: 0 }}
    >
      <canvas
        ref={canvasRef}
        className="block w-full h-full"
        style={{ opacity: 0.5 }}
      />
    </div>
  );
}

export default ForceFieldBackground;
