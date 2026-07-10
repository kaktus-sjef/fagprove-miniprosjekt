import { useEffect, useRef } from "react";
import "./networkBackground.css";

type IconType = "shield" | "user" | "database" | "document";

type Point = {
  x: number;
  y: number;
  radius: number;
  icon?: IconType;
};

type Edge = {
  from: number;
  to: number;
  phase: number;
  speed: number;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function drawIcon(
  ctx: CanvasRenderingContext2D,
  icon: IconType,
  x: number,
  y: number
) {
  ctx.save();
  ctx.strokeStyle = "rgba(180, 255, 245, 0.95)";
  ctx.lineWidth = 1.6;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  if (icon === "shield") {
    ctx.beginPath();
    ctx.moveTo(x, y - 9);
    ctx.lineTo(x + 8, y - 5);
    ctx.lineTo(x + 6, y + 5);
    ctx.lineTo(x, y + 10);
    ctx.lineTo(x - 6, y + 5);
    ctx.lineTo(x - 8, y - 5);
    ctx.closePath();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(x - 4, y);
    ctx.lineTo(x - 1, y + 3);
    ctx.lineTo(x + 5, y - 4);
    ctx.stroke();
  }

  if (icon === "user") {
    ctx.beginPath();
    ctx.arc(x, y - 4, 4, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(x, y + 8, 8, Math.PI, 0);
    ctx.stroke();
  }

  if (icon === "database") {
    ctx.beginPath();
    ctx.ellipse(x, y - 7, 8, 4, 0, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(x - 8, y - 7);
    ctx.lineTo(x - 8, y + 7);
    ctx.ellipse(x, y + 7, 8, 4, 0, 0, Math.PI);
    ctx.lineTo(x + 8, y - 7);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(x - 8, y);
    ctx.ellipse(x, y, 8, 4, 0, 0, Math.PI);
    ctx.stroke();
  }

  if (icon === "document") {
    ctx.beginPath();
    ctx.moveTo(x - 7, y - 10);
    ctx.lineTo(x + 3, y - 10);
    ctx.lineTo(x + 8, y - 5);
    ctx.lineTo(x + 8, y + 10);
    ctx.lineTo(x - 7, y + 10);
    ctx.closePath();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(x + 3, y - 10);
    ctx.lineTo(x + 3, y - 5);
    ctx.lineTo(x + 8, y - 5);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(x - 3, y);
    ctx.lineTo(x + 4, y);
    ctx.moveTo(x - 3, y + 5);
    ctx.lineTo(x + 4, y + 5);
    ctx.stroke();
  }

  ctx.restore();
}

function NetworkBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let points: Point[] = [];
    let edges: Edge[] = [];
    let animationId = 0;

    const createNetwork = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;

      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const spacing = clamp(width / 10, 70, 120);
      const cols = Math.ceil(width / spacing) + 2;
      const rows = Math.ceil(height / spacing) + 2;

      points = [];

      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const seed = x * 1000 + y * 77;
          const jitterX = (seededRandom(seed) - 0.5) * spacing * 0.65;
          const jitterY = (seededRandom(seed + 30) - 0.5) * spacing * 0.65;

          points.push({
            x: x * spacing + jitterX - spacing / 2,
            y: y * spacing + jitterY - spacing / 2,
            radius: seededRandom(seed + 10) > 0.82 ? 3 : 2,
          });
        }
      }

      const iconNodes: Point[] = [
        { x: width * 0.18, y: height * 0.24, radius: 22, icon: "shield" },
        { x: width * 0.78, y: height * 0.33, radius: 22, icon: "user" },
        { x: width * 0.68, y: height * 0.69, radius: 22, icon: "database" },
        { x: width * 0.38, y: height * 0.82, radius: 22, icon: "document" },
      ];

      points.push(...iconNodes);

      const edgeMap = new Set<string>();
      edges = [];

      points.forEach((point, index) => {
        const nearest = points
          .map((otherPoint, otherIndex) => {
            const dx = point.x - otherPoint.x;
            const dy = point.y - otherPoint.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            return {
              index: otherIndex,
              distance,
            };
          })
          .filter((item) => item.index !== index && item.distance < spacing * 1.45)
          .sort((a, b) => a.distance - b.distance)
          .slice(0, 3);

        nearest.forEach((item) => {
          const a = Math.min(index, item.index);
          const b = Math.max(index, item.index);
          const key = `${a}-${b}`;

          if (!edgeMap.has(key)) {
            edgeMap.add(key);

            edges.push({
              from: a,
              to: b,
              phase: seededRandom(a * 99 + b * 23),
              speed: 0.35 + seededRandom(a * 31 + b * 11) * 0.8,
            });
          }
        });
      });
    };

    const drawBackground = () => {
      const gradient = ctx.createRadialGradient(
        width * 0.5,
        height * 0.35,
        0,
        width * 0.5,
        height * 0.35,
        Math.max(width, height)
      );

      gradient.addColorStop(0, "#12363d");
      gradient.addColorStop(0.45, "#0b2029");
      gradient.addColorStop(1, "#06131c");

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
    };

    const draw = (time: number) => {
      ctx.clearRect(0, 0, width, height);
      drawBackground();

      ctx.save();

      edges.forEach((edge) => {
        const from = points[edge.from];
        const to = points[edge.to];

        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);
        ctx.strokeStyle = "rgba(91, 226, 218, 0.16)";
        ctx.lineWidth = 1;
        ctx.stroke();

        const progress = (time * 0.00018 * edge.speed + edge.phase) % 1;

        const pulseX = from.x + (to.x - from.x) * progress;
        const pulseY = from.y + (to.y - from.y) * progress;

        const trailProgress = Math.max(progress - 0.08, 0);
        const trailX = from.x + (to.x - from.x) * trailProgress;
        const trailY = from.y + (to.y - from.y) * trailProgress;

        ctx.beginPath();
        ctx.moveTo(trailX, trailY);
        ctx.lineTo(pulseX, pulseY);
        ctx.strokeStyle = "rgba(90, 255, 235, 0.65)";
        ctx.lineWidth = 1.6;
        ctx.shadowColor = "rgba(90, 255, 235, 0.9)";
        ctx.shadowBlur = 8;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(pulseX, pulseY, 2.2, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(170, 255, 245, 0.95)";
        ctx.shadowBlur = 12;
        ctx.fill();

        ctx.shadowBlur = 0;
      });

      points.forEach((point) => {
        if (point.icon) {
          ctx.beginPath();
          ctx.arc(point.x, point.y, point.radius, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(7, 23, 30, 0.75)";
          ctx.fill();

          ctx.beginPath();
          ctx.arc(point.x, point.y, point.radius, 0, Math.PI * 2);
          ctx.strokeStyle = "rgba(84, 255, 232, 0.75)";
          ctx.lineWidth = 1.4;
          ctx.shadowColor = "rgba(84, 255, 232, 0.75)";
          ctx.shadowBlur = 10;
          ctx.stroke();

          ctx.shadowBlur = 0;
          drawIcon(ctx, point.icon, point.x, point.y);
        } else {
          ctx.beginPath();
          ctx.arc(point.x, point.y, point.radius, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(118, 255, 240, 0.85)";
          ctx.shadowColor = "rgba(118, 255, 240, 0.8)";
          ctx.shadowBlur = 6;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      });

      ctx.restore();

      animationId = requestAnimationFrame(draw);
    };

    createNetwork();
    animationId = requestAnimationFrame(draw);

    window.addEventListener("resize", createNetwork);

    return () => {
      window.removeEventListener("resize", createNetwork);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return <canvas ref={canvasRef} className="network-background" />;
}

export default NetworkBackground;