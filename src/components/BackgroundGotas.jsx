import { useEffect, useRef } from "react";
import "./BackgroundGotas.css";

function criarGotas(largura, altura, cores) {
    const raioBase = Math.max(46, Math.min(largura, altura) * 0.1);

    return Array.from({ length: 7 }, (_, indice) => ({
        x: Math.random() * largura,
        y: Math.random() * altura,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        raio: raioBase * (0.75 + Math.random() * 0.55),
        cor: cores[indice % cores.length],
    }));
}

function BackgroundGotas({ cores }) {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const contexto = canvas?.getContext("2d");
        if (!canvas || !contexto) return undefined;

        let largura = 0;
        let altura = 0;
        let proporcaoPixel = 1;
        let gotas = [];
        let quadro = null;
        let ultimoDesenho = 0;
        const movimentoReduzido = window.matchMedia("(prefers-reduced-motion: reduce)");

        function medir() {
            proporcaoPixel = Math.min(window.devicePixelRatio || 1, 1.5);
            largura = window.innerWidth;
            altura = window.innerHeight;
            canvas.width = Math.round(largura * proporcaoPixel);
            canvas.height = Math.round(altura * proporcaoPixel);
            contexto.setTransform(proporcaoPixel, 0, 0, proporcaoPixel, 0, 0);
            gotas = criarGotas(largura, altura, cores);
            desenhar(false);
        }

        function desenhar(animar) {
            contexto.clearRect(0, 0, largura, altura);

            gotas.forEach((gota) => {
                if (animar) {
                    gota.x += gota.vx;
                    gota.y += gota.vy;

                    if (gota.x < gota.raio || gota.x > largura - gota.raio) gota.vx *= -1;
                    if (gota.y < gota.raio || gota.y > altura - gota.raio) gota.vy *= -1;
                }

                contexto.beginPath();
                contexto.arc(gota.x, gota.y, gota.raio, 0, Math.PI * 2);
                contexto.fillStyle = gota.cor;
                contexto.fill();
            });
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
            if (document.hidden) return;

            if (movimentoReduzido.matches) {
                desenhar(false);
                return;
            }

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
    }, [cores]);

    return <canvas ref={canvasRef} className="background-gotas" aria-hidden="true" />;
}

export default BackgroundGotas;