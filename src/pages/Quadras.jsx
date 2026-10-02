import { useEffect, useState } from "react";
import { supabase } from "../supabase";
import { chaveEsporte, nomeDoEsporte } from "../esportes";
import "./Quadras.css";
import { Link, useSearchParams } from "react-router-dom";

// 12 itens por página para manter as linhas da grade de 4 sempre preenchidas
const ITENS_POR_PAGINA = 12;
const PAGINAS_MINIMAS = 1;

const FILTROS_ESPORTES = [
    { chave: "", nome: "Todos os Esportes", tema: "tema-todos" },
    { chave: "futebol", nome: "Futebol", tema: "tema-futebol" },
    { chave: "tennis", nome: "Tennis", tema: "tema-tennis" },
    { chave: "futvolei", nome: "Fut-vôlei", tema: "tema-futvolei" },
    { chave: "beachtennis", nome: "Beach Tennis", tema: "tema-beachtennis" },
];

function normalizarTipoJogo(valor) {
    if (valor === null || valor === undefined) return "";

    return String(valor)
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();
}

function temUmaDiferenca(termo, palavra) {
    if (termo === palavra) return true;
    if (Math.min(termo.length, palavra.length) < 4 || Math.abs(termo.length - palavra.length) > 1) {
        return false;
    }

    let indiceTermo = 0;
    let indicePalavra = 0;
    let diferencas = 0;

    while (indiceTermo < termo.length && indicePalavra < palavra.length) {
        if (termo[indiceTermo] === palavra[indicePalavra]) {
            indiceTermo += 1;
            indicePalavra += 1;
            continue;
        }

        diferencas += 1;
        if (diferencas > 1) return false;

        if (
            termo.length === palavra.length
            && termo[indiceTermo] === palavra[indicePalavra + 1]
            && termo[indiceTermo + 1] === palavra[indicePalavra]
        ) {
            indiceTermo += 2;
            indicePalavra += 2;
        } else if (termo.length > palavra.length) {
            indiceTermo += 1;
        } else if (termo.length < palavra.length) {
            indicePalavra += 1;
        } else {
            indiceTermo += 1;
            indicePalavra += 1;
        }
    }

    return diferencas
        + (termo.length - indiceTermo)
        + (palavra.length - indicePalavra) <= 1;
}

