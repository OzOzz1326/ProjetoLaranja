import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { eventoPagamentoTeste, lerPagamentoTesteAtivo } from "../configuracaoAdmin";
import { supabase } from "../supabase";
import "./Pagamento.css";

function carregarReservaPendente() {
    try {
        const reservaSalva = sessionStorage.getItem("reservaPendente");
        return reservaSalva ? JSON.parse(reservaSalva) : null;
    } catch {
        return null;
    }
}

function Pagamento() {
    const navigate = useNavigate();
    const [metodo, setMetodo] = useState("credito");
    const [reserva] = useState(carregarReservaPendente);
    const [pagamentoTesteAtivo, setPagamentoTesteAtivo] = useState(lerPagamentoTesteAtivo);
    const [confirmando, setConfirmando] = useState(false);
    const [reservaConfirmada, setReservaConfirmada] = useState(false);
    const [mensagemErro, setMensagemErro] = useState("");

    useEffect(() => {
        const atualizarModoTeste = () => setPagamentoTesteAtivo(lerPagamentoTesteAtivo());
        window.addEventListener(eventoPagamentoTeste(), atualizarModoTeste);

        return () => window.removeEventListener(eventoPagamentoTeste(), atualizarModoTeste);
    }, []);

    const opcoesPagamento = [
        { id: "credito", titulo: "Cartão de crédito", detalhe: "Pagamentos parcelados", selo: "💳" },
        { id: "debito", titulo: "Cartão de débito", detalhe: "Pagamento à vista", selo: "💸" },
        { id: "pix", titulo: "Pix", detalhe: "Pagamento instantâneo", selo: "📱" },
    ];

    async function confirmarPagamento(evento) {
        evento.preventDefault();
        if (!pagamentoTesteAtivo || !reserva) return;

        setConfirmando(true);
        setMensagemErro("");

        try {
            if (!supabase) throw new Error("Não foi possível conectar ao banco de dados.");

            const { data: sessao, error: erroSessao } = await supabase.auth.getUser();
            if (erroSessao) throw erroSessao;
            if (!sessao.user) {
                alert("Faça login para confirmar a reserva.");
                navigate("/login");
                return;
            }

            const { data: usuario, error: erroUsuario } = await supabase
                .from("usuarios")
                .select("id")
                .eq("email", sessao.user.email)
                .maybeSingle();

            if (erroUsuario) throw erroUsuario;
            if (!usuario) throw new Error("Não foi possível localizar seu perfil de usuário.");

            const { data: reservaExistente, error: erroBusca } = await supabase
                .from("reservas")
                .select("id_quadra")
                .eq("id_quadra", reserva.quadraId)
                .eq("dia_reserva", reserva.dataReserva)
                .eq("horaio", reserva.horarioReserva)
                .limit(1)
                .maybeSingle();

            if (erroBusca) throw erroBusca;
            if (reservaExistente) {
                throw new Error("Este horário já foi reservado. Escolha outro horário.");
            }

            const { error: erroInsert } = await supabase.from("reservas").insert({
                id_usuario: usuario.id,
                id_quadra: reserva.quadraId,
                dia_reserva: reserva.dataReserva,
                horaio: reserva.horarioReserva,
                quantidade_participantes: Number(reserva.participantes),
            });

            if (erroInsert) throw erroInsert;

            sessionStorage.removeItem("reservaPendente");
            setReservaConfirmada(true);
        } catch (error) {
            console.error("Erro ao confirmar a reserva de teste:", error);
            setMensagemErro(error.message || "Não foi possível confirmar a reserva.");
        } finally {
            setConfirmando(false);
        }
    }

    const preco = Number(reserva?.preco) || 0;
    const dataFormatada = reserva?.dataReserva
        ? new Date(`${reserva.dataReserva}T00:00:00`).toLocaleDateString("pt-BR")
        : "";

    return (
        <main id="pagina-pagamento" className="pagina-pagamento">
            <header className="cabecalho-pagamento">
                <Link className="voltar-pagamento" to="/quadras">← Voltar para quadras</Link>
                <p className="etiqueta-pagamento">RESERVA</p>
                <h1>Finalize sua reserva</h1>
                <p>Confira os detalhes e escolha como deseja pagar.</p>
            </header>

            {!reserva ? (
                <section className="resultado-pagamento">
                    <h2>Nenhuma reserva selecionada</h2>
                    <p>Escolha uma quadra e um horário antes de continuar.</p>
                    <Link className="botao-confirmar-pagamento" to="/quadras">Ver quadras</Link>
                </section>
            ) : reservaConfirmada ? (
                <section className="resultado-pagamento" role="status">
                    <p className="etiqueta-pagamento">PAGAMENTO DE TESTE</p>
                    <h2>Pagamento realizado com sucesso</h2>
                    <p>A quadra <strong>{reserva.quadraNome}</strong> está reservada para {dataFormatada}, às {reserva.horarioReserva}.</p>
                    <Link className="botao-confirmar-pagamento" to={`/detalhes?id=${encodeURIComponent(reserva.quadraId)}`}>
                        Ver reserva <span aria-hidden="true">→</span>
                    </Link>
                </section>
            ) : (
            <form className="conteudo-pagamento" onSubmit={confirmarPagamento}>
                <section className="selecao-pagamento" aria-labelledby="titulo-metodo-pagamento">
                    <div className="titulo-pagamento">
                        <span className="numero-pagamento">01</span>
                        <div>
                            <h2 id="titulo-metodo-pagamento">Forma de pagamento</h2>
                            <p>Selecione uma opção para continuar.</p>
                        </div>
                    </div>

                    <div className="lista-opcoes-pagamento">
                        {opcoesPagamento.map((opcao) => (
                            <label className={`opcao-pagamento ${metodo === opcao.id ? "opcao-selecionada" : ""}`} key={opcao.id}>
                                <input
                                    type="radio"
                                    name="metodo-pagamento"
                                    value={opcao.id}
                                    checked={metodo === opcao.id}
                                    onChange={() => setMetodo(opcao.id)}
                                    disabled={!pagamentoTesteAtivo}
                                />
                                <span className="indicador-pagamento" aria-hidden="true" />
                                <span className="selo-pagamento" aria-hidden="true">{opcao.selo}</span>
                                <span className="texto-opcao-pagamento">
                                    <strong>{opcao.titulo}</strong>
                                    <small>{opcao.detalhe}</small>
                                </span>
                                <span className="seta-pagamento" aria-hidden="true">›</span>
                            </label>
                        ))}
                    </div>

                    <p className="aviso-pagamento">
                        {pagamentoTesteAtivo
                            ? "Modo de teste: nenhuma cobrança será processada e nenhum dado de cartão é solicitado ou armazenado."
                            : "O pagamento de teste está desativado pelo administrador."}
                    </p>
                </section>

                <aside className="resumo-pagamento" aria-labelledby="titulo-resumo-pagamento">
                    <div className="titulo-resumo-pagamento">
                        <p className="etiqueta-pagamento">RESUMO</p>
                        <h2 id="titulo-resumo-pagamento">Sua reserva</h2>
                    </div>

                    <div className="detalhes-quadra-pagamento">
                        <span className="marca-quadra-pagamento" aria-hidden="true">SC</span>
                        <div>
                            <h3>{reserva.quadraNome}</h3>
                            <p>{reserva.tipoJogo}</p>
                        </div>
                    </div>

                    <dl className="linhas-resumo-pagamento">
                        <div><dt>Data</dt><dd>{dataFormatada}</dd></div>
                        <div><dt>Horário</dt><dd>{reserva.horarioReserva}</dd></div>
                        <div><dt>Participantes</dt><dd>{reserva.participantes}</dd></div>
                        <div><dt>Quadra · 1h</dt><dd>{preco.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</dd></div>
                    </dl>

                    <div className="total-pagamento">
                        <span>Total</span>
                        <strong>{preco.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</strong>
                    </div>

                    <button className="botao-confirmar-pagamento" type="submit" disabled={!pagamentoTesteAtivo || confirmando}>
                        {confirmando ? "Confirmando..." : pagamentoTesteAtivo ? "Confirmar pagamento de teste" : "Pagamento desativado"}
                        <span aria-hidden="true">→</span>
                    </button>
                    {mensagemErro && <p className="mensagem-pagamento" role="alert">{mensagemErro}</p>}
                    <p className="seguranca-pagamento">Nenhuma cobrança real será feita. A reserva só será gravada após a confirmação.</p>
                </aside>
            </form>
            )}
        </main>
    );
}

export default Pagamento;