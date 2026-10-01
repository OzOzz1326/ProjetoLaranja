import { useEffect, useState } from "react";
import { supabase } from "../supabase";
import { chaveEsporte, nomeDoEsporte } from "../esportes";
import "./Quadras.css"
import { Link, useSearchParams } from "react-router-dom";

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

function Quadras(){
    const [parametros] = useSearchParams();
    const esporteSelecionado = parametros.get("esporte");
    const temaEsporte = esporteSelecionado ? ` tema-${chaveEsporte(esporteSelecionado)}` : "";
    const termoBusca = normalizarTipoJogo(parametros.get("busca"));
    const nomeEsporte = nomeDoEsporte(esporteSelecionado) || "esporte";
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
                            .map((tipo) => nomeDoEsporte(tipo));

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