function correspondeBusca(valor, termoBusca) {
    const texto = normalizarTipoJogo(valor);
    if (!texto) return false;
    if (texto.includes(termoBusca)) return true;

    const palavras = texto.split(/[^a-z0-9]+/).filter(Boolean);
    const termos = termoBusca.split(/\s+/).filter(Boolean);

    return termos.every((termo) => palavras.some((palavra) => (
        palavra.includes(termo) || temUmaDiferenca(termo, palavra)
    )));
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

function obterClasseEsporte(valor) {
    const chave = chaveEsporte(valor);
    if (chave === "futebol") return "esporte-verde";
    if (chave === "tennis") return "esporte-azul";
    if (chave === "futvolei") return "esporte-laranja";
    if (chave === "beachtennis") return "esporte-amarelo";
    return "esporte-verde";
}

function obterTemaPagina(esporte) {
    if (!esporte) return "tema-todos";
    const chave = chaveEsporte(esporte);
    if (chave === "futebol") return "tema-futebol";
    if (chave === "tennis") return "tema-tennis";
    if (chave === "futvolei") return "tema-futvolei";
    if (chave === "beachtennis") return "tema-beachtennis";
    return "tema-todos";
}

function Quadras() {
    const [parametros, setSearchParams] = useSearchParams();
    const esporteSelecionado = parametros.get("esporte");
    const temaEsporte = esporteSelecionado ? ` tema-${chaveEsporte(esporteSelecionado)}` : " tema-todos";
    const termoBusca = normalizarTipoJogo(parametros.get("busca"));
    const nomeEsporte = nomeDoEsporte(esporteSelecionado) || "Todas as Quadras";
    const chaveFiltros = `${esporteSelecionado || ""}|${termoBusca}`;

    const temaAtual = obterTemaPagina(esporteSelecionado);

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

    function alternarFiltroEsporte(chave) {
        const novosParametros = new URLSearchParams(parametros);
        if (!chave) {
            novosParametros.delete("esporte");
        } else {
            novosParametros.set("esporte", chave);
        }
        setSearchParams(novosParametros);
    }

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
                        .map((tipo) => chaveEsporte(tipo));
                    const esporteNormalizado = chaveEsporte(esporteSelecionado);

                    return tipos.includes(esporteNormalizado);
                });
            }

            if (termoBusca) {
                lista = lista.filter((quadra) => {
                    const tipos = listarTiposJogo(quadra.tipo_jogo)
                        .map((tipo) => nomeDoEsporte(tipo));
                    const valoresEsportes = tipos.join(" ").toLowerCase();

                    return correspondeBusca(quadra.nome, termoBusca)
                        || correspondeBusca(quadra.descricao, termoBusca)
                        || correspondeBusca(valoresEsportes, termoBusca);
                });
            }

            setQuadras(lista);
            setCarregando(false);
        }

        buscaQuadras();
    }, [esporteSelecionado, termoBusca]);

    return (
        <main id="pagina-quadras" className={`pagina-quadras${temaEsporte}`}>
            <div className="cabecalho-quadras">
                <Link className="voltar-quadras" to="/pagina-inicial">
                    ← Voltar para início
                </Link>
                <div className="cabecalho-principal">
                    <div>
                        <p className="etiqueta-quadras">QUADRAS DISPONÍVEIS</p>
                        <h1>{esporteSelecionado ? `Quadras de ${nomeEsporte}` : "Encontre sua Quadra"}</h1>
                        <p className="subtitulo-quadras">
                            Selecione a modalidade esportiva desejada e alugue seu horário em poucos cliques.
                        </p>
                    </div>

                    {ehSocio && (
                        <Link className="botao-cadastrar-quadra" to="/cadastrar-quadra">
                            + Cadastrar nova quadra
                        </Link>
                    )}
                </div>

                {/* Filtro de Esportes com Cores Dinâmicas */}
                <div className="filtros-esportes-barra" role="tablist" aria-label="Filtrar por esporte">
                    {FILTROS_ESPORTES.map((filtro) => {
                        const chaveNorm = chaveEsporte(esporteSelecionado);
                        const ativa = (!esporteSelecionado && filtro.chave === "")
                            || (esporteSelecionado && chaveNorm === chaveEsporte(filtro.chave));

                        return (
                            <button
                                key={filtro.chave || "todos"}
                                type="button"
                                className={`filtro-esporte-btn ${filtro.tema} ${ativa ? "ativo" : ""}`}
                                onClick={() => alternarFiltroEsporte(filtro.chave)}
                            >
                                <span className="filtro-nome">{filtro.nome}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Conteúdo: Carregando, Vazio ou Grid de 4 */}
            {carregando ? (
                <div className="estado-vazio">
                    <div className="spinner-carregando" aria-hidden="true"></div>
                    <h2>Buscando quadras disponíveis...</h2>
                </div>
            ) : quadras.length === 0 ? (
                <div className="estado-vazio">
                    <h2>Nenhuma quadra encontrada</h2>
                    <p>Não encontramos quadras para essa modalidade no momento.</p>
                    <button
                        type="button"
                        className="botao-voltar-filtro"
                        onClick={() => alternarFiltroEsporte("")}
                    >
                        Ver todos os esportes
                    </button>
                </div>
            ) : quadrasDaPagina.length === 0 ? (
                <div className="estado-vazio">
                    <h2>Nenhuma quadra nesta página</h2>
                    <p>Escolha outra página para continuar navegando.</p>
                </div>
            ) : (
                <div className="lista-quadras-grade">
                    {quadrasDaPagina.map((quadra) => {
                        const tipos = listarTiposJogo(quadra.tipo_jogo);
                        const primeiroEsporte = tipos[0] || "";
                        const esporteExibicao = nomeDoEsporte(primeiroEsporte) || "Quadra";
                        const classeCorBadge = obterClasseEsporte(primeiroEsporte);

                        return (
                            <article className="card-quadra" key={quadra.id}>
                                <Link
                                    to={`/detalhes?id=${quadra.id}`}
                                    className="card-quadra-link"
                                    title={`Alugar ${quadra.nome}`}
                                >
                                    {/* Imagem com Badge do Esporte */}
                                    <div className="imagem-card-quadra">
                                        {quadra.imagem ? (
                                            <img
                                                src={quadra.imagem}
                                                alt={quadra.nome}
                                                loading="lazy"
                                                decoding="async"
                                            />
                                        ) : (
                                            <div className="imagem-placeholder">
                                                <span>Sem imagem</span>
                                            </div>
                                        )}
                                        <span className={`badge-esporte-card ${classeCorBadge}`}>
                                            {esporteExibicao}
                                        </span>
                                    </div>

                                    {/* Conteúdo Enxuto: Nome, Preço e Ação de Alugar */}
                                    <div className="conteudo-card-quadra">
                                        <h2 className="nome-quadra">{quadra.nome}</h2>

                                        <div className="rodape-card-quadra">
                                            <div className="preco-container">
                                                <span className="preco-rotulo">A partir de</span>
                                                <div className="preco-destaque">
                                                    <strong>
                                                        R$ {Number(quadra.preco || 0).toFixed(2).replace(".", ",")}
                                                    </strong>
                                                    <span className="preco-periodo">/h</span>
                                                </div>
                                            </div>

                                            <span className="botao-alugar-card">
                                                Alugar <span>→</span>
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            </article>
                        );
                    })}
                </div>
            )}

            {/* Paginação */}
            {!carregando && totalPaginas > 1 && (
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