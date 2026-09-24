import "./Quadras.css"
import { Link, useSearchParams } from "react-router-dom";

const nomesEsportes = {
    futebol: "Futebol",
    futvolei: "Futvôlei",
    tenis: "Tênis",
    beachtenis: "Beach Tênis",
};

function Quadras(){
    const [parametros] = useSearchParams();
    const esporteSelecionado = parametros.get("esporte");
    const nomeEsporte = nomesEsportes[esporteSelecionado] || "esporte";

    return (
        <main id="pagina-quadras" className="pagina-quadras">
            <div className="cabecalho-quadras">
                <Link className="voltar-quadras" to="/pagina-inicial">← Escolher outro esporte</Link>
                <p className="etiqueta-quadras">QUADRAS DISPONÍVEIS</p>
                <h1>{esporteSelecionado ? `Quadras de ${nomeEsporte}` : "Encontre sua quadra"}</h1>
                <p>Veja os locais e escolha o melhor horário para jogar.</p>
            </div>

            <div className="estado-vazio">
                <h2>Nenhuma quadra cadastrada</h2>
                <p>As quadras estarão disponíveis assim que forem cadastradas.</p>
                <Link className="botao-voltar" to="/pagina-inicial">Voltar para esportes</Link>
            </div>
        </main>
    );
}

export default Quadras;