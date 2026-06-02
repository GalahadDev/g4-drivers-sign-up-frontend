import { useEffect, useRef } from 'react';

interface ParticlesBackgroundProps {
    type: "regular" | "luxury";
}

interface Particle {
    x: number;
    y: number;
    size: number;
    speedX: number;
    speedY: number;
    opacity: number;
}

interface LuxuryOrb {
    x: number;
    y: number;
    radius: number;
    speedX: number;
    speedY: number;
    opacity: number;
    pulsePhase: number;
    pulseSpeed: number;
}

interface LuxuryDust {
    x: number;
    y: number;
    size: number;
    speedY: number;
    speedX: number;
    opacity: number;
    maxOpacity: number;
}

export const ParticlesBackground = ({ type }: ParticlesBackgroundProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        let animationId: number;

        if (type === "luxury") {
            const isMobile = window.innerWidth < 768;

            // Large ambient bokeh orbs — drift very slowly
            const orbCount = isMobile ? 4 : 7;
            const orbs: LuxuryOrb[] = Array.from({ length: orbCount }, () => ({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                radius: (Math.random() * 220 + 140) * (isMobile ? 0.6 : 1),
                speedX: (Math.random() - 0.5) * 0.12,
                speedY: (Math.random() - 0.5) * 0.12,
                opacity: Math.random() * 0.055 + 0.025,
                pulsePhase: Math.random() * Math.PI * 2,
                pulseSpeed: Math.random() * 0.003 + 0.001,
            }));

            // Fine gold dust drifting upward like embers
            const dustCount = isMobile ? 22 : 45;
            const dust: LuxuryDust[] = Array.from({ length: dustCount }, () => ({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                size: Math.random() * 1.2 + 0.4,
                speedY: -(Math.random() * 0.35 + 0.08),
                speedX: (Math.random() - 0.5) * 0.12,
                opacity: Math.random() * 0.45 + 0.1,
                maxOpacity: Math.random() * 0.45 + 0.15,
            }));

            const animate = () => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);

                // Render orbs
                orbs.forEach(orb => {
                    orb.x += orb.speedX;
                    orb.y += orb.speedY;
                    orb.pulsePhase += orb.pulseSpeed;

                    if (orb.x < -orb.radius) orb.x = canvas.width + orb.radius;
                    if (orb.x > canvas.width + orb.radius) orb.x = -orb.radius;
                    if (orb.y < -orb.radius) orb.y = canvas.height + orb.radius;
                    if (orb.y > canvas.height + orb.radius) orb.y = -orb.radius;

                    const pulsed = orb.opacity * (1 + 0.28 * Math.sin(orb.pulsePhase));

                    const grad = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.radius);
                    grad.addColorStop(0, `rgba(201, 168, 76, ${pulsed})`);
                    grad.addColorStop(0.45, `rgba(201, 168, 76, ${pulsed * 0.38})`);
                    grad.addColorStop(1, `rgba(201, 168, 76, 0)`);

                    ctx.beginPath();
                    ctx.fillStyle = grad;
                    ctx.arc(orb.x, orb.y, orb.radius, 0, Math.PI * 2);
                    ctx.fill();
                });

                // Render dust
                dust.forEach(d => {
                    d.y += d.speedY;
                    d.x += d.speedX;

                    const yRatio = d.y / canvas.height;
                    if (yRatio > 0.85) {
                        d.opacity = d.maxOpacity * ((1 - yRatio) / 0.15);
                    } else if (yRatio < 0.08) {
                        d.opacity = d.maxOpacity * (yRatio / 0.08);
                    } else {
                        d.opacity = d.maxOpacity;
                    }

                    if (d.y < -6) {
                        d.y = canvas.height + 6;
                        d.x = Math.random() * canvas.width;
                        d.maxOpacity = Math.random() * 0.45 + 0.15;
                    }
                    if (d.x < 0) d.x = canvas.width;
                    if (d.x > canvas.width) d.x = 0;

                    ctx.beginPath();
                    ctx.arc(d.x, d.y, d.size, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(201, 168, 76, ${d.opacity})`;
                    ctx.fill();
                });

                animationId = requestAnimationFrame(animate);
            };

            animate();
        } else {
            // COMFORT: deep blue/cyan ambient orbs + fine azure drift particles
            const isMobile = window.innerWidth < 768;

            const orbCount = isMobile ? 3 : 5;
            const orbs: LuxuryOrb[] = Array.from({ length: orbCount }, () => ({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                radius: (Math.random() * 260 + 160) * (isMobile ? 0.65 : 1),
                speedX: (Math.random() - 0.5) * 0.14,
                speedY: (Math.random() - 0.5) * 0.14,
                opacity: Math.random() * 0.055 + 0.02,
                pulsePhase: Math.random() * Math.PI * 2,
                pulseSpeed: Math.random() * 0.0028 + 0.001,
            }));

            const dustCount = isMobile ? 20 : 38;
            const dust: LuxuryDust[] = Array.from({ length: dustCount }, () => ({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                size: Math.random() * 1.0 + 0.3,
                speedY: -(Math.random() * 0.28 + 0.06),
                speedX: (Math.random() - 0.5) * 0.1,
                opacity: Math.random() * 0.38 + 0.08,
                maxOpacity: Math.random() * 0.38 + 0.1,
            }));

            const animate = () => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);

                orbs.forEach(orb => {
                    orb.x += orb.speedX;
                    orb.y += orb.speedY;
                    orb.pulsePhase += orb.pulseSpeed;

                    if (orb.x < -orb.radius) orb.x = canvas.width + orb.radius;
                    if (orb.x > canvas.width + orb.radius) orb.x = -orb.radius;
                    if (orb.y < -orb.radius) orb.y = canvas.height + orb.radius;
                    if (orb.y > canvas.height + orb.radius) orb.y = -orb.radius;

                    const pulsed = orb.opacity * (1 + 0.22 * Math.sin(orb.pulsePhase));

                    const grad = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.radius);
                    grad.addColorStop(0, `rgba(59, 130, 246, ${pulsed})`);
                    grad.addColorStop(0.42, `rgba(56, 189, 248, ${pulsed * 0.32})`);
                    grad.addColorStop(1, `rgba(14, 165, 233, 0)`);

                    ctx.beginPath();
                    ctx.fillStyle = grad;
                    ctx.arc(orb.x, orb.y, orb.radius, 0, Math.PI * 2);
                    ctx.fill();
                });

                dust.forEach(d => {
                    d.y += d.speedY;
                    d.x += d.speedX;

                    const yRatio = d.y / canvas.height;
                    if (yRatio > 0.85) {
                        d.opacity = d.maxOpacity * ((1 - yRatio) / 0.15);
                    } else if (yRatio < 0.08) {
                        d.opacity = d.maxOpacity * (yRatio / 0.08);
                    } else {
                        d.opacity = d.maxOpacity;
                    }

                    if (d.y < -6) {
                        d.y = canvas.height + 6;
                        d.x = Math.random() * canvas.width;
                        d.maxOpacity = Math.random() * 0.38 + 0.1;
                    }
                    if (d.x < 0) d.x = canvas.width;
                    if (d.x > canvas.width) d.x = 0;

                    ctx.beginPath();
                    ctx.arc(d.x, d.y, d.size, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(125, 211, 252, ${d.opacity})`;
                    ctx.fill();
                });

                animationId = requestAnimationFrame(animate);
            };

            animate();
        }

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            cancelAnimationFrame(animationId);
        };
    }, [type]);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none"
            style={{ zIndex: 0 }}
        />
    );
};
