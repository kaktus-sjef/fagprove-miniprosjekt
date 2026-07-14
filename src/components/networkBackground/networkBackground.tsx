import { useEffect, useRef } from "react";
import "./networkBackground.css";

type IconType = "shield" | "user" | "database" | "document";

type Point = {
    x: number;
    y: number;
    radius: number;
    icon?: IconType;
    isHub?: boolean;
};

type Edge = {
    from: number;
    to: number;
    phase: number;
    speed: number;
    animated: boolean;
};

function clamp(value: number, min: number, max: number) {
    return Math.min(Math.max(value, min), max);
}

function seededRandom(seed: number) {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
}

function getDistance(a: Point, b: Point) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
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

            if (width === 0 || height === 0) return;

            const dpr = window.devicePixelRatio || 1;

            canvas.width = width * dpr;
            canvas.height = height * dpr;

            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

            points = [];
            edges = [];

            const area = width * height;
            const baseSize = Math.sqrt(area);

            const minDistance = clamp(baseSize / 23, 44, 72);
            const maxConnectionDistance = minDistance * 3.3;
            const pointCount = Math.floor(clamp(area / 15000, 55, 140));

            let attempts = 0;
            const maxAttempts = pointCount * 100;

            while (points.length < pointCount && attempts < maxAttempts) {
                attempts++;

                const x = seededRandom(attempts * 37 + 11) * width;
                const y = seededRandom(attempts * 91 + 29) * height;

                const tooClose = points.some((point) => {
                    return getDistance(point, { x, y, radius: 0 }) < minDistance;
                });

                if (tooClose) continue;

                const isHub = seededRandom(attempts * 19 + 7) > 0.9;

                points.push({
                    x,
                    y,
                    radius: isHub ? 4.8 : 3.1,
                    isHub,
                });
            }

            const iconNodes: Point[] = [
                {
                    x: width * 0.16,
                    y: height * 0.25,
                    radius: 22,
                    icon: "shield",
                    isHub: true,
                },
                {
                    x: width * 0.78,
                    y: height * 0.33,
                    radius: 22,
                    icon: "user",
                    isHub: true,
                },
                {
                    x: width * 0.68,
                    y: height * 0.69,
                    radius: 22,
                    icon: "database",
                    isHub: true,
                },
                {
                    x: width * 0.37,
                    y: height * 0.83,
                    radius: 22,
                    icon: "document",
                    isHub: true,
                },
            ];

            points.push(...iconNodes);

            const edgeMap = new Set<string>();

            const addEdge = (from: number, to: number) => {
                const a = Math.min(from, to);
                const b = Math.max(from, to);
                const key = `${a}-${b}`;

                if (edgeMap.has(key)) return;

                const distance = getDistance(points[a], points[b]);

                if (distance > maxConnectionDistance) return;

                edgeMap.add(key);

                edges.push({
                    from: a,
                    to: b,
                    phase: seededRandom(a * 99 + b * 23),
                    speed: 0.14 + seededRandom(a * 31 + b * 11) * 0.28,
                    animated: seededRandom(a * 44 + b * 17) > 0.78,
                });
            };

            points.forEach((point, index) => {
                const nearest = points
                    .map((otherPoint, otherIndex) => {
                        return {
                            index: otherIndex,
                            distance: getDistance(point, otherPoint),
                        };
                    })
                    .filter((item) => {
                        return item.index !== index && item.distance < maxConnectionDistance;
                    })
                    .sort((a, b) => a.distance - b.distance);

                let connectionCount = 2;

                if (point.isHub || point.icon) {
                    connectionCount = 5;
                } else if (seededRandom(index * 17 + 3) > 0.72) {
                    connectionCount = 3;
                }

                nearest.slice(0, connectionCount).forEach((item) => {
                    addEdge(index, item.index);
                });
            });

            const hubIndexes = points
                .map((point, index) => ({ point, index }))
                .filter((item) => item.point.isHub || item.point.icon)
                .map((item) => item.index);

            hubIndexes.forEach((hubIndex) => {
                const nearest = points
                    .map((point, index) => {
                        return {
                            index,
                            distance: getDistance(points[hubIndex], point),
                        };
                    })
                    .filter((item) => item.index !== hubIndex)
                    .sort((a, b) => a.distance - b.distance)
                    .slice(0, 6);

                nearest.forEach((item) => {
                    addEdge(hubIndex, item.index);
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

            edges.forEach((edge) => {
                const from = points[edge.from];
                const to = points[edge.to];

                if (!from || !to) return;

                ctx.beginPath();
                ctx.moveTo(from.x, from.y);
                ctx.lineTo(to.x, to.y);
                ctx.strokeStyle = "rgba(91, 226, 218, 0.15)";
                ctx.lineWidth = 1;
                ctx.stroke();

                if (edge.animated) {
                    const progress = (time * 0.00013 * edge.speed + edge.phase) % 1;

                    const pulseX = from.x + (to.x - from.x) * progress;
                    const pulseY = from.y + (to.y - from.y) * progress;

                    const trailProgress = Math.max(progress - 0.08, 0);
                    const trailX = from.x + (to.x - from.x) * trailProgress;
                    const trailY = from.y + (to.y - from.y) * trailProgress;

                    ctx.beginPath();
                    ctx.moveTo(trailX, trailY);
                    ctx.lineTo(pulseX, pulseY);
                    ctx.strokeStyle = "rgba(90, 255, 235, 0.5)";
                    ctx.lineWidth = 1.3;
                    ctx.shadowColor = "rgba(90, 255, 235, 0.8)";
                    ctx.shadowBlur = 7;
                    ctx.stroke();

                    ctx.beginPath();
                    ctx.arc(pulseX, pulseY, 1.9, 0, Math.PI * 2);
                    ctx.fillStyle = "rgba(170, 255, 245, 0.9)";
                    ctx.shadowBlur = 10;
                    ctx.fill();

                    ctx.shadowBlur = 0;
                }
            });

            points.forEach((point) => {
                if (point.icon) {
                    ctx.beginPath();
                    ctx.arc(point.x, point.y, point.radius, 0, Math.PI * 2);
                    ctx.fillStyle = "rgba(7, 23, 30, 0.78)";
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
                    return;
                }

                if (point.isHub) {
                    ctx.beginPath();
                    ctx.arc(point.x, point.y, point.radius + 3, 0, Math.PI * 2);
                    ctx.fillStyle = "rgba(95, 255, 235, 0.08)";
                    ctx.fill();

                    ctx.beginPath();
                    ctx.arc(point.x, point.y, point.radius, 0, Math.PI * 2);
                    ctx.fillStyle = "rgba(140, 255, 245, 0.95)";
                    ctx.shadowColor = "rgba(140, 255, 245, 0.9)";
                    ctx.shadowBlur = 12;
                    ctx.fill();

                    ctx.shadowBlur = 0;
                    return;
                }

                ctx.beginPath();
                ctx.arc(point.x, point.y, point.radius, 0, Math.PI * 2);
                ctx.fillStyle = "rgba(125, 255, 245, 0.9)";
                ctx.shadowColor = "rgba(125, 255, 245, 0.75)";
                ctx.shadowBlur = 7;
                ctx.fill();

                ctx.shadowBlur = 0;
            });

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