import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { eventoPagamentoTeste, lerPagamentoTesteAtivo } from "../configuracaoAdmin";
import { carregarPerfilUsuario, supabase } from "../supabase";
import { nomeDoEsporte } from "../esportes";
import "./Pagamento.css";

function carregarReservaPendente() {
    try {
        const reservaSalva = sessionStorage.getItem("reservaPendente");
        return reservaSalva ? JSON.parse(reservaSalva) : null;
    } catch {
        return null;
    }
}

function converterHorarioEmMinutos(horario) {
    const [hora, minuto] = String(horario || "").split(":").map(Number);
    return hora * 60 + minuto;
}

function formatarMinutosEmHorario(minutos) {
    const hora = String(Math.floor(minutos / 60)).padStart(2, "0");
    const minuto = String(minutos % 60).padStart(2, "0");
    return `${hora}:${minuto}`;
}

function horarioJaPassou(data, horario, agora = new Date()) {
    const hoje = `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, "0")}-${String(agora.getDate()).padStart(2, "0")}`;
    if (data < hoje) return true;
    if (data > hoje) return false;

    return converterHorarioEmMinutos(horario) <= agora.getHours() * 60 + agora.getMinutes();
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
        { id: "credito", titulo: "Cartão de crédito", detalhe: "Pagamentos parcelados" },
        { id: "debito", titulo: "Cartão de débito", detalhe: "Pagamento à vista" },
        { id: "pix", titulo: "Pix", detalhe: "Pagamento instantâneo" },
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

            const usuario = await carregarPerfilUsuario(sessao.user);
            if (usuario.perfil_id === null || usuario.perfil_id === undefined) {
                throw new Error("Não foi possível localizar seu perfil de usuário.");
            }

            const { data: quadra, error: erroQuadra } = await supabase
                .from("quadras")
                .select("capacidade,horario_inicio,horario_fim,funcionamento_dom,funcionamento_seg,funcionamento_ter,funcionamento_qua,funcionamento_qui,funcionamento_sex,funcionamento_sab")
                .eq("id", reserva.quadraId)
                .single();

            if (erroQuadra) throw erroQuadra;

            if (!reserva.dataReserva || !reserva.horarioInicioReserva || !reserva.horarioFimReserva) {
                throw new Error("A data e o intervalo da reserva estão incompletos. Volte à quadra e selecione novamente.");
            }

            const [ano, mes, dia] = reserva.dataReserva.split("-").map(Number);
            const diaSemana = new Date(ano, mes - 1, dia).getDay();
            const camposDia = [
                "funcionamento_dom",
                "funcionamento_seg",
                "funcionamento_ter",
                "funcionamento_qua",
                "funcionamento_qui",
                "funcionamento_sex",
                "funcionamento_sab",
            ];

            if (!quadra[camposDia[diaSemana]]) {
                throw new Error("A quadra não funciona nesse dia. Escolha outra data.");
            }

            const inicioMinutos = converterHorarioEmMinutos(reserva.horarioInicioReserva);
            const fimMinutos = converterHorarioEmMinutos(reserva.horarioFimReserva);
            const aberturaMinutos = converterHorarioEmMinutos(quadra.horario_inicio);
            const fechamentoMinutos = converterHorarioEmMinutos(quadra.horario_fim);
            const horariosEsperados = [];

            for (let horario = inicioMinutos; horario < fimMinutos; horario += 60) {
                horariosEsperados.push(formatarMinutosEmHorario(horario));
            }

            if (
                !horariosEsperados.length
                || inicioMinutos < aberturaMinutos
                || fimMinutos > fechamentoMinutos
                || fimMinutos <= inicioMinutos
                || (inicioMinutos - aberturaMinutos) % 60 !== 0
                || (fimMinutos - inicioMinutos) % 60 !== 0
                || horariosEsperados.join(",") !== (reserva.horariosReserva || []).join(",")
            ) {
                throw new Error("O intervalo escolhido não corresponde ao horário de funcionamento da quadra.");
            }

            if (Number(reserva.participantes) < 1 || Number(reserva.participantes) > Number(quadra.capacidade)) {
                throw new Error(`Esta quadra permite no máximo ${quadra.capacidade} participantes.`);
            }

            if (horarioJaPassou(reserva.dataReserva, reserva.horarioInicioReserva)) {
                throw new Error("Esse horário já passou. Volte à quadra e escolha um horário futuro.");
            }

            const grupoReserva = crypto.randomUUID();
            const reservasDoIntervalo = horariosEsperados.map((horario) => ({
                grupo_reserva: grupoReserva,
                id_usuario: usuario.perfil_id,
                id_quadra: reserva.quadraId,
                dia_reserva: reserva.dataReserva,
                horaio: horario,
                quantidade_participantes: Number(reserva.participantes),
            }));

            const { error: erroInsert } = await supabase.from("reservas").insert(reservasDoIntervalo);

            if (erroInsert?.code === "23505") {
                throw new Error("Um ou mais horários desse intervalo acabaram de ser reservados. Escolha outro horário.");
            }
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
    const duracaoHoras = Number(reserva?.duracaoHoras || reserva?.horariosReserva?.length) || 0;
    const precoTotal = preco * duracaoHoras;
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
                    <p>A quadra <strong>{reserva.quadraNome}</strong> está reservada para {dataFormatada}, das {reserva.horarioInicioReserva} às {reserva.horarioFimReserva}.</p>
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
                            <p>{nomeDoEsporte(reserva.tipoJogo)}</p>
                        </div>
                    </div>

                    <dl className="linhas-resumo-pagamento">
                        <div><dt>Data</dt><dd>{dataFormatada}</dd></div>
                        <div><dt>Horário</dt><dd>{reserva.horarioInicioReserva} às {reserva.horarioFimReserva}</dd></div>
                        <div><dt>Duração</dt><dd>{duracaoHoras} {duracaoHoras === 1 ? "hora" : "horas"}</dd></div>
                        <div><dt>Participantes</dt><dd>{reserva.participantes}</dd></div>
                        <div><dt>Preço por hora</dt><dd>{preco.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</dd></div>
                    </dl>

                    <div className="total-pagamento">
                        <span>Total</span>
                        <strong>{precoTotal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</strong>
                    </div>

                    <button className="botao-confirmar-pagamento" type="submit" disabled={!pagamentoTesteAtivo || confirmando}>
                        {confirmando ? "Confirmando..." : pagamentoTesteAtivo ? "Confirmar pagamento" : "Indiponível"}
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