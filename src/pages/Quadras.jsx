import { useEffect, useState } from "react";
import { supabase } from "../supabase";
import "./Quadras.css"
import { Link, useSearchParams } from "react-router-dom";

const nomesEsportes = {
    futebol: "Futebol",
    futsal: "Futsal",
    futvolei: "Futvôlei",
    basquete: "Basquete",
    volei: "Vôlei",
    tenis: "Tênis",
    beachtenis: "Beach Tênis",
};

const ITENS_POR_PAGINA = 10;
const PAGINAS_MINIMAS = 4;

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
    const nomeEsporte = nomesEsportes[normalizarTipoJogo(esporteSelecionado)] || "esporte";
    const chaveFiltros = `${esporteSelecionado || ""}|${termoBusca}`;

    const [quadras, setQuadras] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [ehSocio, setEhSocio] = useState(false);
    const [paginaSelecionada, setPaginaSelecionada] = useState({ chaveFiltros, numero: 1 });
    const paginaAtual = paginaSelecionada.chaveFiltros === chaveFiltros
        ? paginaSelecionada.numero
        : 1;
    const totalPaginas = Math.max(PAGINAS_MINIMAS, Math.ceil(quadras.length / ITENS_POR_PAGINA));
    const quadrasDaPagina = quadras.slice(
        (paginaAtual - 1) * ITENS_POR_PAGINA,
        paginaAtual * ITENS_POR_PAGINA
    );

    useEffect(() => {
        let ativo = true;

        async function verificarSocio(usuarioAuth) {
            if (!supabase || !usuarioAuth?.email) {
                if (ativo) setEhSocio(false);
                return;
            }

            const { data, error } = await supabase
                .from("usuarios")
                .select("socio")
                .ilike("email", usuarioAuth.email.trim())
                .maybeSingle();

            if (ativo) setEhSocio(!error && data?.socio === true);
        }

        if (!supabase) return undefined;

        const { data: listener } = supabase.auth.onAuthStateChange((_evento, sessao) => {
            queueMicrotask(() => verificarSocio(sessao?.user));
        });

        supabase.auth.getUser().then(({ data, error }) => {
            if (error) {
                if (ativo) setEhSocio(false);
                return;
            }
            verificarSocio(data.user);
        });

        return () => {
            ativo = false;
            listener?.subscription?.unsubscribe();
        };
    }, []);

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
                {ehSocio && (
                    <Link className="botao-cadastrar-quadra" to="/cadastrar-quadra">
                        Cadastrar nova quadra
                    </Link>
                )}
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
            ) : quadrasDaPagina.length === 0 ? (
                <div className="estado-vazio">
                    <h2>Nenhuma quadra nesta página</h2>
                    <p>Escolha outra página para continuar navegando.</p>
                </div>
            ) : (
                <div className="lista-quadras">
                    {quadrasDaPagina.map((quadra) => {
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
                                        {/* Link que direciona para a página de detalhes com o ID da quadra selecionada */}
                                        <Link to={`/detalhes?id=${quadra.id}`} className="botao-voltar">
                                            Ver detalhes da quadra
                                        </Link>
                                    </div>

                                    <div className="imagem-card-quadra">
                                        {quadra.imagem ? (
                                            <img
                                                src={quadra.imagem}
                                                alt={quadra.nome}
                                                loading="lazy"
                                                decoding="async"
                                            />
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

            {!carregando && (
                <nav className="paginacao-quadras" aria-label="Paginação das quadras">
                    <button
                        className="botao-pagina-quadras"
                        type="button"
                        onClick={() => setPaginaSelecionada({ chaveFiltros, numero: paginaAtual - 1 })}
                        disabled={paginaAtual === 1}
                    >
                        Anterior
                    </button>
                    {Array.from({ length: totalPaginas }, (_, indice) => indice + 1).map((pagina) => (
                        <button
                            className={`botao-pagina-quadras${pagina === paginaAtual ? " ativa" : ""}`}
                            type="button"
                            key={pagina}
                            onClick={() => setPaginaSelecionada({ chaveFiltros, numero: pagina })}
                            aria-label={`Página ${pagina}`}
                            aria-current={pagina === paginaAtual ? "page" : undefined}
                        >
                            {pagina}
                        </button>
                    ))}
                    <button
                        className="botao-pagina-quadras"
                        type="button"
                        onClick={() => setPaginaSelecionada({ chaveFiltros, numero: paginaAtual + 1 })}
                        disabled={paginaAtual === totalPaginas}
                    >
                        Próxima
                    </button>
                </nav>
            )}
        </main>
    );
}

export default Quadras;