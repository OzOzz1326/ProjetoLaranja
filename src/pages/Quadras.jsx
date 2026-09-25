import { useEffect, useState } from "react";
import { supabase } from "../supabase";
import "./Quadras.css"
import { Link, useSearchParams } from "react-router-dom";

const nomesEsportes = {
    futebol: "Futebol",
    futvolei: "Futvôlei",
    tenis: "Tênis",
    beachtenis: "Beach Tênis",
};

function normalizarTipoJogo(valor) {
    if (valor === null || valor === undefined) return "";

    return String(valor)
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();
}

function listarTiposJogo(valor) {
    if (Array.isArray(valor)) {
        return valor.flatMap((item) => String(item).split(","));
    }

    if (typeof valor === "string") {
        return valor.split(",");
    }

    return [valor];
}

function nomeEsporteEmTexto(valor) {
    if (valor === null || valor === undefined || valor === "") {
        return "";
    }

    const valorNormalizado = normalizarTipoJogo(valor);

    if (!valorNormalizado) {
        return "";
    }

    return nomesEsportes[valorNormalizado] || String(valor).trim();
}

function Quadras(){
    const [parametros] = useSearchParams();
    const esporteSelecionado = parametros.get("esporte");
    const termoBusca = (parametros.get("busca") || "").trim().toLowerCase();
    const nomeEsporte = nomesEsportes[esporteSelecionado] || "esporte";

    const [quadras, setQuadras] = useState([]);
    const [carregando, setCarregando] = useState(true);

    useEffect(() => {
        async function buscaQuadras() {
            setCarregando(true);

            const { data, error } = await supabase.from("quadras").select();

            if (error) {
                console.log(error);
                setQuadras([]);
                setCarregando(false);
                return;
            }

            let lista = data || [];

            if (esporteSelecionado) {
                lista = lista.filter((quadra) => {
                    const tipos = listarTiposJogo(quadra.tipo_jogo)
                        .map((tipo) => normalizarTipoJogo(tipo));
                    const esporteNormalizado = normalizarTipoJogo(esporteSelecionado);

                    return tipos.includes(esporteNormalizado);
                });
            }

            if (termoBusca) {
                lista = lista.filter((quadra) => {
                    const tipos = listarTiposJogo(quadra.tipo_jogo)
                        .map((tipo) => nomeEsporteEmTexto(tipo));
                    const valoresEsportes = tipos.join(" ").toLowerCase();
                    const nomeQuadra = (quadra.nome || "").toLowerCase();
                    const descricaoQuadra = (quadra.descricao || "").toLowerCase();

                    return nomeQuadra.includes(termoBusca)
                        || descricaoQuadra.includes(termoBusca)
                        || valoresEsportes.includes(termoBusca);
                });
            }

            setQuadras(lista);
            setCarregando(false);
        }

        buscaQuadras();
    }, [esporteSelecionado, termoBusca]);

    return (
        <main id="pagina-quadras" className="pagina-quadras">
            <div className="cabecalho-quadras">
                <Link className="voltar-quadras" to="/pagina-inicial">← Escolher outro esporte</Link>
                <p className="etiqueta-quadras">QUADRAS DISPONÍVEIS</p>
                <h1>{esporteSelecionado ? `Quadras de ${nomeEsporte}` : "Encontre sua quadra"}</h1>
                <p>Veja os locais e escolha o melhor horário para jogar.</p>
            </div>

            {carregando ? (
                <div className="estado-vazio">
                    <h2>Carregando quadras...</h2>
                </div>
            ) : quadras.length === 0 ? (
                <div className="estado-vazio">
                    <h2>Nenhuma quadra cadastrada</h2>
                    <p>As quadras estarão disponíveis assim que forem cadastradas.</p>
                    <Link className="botao-voltar" to="/pagina-inicial">Voltar para esportes</Link>
                </div>
            ) : (
                <div className="lista-quadras">
                    {quadras.map((quadra) => {
                        const tipos = listarTiposJogo(quadra.tipo_jogo)
                            .map((tipo) => nomeEsporteEmTexto(tipo));

                        return (
                            <article className="card-quadra" key={quadra.id}>
                                <div className="conteudo-card-quadra">
                                    <div className="info-card-quadra">
                                        <h2>{quadra.nome}</h2>
                                        <p><strong>Descrição:</strong> {quadra.descricao}</p>
                                        <p><strong>Esporte:</strong> {tipos.join(", ") || "Não informado"}</p>
                                        <p><strong>Preço:</strong> R$ {Number(quadra.preco || 0).toFixed(2)}</p>
                                        <button type="button" className="botao-voltar">Ver detalhes da quadra</button>
                                    </div>

                                    <div className="imagem-card-quadra">
                                        {quadra.imagem ? (
                                            <img src={quadra.imagem} alt={quadra.nome} />
                                        ) : (
                                            <div className="imagem-placeholder">Imagem da quadra</div>
                                        )}
                                    </div>
                                </div>
                            </article>
                        );
                    })}
                </div>
            )}
        </main>
    );
}

export default Quadras;