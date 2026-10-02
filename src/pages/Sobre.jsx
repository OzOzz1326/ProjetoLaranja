import { Link } from "react-router-dom";
import { useEffect, useRef } from "react";
import "./Sobre.css";

/* Estatísticas exibidas na seção de impacto */
const STATS = [
  { valor: "4", sufixo: "+", rotulo: "Modalidades" },
  { valor: "100", sufixo: "%", rotulo: "Gratuito" },
  { valor: "∞", sufixo: "", rotulo: "Possibilidades" },
];

/* Pilares do projeto — bento grid */
const PILARES = [
  {
    icone: "🏟️",
    titulo: "Encontre quadras perto de você",
    descricao:
      "Consulte espaços disponíveis na sua cidade, filtre por modalidade e planeje sua próxima partida com facilidade.",
    destaque: true,
  },
  {
    icone: "⚡",
    titulo: "Simples e direto",
    descricao: "Sem cadastros desnecessários para explorar. Navegue, veja e decida.",
  },
  {
    icone: "🤝",
    titulo: "Para jogadores e proprietários",
    descricao: "Quem joga encontra onde jogar. Quem tem quadra ganha visibilidade.",
  },
  {
    icone: "🏙️",
    titulo: "A cidade em movimento",
    descricao:
      "O esporte une pessoas e dinamiza bairros. O Sport In City quer ser parte disso.",
    destaque: false,
  },
];

function Sobre({ embutido = false }) {
  const ElementoRaiz = embutido ? "section" : "main";
  const raizRef = useRef(null);
  const statsRef = useRef(null);
  const pilaresRef = useRef(null);

  /* Reveal por IntersectionObserver — escopo dentro do componente */
  useEffect(() => {
    const raiz = raizRef.current;
    if (!raiz) return;

    const alvos = raiz.querySelectorAll(".sobre-reveal, .stat-item, .pilar-card");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visivel");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
    );

    alvos.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={raizRef}>
    <ElementoRaiz id="pagina-sobre">

      {/* ── HERO DA SEÇÃO ─────────────────────────────── */}
      <section className="sobre-hero" aria-labelledby="titulo-sobre">
        <div className="sobre-hero-conteudo sobre-reveal">
          <span className="sobre-badge">SPORT IN CITY</span>
          <h1 id="titulo-sobre">
            O esporte acontece<br />
            <em>quando a cidade se encontra.</em>
          </h1>
          <p>
            Uma plataforma que aproxima pessoas, modalidades
            esportivas e espaços disponíveis na cidade.
          </p>
          <div className="sobre-hero-acoes">
            <Link className="btn-sobre btn-primario" to="/quadras">
              Explorar quadras
            </Link>
            <Link className="btn-sobre btn-secundario" to="/contato">
              Cadastrar quadra
            </Link>
          </div>
        </div>

        {/* Decoração geométrica */}
        <div className="sobre-hero-deco" aria-hidden="true">
          <div className="deco-anel deco-anel-1" />
          <div className="deco-anel deco-anel-2" />
          <div className="deco-ponto deco-ponto-1" />
          <div className="deco-ponto deco-ponto-2" />
        </div>
      </section>

      {/* ── STATS ─────────────────────────────────────── */}
      <div className="sobre-stats sobre-reveal" ref={statsRef} aria-label="Números do projeto">
        {STATS.map((s) => (
          <div className="stat-item" key={s.rotulo}>
            <span className="stat-valor">
              {s.valor}
              <span className="stat-sufixo">{s.sufixo}</span>
            </span>
            <span className="stat-rotulo">{s.rotulo}</span>
          </div>
        ))}
      </div>

      {/* ── BENTO GRID — PILARES ──────────────────────── */}
      <section
        className="sobre-pilares"
        ref={pilaresRef}
        aria-label="O que o Sport In City oferece"
      >
        <div className="pilares-label sobre-reveal">
          <span>NOSSA PROPOSTA</span>
        </div>

        <div className="pilares-grid">
          {PILARES.map((p, i) => (
            <article
              className={`pilar-card${p.destaque ? " pilar-destaque" : ""}`}
              key={p.titulo}
              style={{ "--delay-pilar": `${i * 90}ms` }}
            >
              <span className="pilar-icone" aria-hidden="true">
                {p.icone}
              </span>
              <h2 className="pilar-titulo">{p.titulo}</h2>
              <p className="pilar-desc">{p.descricao}</p>

              {p.destaque && (
                <div className="pilar-brilho" aria-hidden="true" />
              )}
            </article>
          ))}
        </div>
      </section>

      {/* ── MISSÃO ────────────────────────────────────── */}
      <section className="sobre-missao sobre-reveal" aria-label="Nossa missão">
        <div className="missao-linha" aria-hidden="true" />
        <div className="missao-conteudo">
          <p className="missao-rotulo">DEIXAR O PRÓXIMO JOGO MAIS PERTO</p>
          <h2 className="missao-titulo">
            Um espaço para todo mundo que quer jogar.
          </h2>
          <p className="missao-descricao">
            O Sport In City é um projeto integrador que conecta quem quer praticar
            esportes aos espaços disponíveis na cidade. A proposta é facilitar
            a busca por quadras e ajudar cada pessoa a encontrar um lugar para jogar —
            sem burocracia, sem complicação.
          </p>
        </div>
      </section>

      {/* ── CTA FINAL ─────────────────────────────────── */}
      <section className="sobre-cta sobre-reveal" aria-labelledby="titulo-cta">
        <div className="cta-inner">
          <p className="cta-badge">FAÇA PARTE</p>
          <h2 id="titulo-cta">Vamos colocar a cidade em movimento?</h2>
          <div className="cta-acoes">
            <Link className="btn-sobre btn-primario" to="/quadras">
              Explorar quadras
            </Link>
            <Link className="btn-sobre btn-secundario" to="/contato">
              Cadastre sua quadra
            </Link>
          </div>
        </div>
      </section>

    </ElementoRaiz>
    </div>
  );
}

export default Sobre;
