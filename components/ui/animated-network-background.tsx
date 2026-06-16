"use client";

import React, { useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  opacity: number;
}

interface Connection {
  node1: Node;
  node2: Node;
  opacity: number;
  distance: number;
}

const AnimatedNetworkBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const nodesRef = useRef<Node[]>([]);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const createNodes = () => {
      const nodeCount = Math.floor((canvas.width * canvas.height) / 15000);
      nodesRef.current = [];

      for (let i = 0; i < nodeCount; i++) {
        nodesRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          radius: Math.random() * 2 + 1,
          opacity: Math.random() * 0.5 + 0.3,
        });
      }
    };

    const updateNodes = () => {
      nodesRef.current.forEach(node => {
        node.x += node.vx;
        node.y += node.vy;

        // Bounce off edges
        if (node.x <= 0 || node.x >= canvas.width) node.vx *= -1;
        if (node.y <= 0 || node.y >= canvas.height) node.vy *= -1;

        // Keep nodes in bounds
        node.x = Math.max(0, Math.min(canvas.width, node.x));
        node.y = Math.max(0, Math.min(canvas.height, node.y));

        // Subtle opacity animation
        node.opacity += (Math.random() - 0.5) * 0.02;
        node.opacity = Math.max(0.1, Math.min(0.8, node.opacity));
      });
    };

    const getConnections = (): Connection[] => {
      const connections: Connection[] = [];
      const maxDistance = 120;

      for (let i = 0; i < nodesRef.current.length; i++) {
        for (let j = i + 1; j < nodesRef.current.length; j++) {
          const node1 = nodesRef.current[i];
          const node2 = nodesRef.current[j];
          const distance = Math.sqrt(
            Math.pow(node1.x - node2.x, 2) + Math.pow(node1.y - node2.y, 2)
          );

          if (distance < maxDistance) {
            const opacity = (1 - distance / maxDistance) * 0.3;
            connections.push({ node1, node2, opacity, distance });
          }
        }
      }

      return connections;
    };

    const draw = () => {
      // Determine if we're in dark mode
      const isDarkMode = resolvedTheme === 'dark' || 
        (resolvedTheme === 'system' && 
         typeof window !== 'undefined' && 
         window.matchMedia('(prefers-color-scheme: dark)').matches);

      // Set background color based on theme
      if (isDarkMode) {
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }

      // Theme-based colors and opacity adjustments
      const nodeColor = isDarkMode ? '#0ea5e9' : '#0ea5e9';
      const lineColor = isDarkMode ? '#0ea5e9' : '#0ea5e9';
      const glowColor = isDarkMode ? '#0ea5e9' : '#0ea5e9';

      // Draw connections
      const connections = getConnections();
      connections.forEach(connection => {
        ctx.beginPath();
        ctx.moveTo(connection.node1.x, connection.node1.y);
        ctx.lineTo(connection.node2.x, connection.node2.y);
        
        const alpha = connection.opacity * (isDarkMode ? 0.6 : 0.4);
        ctx.strokeStyle = `${lineColor}${Math.floor(alpha * 255).toString(16).padStart(2, '0')}`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      });

      // Draw nodes
      nodesRef.current.forEach(node => {
        // Outer glow
        const gradient = ctx.createRadialGradient(
          node.x, node.y, 0,
          node.x, node.y, node.radius * 4
        );
        
        const glowAlpha = node.opacity * (isDarkMode ? 0.3 : 0.15);
        gradient.addColorStop(0, `${glowColor}${Math.floor(glowAlpha * 255).toString(16).padStart(2, '0')}`);
        gradient.addColorStop(1, 'transparent');
        
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius * 4, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Inner node
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        
        const nodeAlpha = node.opacity * (isDarkMode ? 0.8 : 0.5);
        ctx.fillStyle = `${nodeColor}${Math.floor(nodeAlpha * 255).toString(16).padStart(2, '0')}`;
        ctx.fill();

        // Core highlight
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius * 0.3, 0, Math.PI * 2);
        ctx.fillStyle = isDarkMode ? '#ffffff40' : '#ffffff80';
        ctx.fill();
      });
    };

    const animate = () => {
      updateNodes();
      draw();
      animationRef.current = requestAnimationFrame(animate);
    };

    resizeCanvas();
    createNodes();
    animate();

    const handleResize = () => {
      resizeCanvas();
      createNodes();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [resolvedTheme]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none -z-10"
      style={{
        background: 'transparent',
      }}
    />
  );
};

export default AnimatedNetworkBackground;
