"use client";

import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  baseOpacity: number;
}

interface MousePosition {
  x: number;
  y: number;
}

const WorldMap: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef<MousePosition>({ x: -1000, y: -1000 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Mouse tracking for hover effects
    const handleMouseMove = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
      };
    };

    const handleMouseLeave = () => {
      mouseRef.current = { x: -1000, y: -1000 };
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    // Initialize particles with 80 count and soft blue color
    const initParticles = () => {
      const particles: Particle[] = [];
      const particleCount = 80; // Increased count as requested
      const margin = 50;
      
      for (let i = 0; i < particleCount; i++) {
        const baseOpacity = 0.6 + Math.random() * 0.4; // Slight opacity variations
        
        particles.push({
          x: margin + Math.random() * (canvas.width - 2 * margin),
          y: margin + Math.random() * (canvas.height - 2 * margin),
          vx: (Math.random() - 0.5) * 0.4, // Subtle motion in random directions
          vy: (Math.random() - 0.5) * 0.4,
          size: 2 + Math.random() * 1, // Smaller, more consistent sizes
          opacity: baseOpacity,
          baseOpacity: baseOpacity
        });
      }
      particlesRef.current = particles;
    };

    initParticles();

    const getDistance = (p1: Particle, p2: Particle) => {
      return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
    };

    const animate = () => {
      // Deep black background
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const particles = particlesRef.current;
      const connectionDistance = 120; // Adjusted for more connections with 80 particles
      const time = Date.now() * 0.001;
      const mouse = mouseRef.current;
      const mouseInfluenceRadius = 100;

      // Update particle positions with organic motion
      particles.forEach((particle, index) => {
        // Add subtle sine wave motion for organic feel
        const waveX = Math.sin(time * 0.5 + index * 0.3) * 0.1;
        const waveY = Math.cos(time * 0.3 + index * 0.5) * 0.1;
        
        particle.x += particle.vx + waveX;
        particle.y += particle.vy + waveY;

        // Smooth edge bouncing with gradual direction change
        const edgeBuffer = 60;
        if (particle.x <= edgeBuffer || particle.x >= canvas.width - edgeBuffer) {
          particle.vx *= -0.8; // Softer bounce
        }
        if (particle.y <= edgeBuffer || particle.y >= canvas.height - edgeBuffer) {
          particle.vy *= -0.8;
        }

        // Keep particles in bounds
        particle.x = Math.max(edgeBuffer, Math.min(canvas.width - edgeBuffer, particle.x));
        particle.y = Math.max(edgeBuffer, Math.min(canvas.height - edgeBuffer, particle.y));

        // Update opacity with subtle breathing effect
        particle.opacity = particle.baseOpacity + Math.sin(time * 2 + index) * 0.15;
      });

      // Draw connections with smooth appear/disappear transitions and hover effects
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const distance = getDistance(particles[i], particles[j]);
          
          if (distance < connectionDistance) {
            // Smooth opacity transition based on distance
            const proximityFactor = 1 - (distance / connectionDistance);
            let lineOpacity = Math.pow(proximityFactor, 2) * 0.3; // Thinner, more semi-transparent
            
            // Check if mouse is near either particle for hover effect
            const mouseDistanceToP1 = Math.sqrt((mouse.x - particles[i].x) ** 2 + (mouse.y - particles[i].y) ** 2);
            const mouseDistanceToP2 = Math.sqrt((mouse.x - particles[j].x) ** 2 + (mouse.y - particles[j].y) ** 2);
            
            if (mouseDistanceToP1 < mouseInfluenceRadius || mouseDistanceToP2 < mouseInfluenceRadius) {
              lineOpacity *= 2.5; // Brighten lines when mouse is near
            }
            
            if (lineOpacity > 0.02) { // Only draw visible lines
              // Thin, soft line with soft blue color (#00aaff)
              ctx.shadowColor = '#00aaff';
              ctx.shadowBlur = 3;
              ctx.strokeStyle = `rgba(0, 170, 255, ${lineOpacity})`;
              ctx.lineWidth = 0.8; // Thinner lines
              ctx.globalAlpha = 1;
              
              ctx.beginPath();
              ctx.moveTo(particles[i].x, particles[i].y);
              ctx.lineTo(particles[j].x, particles[j].y);
              ctx.stroke();
            }
          }
        }
      }

      // Reset shadow for particles
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;

      // Draw particles with soft blue glow (#00aaff)
      particles.forEach((particle, index) => {
        const pulsePhase = time * 1.2 + index * 0.5;
        const pulseIntensity = 0.9 + Math.sin(pulsePhase) * 0.1;
        const currentOpacity = particle.opacity * pulseIntensity;
        
        // Check if mouse is near this particle
        const mouseDistance = Math.sqrt((mouse.x - particle.x) ** 2 + (mouse.y - particle.y) ** 2);
        const hoverEffect = mouseDistance < mouseInfluenceRadius ? 1.5 : 1;
        
        // Outer soft glow with soft blue color
        ctx.shadowColor = '#00aaff';
        ctx.shadowBlur = 8 * hoverEffect;
        ctx.fillStyle = `rgba(0, 170, 255, ${currentOpacity * 0.3 * hoverEffect})`;
        ctx.globalAlpha = 1;
        
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size + 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Inner core
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.fillStyle = `rgba(0, 170, 255, ${currentOpacity * hoverEffect})`;
        
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Bright center point
        ctx.fillStyle = `rgba(255, 255, 255, ${currentOpacity * 0.8 * hoverEffect})`;
        
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * 0.3, 0, Math.PI * 2);
        ctx.fill();
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ background: '#000000' }}
      />
    </div>
  );
};

export default WorldMap;
