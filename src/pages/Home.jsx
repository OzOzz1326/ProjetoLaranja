import { useEffect, useRef } from "react";
import "./Home.css"
import { Link } from "react-router-dom";
import { esportes } from "../esportes";
import Sobre from "./Sobre";

function Home() {
  const heroRef = useRef(null);
  const tituloRef = useRef(null);

  /* ── Parallax suave no título ao rolar ── */
  useEffect(() => {
    const titulo = tituloRef.current;
    if (!titulo) return;

    function onScroll() {
      const y = window.scrollY;
      titulo.style.transform = `translateY(${y * 0.28}px)`;
      titulo.style.opacity = Math.max(0, 1 - y / 420);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* ── Intersection Observer: revela cards ao entrar na viewport ── */
  useEffect(() => {
    const cards = document.querySelectorAll(".card-esporte");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visivel");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    cards.forEach((card) => observer.observe(card));
    return () => observer.disconnect();
  }, []);

  return (
    <main id="pagina-inicial" className="pagina-inicial">
      <section className="selecao-esportes" ref={heroRef} aria-label="Escolha um esporte">

        {/* Partículas decorativas de fundo */}
        <div className="hero-orbes" aria-hidden="true">
          <span className="orbe orbe-1" />
          <span className="orbe orbe-2" />
          <span className="orbe orbe-3" />
        </div>

        {/* Título com parallax */}
        <div className="hero-cabecalho" ref={tituloRef}>
          <span className="hero-pretitulo">Bem-vindo ao</span>
          <h1 className="marca-inicial">Sport In City</h1>
          <p className="hero-descricao">
            Uma nova forma de praticar esporte.
          </p>
        </div>

        {/* Cards dos esportes */}
        <div className="lista-esportes">
          {esportes.map((esporte, i) => (
            <Link
              className={`card-esporte card-esporte-${esporte.valor}`}
              key={esporte.valor}
              to={`/quadras?esporte=${encodeURIComponent(esporte.valor)}`}
              style={{ "--delay": `${i * 80}ms` }}
            >
              <span className="card-esporte-icone" aria-hidden="true" />
              <span className="nome-esporte">{esporte.nome}</span>
              <span className="seta-esporte" aria-hidden="true">→</span>
            </Link>
          ))}
        </div>

        {/* Indicador de scroll */}
        <a
          className="indicador-scroll"
          href="#pagina-sobre"
          aria-label="Rolar para Sobre nós"
          onClick={() => window.dispatchEvent(new Event("sportincity:show-navigation"))}
        >
          <span className="scroll-linha" aria-hidden="true" />
          <span className="scroll-texto">Role para explorar</span>
        </a>
      </section>

      <Sobre embutido />
    </main>
  );
}

export default Home;