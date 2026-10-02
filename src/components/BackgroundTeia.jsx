import { useEffect, useRef } from "react";
import "./BackgroundTeia.css";

function BackgroundTeia() {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const contexto = canvas?.getContext("2d");
        if (!canvas || !contexto) return undefined;

        let largura = 0;
        let altura = 0;
        let proporcaoPixel = 1;
        let pontos = [];
        let quadro = null;
        let ultimoDesenho = 0;
        const movimentoReduzido = window.matchMedia("(prefers-reduced-motion: reduce)");

        function desenhar(animar) {
            contexto.clearRect(0, 0, largura, altura);

            pontos.forEach((ponto) => {
                if (animar) {
                    ponto.x += ponto.vx;
                    ponto.y += ponto.vy;
                    if (ponto.x < 0 || ponto.x > largura) ponto.vx *= -1;
                    if (ponto.y < 0 || ponto.y > altura) ponto.vy *= -1;
                }

                contexto.fillStyle = "rgba(255, 255, 255, 0.85)";
                contexto.beginPath();
                contexto.arc(ponto.x, ponto.y, 1.6, 0, Math.PI * 2);
                contexto.fill();
            });

            for (let indice = 0; indice < pontos.length; indice += 1) {
                for (let proximo = indice + 1; proximo < pontos.length; proximo += 1) {
                    const distancia = Math.hypot(
                        pontos[indice].x - pontos[proximo].x,
                        pontos[indice].y - pontos[proximo].y,
                    );

                    if (distancia < 92) {
                        contexto.strokeStyle = `rgba(255, 255, 255, ${0.22 * (1 - distancia / 92)})`;
                        contexto.beginPath();
                        contexto.moveTo(pontos[indice].x, pontos[indice].y);
                        contexto.lineTo(pontos[proximo].x, pontos[proximo].y);
                        contexto.stroke();
                    }
                }
            }
        }

        function medir() {
            proporcaoPixel = Math.min(window.devicePixelRatio || 1, 1.5);
            largura = window.innerWidth;
            altura = window.innerHeight;
            canvas.width = Math.round(largura * proporcaoPixel);
            canvas.height = Math.round(altura * proporcaoPixel);
            contexto.setTransform(proporcaoPixel, 0, 0, proporcaoPixel, 0, 0);

            const quantidade = Math.min(46, Math.round(largura / 16));
            pontos = Array.from({ length: quantidade }, () => ({
                x: Math.random() * largura,
                y: Math.random() * altura,
                vx: (Math.random() - 0.5) * 0.45,
                vy: (Math.random() - 0.5) * 0.45,
            }));
            desenhar(false);
        }

        function animar(tempo) {
            if (tempo - ultimoDesenho >= 32) {
                desenhar(true);
                ultimoDesenho = tempo;
            }
            quadro = window.requestAnimationFrame(animar);
        }

        function iniciar() {
            window.cancelAnimationFrame(quadro);
            if (document.hidden || movimentoReduzido.matches) return;
            ultimoDesenho = 0;
            quadro = window.requestAnimationFrame(animar);
        }

        medir();
        iniciar();
        window.addEventListener("resize", medir);
        document.addEventListener("visibilitychange", iniciar);
        movimentoReduzido.addEventListener("change", iniciar);

        return () => {
            window.cancelAnimationFrame(quadro);
            window.removeEventListener("resize", medir);
            document.removeEventListener("visibilitychange", iniciar);
            movimentoReduzido.removeEventListener("change", iniciar);
        };
    }, []);

    return <canvas ref={canvasRef} className="background-teia" aria-hidden="true" />;
}

export default BackgroundTeia;