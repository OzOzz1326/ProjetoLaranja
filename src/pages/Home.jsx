import "./Home.css"
import { Link } from "react-router-dom";
import { esportes } from "../esportes";
import Sobre from "./Sobre";

function Home() {
  return (
    <main id="pagina-inicial" className="pagina-inicial">
      <section className="selecao-esportes" aria-label="Escolha um esporte">
        <div className="lista-esportes">
          {esportes.map((esporte) => (
            <Link
              className={`card-esporte card-esporte-${esporte.valor}`}
              key={esporte.valor}
              to={`/quadras?esporte=${encodeURIComponent(esporte.valor)}`}
            >
              <span className="nome-esporte">{esporte.nome}</span>
              <span className="seta-esporte" aria-hidden="true">→</span>
            </Link>
          ))}
        </div>
      </section>
      <Sobre embutido />
    </main>
  );
}

export default Home;