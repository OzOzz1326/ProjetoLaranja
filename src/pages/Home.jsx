import "./Home.css"
import { Link } from "react-router-dom";

function Home() {
  const esportes = [
    {
      nome: "Futebol",
      descricao: "Encontre campos e horários para montar sua partida.",
      icone: "⚽",
      valor: "futebol",
    },
    {
      nome: "Futvôlei",
      descricao: "Quadras de areia prontas para o seu próximo jogo.",
      icone: "🏐",
      valor: "futvolei",
    },
    {
      nome: "Tênis",
      descricao: "Escolha uma quadra e reserve seu horário.",
      icone: "🎾",
      valor: "tenis",
    },
    {
      nome: "Beach Tênis",
      descricao: "Pratique na areia com quem você gosta.",
      icone: "🏖️",
      valor: "beachtenis",
    },
  ];

  return (
    <main id="pagina-inicial" className="pagina-inicial">
      <section className="cabecalho-inicial">
        <p className="etiqueta-inicial">SPORT IN CITY</p>
        <h1>Qual esporte você quer praticar?</h1>
        <p>Escolha uma modalidade para encontrar quadras disponíveis perto de você.</p>
      </section>

      <section className="lista-esportes" aria-label="Escolha um esporte">
            {esportes.map((esporte) => (
            <Link
                className="card-esporte"
                key={esporte.valor}
                to={`/quadras?esporte=${esporte.valor}`}
            >
                <span className="icone-esporte" aria-hidden="true">{esporte.icone}</span>
                <span className="conteudo-esporte">
                <strong>{esporte.nome}</strong>
                <span>{esporte.descricao}</span>
                </span>
                <span className="seta-esporte" aria-hidden="true">→</span>
            </Link>
            ))}
        </section>
        </main>
  );
}

export default Home;