/**
 * ForceFieldBackground.tsx
 * 
 * An interactive, particle-based background that reacts to mouse movement.
 * Adapted for the Lock It In neomorphic design theme.
 * 
 * Uses p5.js for high-performance canvas rendering with a magnetic "force field" effect.
 */

import React, { useEffect, useRef, useState } from 'react';
import p5 from 'p5';

export interface ForceFieldBackgroundProps {
  /**
   * URL of the image to use as the base for the particle field
   * @default "https://cdn.pixabay.com/photo/2024/12/13/20/29/alps-9266131_1280.jpg"
   */
  imageUrl?: string;
  /**
   * Base hue for the color palette (0-360)
   * @default 220 (blue-purple for our theme)
   */
  hue?: number;
  /**
   * Color saturation (0-100)
   * @default 70
   */
  saturation?: number;
  /**
   * Brightness threshold for particle visibility (0-255)
   * @default 255
   */
  threshold?: number;
  /**
   * Minimum stroke weight for particles
   * @default 1
   */
  minStroke?: number;
  /**
   * Maximum stroke weight for particles
   * @default 3
   */
  maxStroke?: number;
  /**
   * Spacing between particles (lower = more density)
   * @default 12
   */
  spacing?: number;
  /**
   * Noise scale for particle placement irregularity
   * @default 0
   */
  noiseScale?: number;
  /**
   * Density factor (probability of particle existence)
   * @default 1.5
   */
  density?: number;
  /**
   * Invert the source image brightness mapping
   * @default true
   */
  invertImage?: boolean;
  /**
   * Invert the wireframe/particle visibility condition
   * @default true
   */
  invertWireframe?: boolean;
  /**
   * Enable the magnifier/force field effect
   * @default true
   */
  magnifierEnabled?: boolean;
  /**
   * Radius of the force field effect around the cursor
   * @default 120
   */
  magnifierRadius?: number;
  /**
   * Strength of the force pushing particles away
   * @default 8
   */
  forceStrength?: number;
  /**
   * Friction factor for particle movement (0-1)
   * @default 0.92
   */
  friction?: number;
  /**
   * Speed at which particles return to original position
   * @default 0.04
   */
  restoreSpeed?: number;
  /**
   * Opacity of particles (0-255)
   * @default 100
   */
  particleOpacity?: number;
  /**
   * Additional CSS class names
   */
  className?: string;
}

/**
 * ForceFieldBackground
 * 
 * An interactive, particle-based background that reacts to mouse movement.
 * Adapted for light neomorphic themes with subtle blue-purple particles.
 */
