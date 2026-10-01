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
              className="card-esporte"
              key={esporte.valor}
              to={`/quadras?esporte=${encodeURIComponent(esporte.valor)}`}
            >
              <span>{esporte.nome}</span>
            </Link>
          ))}
        </div>
      </section>
      <Sobre embutido />
    </main>
  );
}

export default Home;