export function ForceFieldBackground({
  imageUrl = "https://cdn.pixabay.com/photo/2024/12/13/20/29/alps-9266131_1280.jpg",
  hue = 230,
  saturation = 60,
  threshold = 255,
  minStroke = 1,
  maxStroke = 3,
  spacing = 12,
  noiseScale = 0,
  density = 1.5,
  invertImage = true,
  invertWireframe = true,
  magnifierEnabled = true,
  magnifierRadius = 120,
  forceStrength = 8,
  friction = 0.92,
  restoreSpeed = 0.04,
  particleOpacity = 120,
  className = "",
}: ForceFieldBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const p5InstanceRef = useRef<p5 | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Keep latest props in ref to access inside p5 closure without re-instantiating
  const propsRef = useRef({
    hue, saturation, threshold, minStroke, maxStroke, spacing, noiseScale, 
    density, invertImage, invertWireframe, magnifierEnabled, magnifierRadius,
    forceStrength, friction, restoreSpeed, particleOpacity
  });

  useEffect(() => {
    propsRef.current = {
      hue, saturation, threshold, minStroke, maxStroke, spacing, noiseScale,
      density, invertImage, invertWireframe, magnifierEnabled, magnifierRadius,
      forceStrength, friction, restoreSpeed, particleOpacity
    };
  }, [hue, saturation, threshold, minStroke, maxStroke, spacing, noiseScale, density, invertImage, invertWireframe, magnifierEnabled, magnifierRadius, forceStrength, friction, restoreSpeed, particleOpacity]);

  useEffect(() => {
    if (!containerRef.current) return;

    // Cleanup previous instance if exists
    if (p5InstanceRef.current) {
      p5InstanceRef.current.remove();
    }

    const sketch = (p: p5) => {
      let originalImg: p5.Image;
      let img: p5.Image;
      let palette: p5.Color[] = [];
      let points: {
        pos: p5.Vector;
        originalPos: p5.Vector;
        vel: p5.Vector;
      }[] = [];
      
      // Internal state tracking to detect changes
      let lastHue = -1;
      let lastSaturation = -1;
      let lastSpacing = -1;
      let lastNoiseScale = -1;
      let lastDensity = -1;
      let lastInvertImage: boolean | null = null;
      let magnifierX = 0;
      let magnifierY = 0;
      let magnifierInertia = 0.08;

      p.preload = () => {
        p.loadImage(
          imageUrl,
          (loadedImg) => {
            originalImg = loadedImg;
            setIsLoading(false);
          },
          () => {
            setError("Failed to load image");
            setIsLoading(false);
          }
        );
      };

      p.setup = () => {
        if (!originalImg) return;
        
        const { clientWidth, clientHeight } = containerRef.current!;
        p.createCanvas(clientWidth, clientHeight);
        
        magnifierX = p.width / 2;
        magnifierY = p.height / 2;

        processImage();
        generatePalette(propsRef.current.hue, propsRef.current.saturation);
        generatePoints();
      };

      p.windowResized = () => {
        if (!containerRef.current || !originalImg) return;
        const { clientWidth, clientHeight } = containerRef.current;
        p.resizeCanvas(clientWidth, clientHeight);
        processImage();
        generatePoints();
      };

      function processImage() {
        if (!originalImg) return;
        img = originalImg.get();
        if (p.width > 0 && p.height > 0) {
          img.resize(p.width, p.height);
        }
        img.filter(p.GRAY);

        if (propsRef.current.invertImage) {
          img.loadPixels();
          for (let i = 0; i < img.pixels.length; i += 4) {
            img.pixels[i] = 255 - img.pixels[i];
            img.pixels[i + 1] = 255 - img.pixels[i + 1];
            img.pixels[i + 2] = 255 - img.pixels[i + 2];
          }
          img.updatePixels();
        }
        lastInvertImage = propsRef.current.invertImage;
      }

      function generatePalette(h: number, s: number) {
        palette = [];
        p.push();
        p.colorMode(p.HSL);
        const alpha = propsRef.current.particleOpacity;
        for (let i = 0; i < 8; i++) {
          let lightness = p.map(i, 0, 7, 85, 40);
          const c = p.color(h, s, lightness);
          c.setAlpha(alpha);
          palette.push(c);
        }
        p.pop();
      }

      function generatePoints() {
        if (!img) return;
        points = [];
        const { spacing, density, noiseScale } = propsRef.current;
        
        const safeSpacing = Math.max(4, spacing);

        for (let y = 0; y < img.height; y += safeSpacing) {
          for (let x = 0; x < img.width; x += safeSpacing) {
            if (p.random() > density) continue;
            
            let nx = p.noise(x * noiseScale, y * noiseScale) - 0.5;
            let ny = p.noise((x + 500) * noiseScale, (y + 500) * noiseScale) - 0.5;
            let px = x + nx * safeSpacing;
            let py = y + ny * safeSpacing;
            
            points.push({
              pos: p.createVector(px, py),
              originalPos: p.createVector(px, py),
              vel: p.createVector(0, 0)
            });
          }
        }
        
        lastSpacing = spacing;
        lastNoiseScale = noiseScale;
        lastDensity = density;
      }

      function applyForceField(mx: number, my: number) {
        const props = propsRef.current;
        if (!props.magnifierEnabled) return;

        for (let pt of points) {
          let dir = p5.Vector.sub(pt.pos, p.createVector(mx, my));
          let d = dir.mag();
          
          if (d < props.magnifierRadius) {
            dir.normalize();
            let force = dir.mult(props.forceStrength / Math.max(1, d));
            pt.vel.add(force);
          }
          
          pt.vel.mult(props.friction);
          
          let restore = p5.Vector.sub(pt.pos, pt.originalPos).mult(-props.restoreSpeed);
          pt.vel.add(restore);
          
          pt.pos.add(pt.vel);
        }
      }

      p.draw = () => {
        if (!img) return;
        
        // Clear with transparent background to show underlying neomorphic design
        p.clear();

        const props = propsRef.current;

        if (props.hue !== lastHue || props.saturation !== lastSaturation) {
          generatePalette(props.hue, props.saturation);
          lastHue = props.hue;
          lastSaturation = props.saturation;
        }

        if (props.invertImage !== lastInvertImage) {
          processImage();
        }

        if (props.spacing !== lastSpacing || props.noiseScale !== lastNoiseScale || props.density !== lastDensity) {
          generatePoints();
        }

        magnifierX = p.lerp(magnifierX, p.mouseX, magnifierInertia);
        magnifierY = p.lerp(magnifierY, p.mouseY, magnifierInertia);

        applyForceField(magnifierX, magnifierY);

        img.loadPixels();
        p.noFill();

        for (let pt of points) {
          let x = pt.pos.x;
          let y = pt.pos.y;
          let d = p.dist(x, y, magnifierX, magnifierY);
          
          let px = p.constrain(p.floor(x), 0, img.width - 1);
          let py = p.constrain(p.floor(y), 0, img.height - 1);
          
          let index = (px + py * img.width) * 4;
          let brightness = img.pixels[index];

          if (brightness === undefined) continue;

          let condition = props.invertWireframe
            ? brightness < props.threshold
            : brightness > props.threshold;

          if (condition) {
            let shadeIndex = Math.floor(p.map(brightness, 0, 255, 0, palette.length - 1));
            shadeIndex = p.constrain(shadeIndex, 0, palette.length - 1);
            
            let strokeSize = p.map(brightness, 0, 255, props.minStroke, props.maxStroke);
            
            if (props.magnifierEnabled && d < props.magnifierRadius) {
              let factor = p.map(d, 0, props.magnifierRadius, 1.5, 1);
              strokeSize *= factor;
            }
            
            if (palette[shadeIndex]) {
              p.stroke(palette[shadeIndex]);
              p.strokeWeight(strokeSize);
              p.point(x, y);
            }
          }
        }
      };
    };

    const myP5 = new p5(sketch, containerRef.current);
    p5InstanceRef.current = myP5;

    return () => {
      myP5.remove();
    };
  }, [imageUrl]);

  return (
    <div 
      className={`absolute inset-0 pointer-events-none ${className}`} 
      ref={containerRef}
      style={{ zIndex: 0 }}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center text-secondary/30 text-xs tracking-widest uppercase">
          Loading...
        </div>
      )}
    </div>
  );
}

export default ForceFieldBackground;
