import { useEffect, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { supabase } from "../supabase";
import { nomeDoEsporte } from "../esportes";
import "./Detalhes.css";

const diasDaSemana = [
    { campo: "funcionamento_dom", nome: "Domingo", dia: 0 },
    { campo: "funcionamento_seg", nome: "Segunda", dia: 1 },
    { campo: "funcionamento_ter", nome: "Terça", dia: 2 },
    { campo: "funcionamento_qua", nome: "Quarta", dia: 3 },
    { campo: "funcionamento_qui", nome: "Quinta", dia: 4 },
    { campo: "funcionamento_sex", nome: "Sexta", dia: 5 },
    { campo: "funcionamento_sab", nome: "Sábado", dia: 6 },
];

function formatarDataLocal(data) {
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, "0");
    const dia = String(data.getDate()).padStart(2, "0");
    return `${ano}-${mes}-${dia}`;
}

function horarioJaPassou(data, horario, agora = new Date()) {
    if (data < formatarDataLocal(agora)) return true;
    if (data > formatarDataLocal(agora)) return false;

    return converterHorarioEmMinutos(horario) <= agora.getHours() * 60 + agora.getMinutes();
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

function criarFaixasDeHorario(horarioInicio, horarioFim) {
    const inicio = converterHorarioEmMinutos(horarioInicio);
    const fim = converterHorarioEmMinutos(horarioFim);
    const faixas = [];

    for (let minuto = inicio; minuto + 60 <= fim; minuto += 60) {
        faixas.push({
            inicio: formatarMinutosEmHorario(minuto),
            fim: formatarMinutosEmHorario(minuto + 60),
        });
    }

    return faixas;
}

function Detalhes() {
    const navigate = useNavigate();
    // =========================================================================
    // 1. OBTENÇÃO DO ID DA QUADRA
    // =========================================================================
    // O Hook useSearchParams captura parâmetros passados na URL (ex: /detalhes?id=22)
    // O Hook useParams captura parâmetros definidos nas rotas (ex: /detalhes/22)
    // Aqui garantimos que pegamos o id de uma das duas formas. Se falhar, usa 23 como teste.
    const [searchParams] = useSearchParams();
    const params = useParams();
    const quadraId = searchParams.get("id") || params.id || 23;

    // =========================================================================
    // 2. ESTADOS (STATE) DA PÁGINA E DO MODAL DE RESERVA
    // =========================================================================
    // useState é usado para guardar os dados da tela e reagir a mudanças.
    const [quadra, setQuadra] = useState(null); // Guarda todas as informações da quadra que veio do banco
    const [loading, setLoading] = useState(true); // Controla se a página exibe a mensagem de carregando

    // Controla se a janelinha (modal) de fazer reserva está visível (aberta) ou não
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // Variáveis (estados) que guardam o que o usuário digita/seleciona no formulário de reserva
    const [dataReserva, setDataReserva] = useState("");
    const [horarioInicioReserva, setHorarioInicioReserva] = useState("");
    const [horarioFimReserva, setHorarioFimReserva] = useState("");
    const [participantes, setParticipantes] = useState("");
    const [agora, setAgora] = useState(() => new Date());
    const [mesCalendario, setMesCalendario] = useState(() => {
        const hoje = new Date();
        return new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    });
    const [horariosOcupados, setHorariosOcupados] = useState([]);
    const [carregandoHorarios, setCarregandoHorarios] = useState(false);
    const [erroHorarios, setErroHorarios] = useState("");
    const [loadingReserva, setLoadingReserva] = useState(false); // Efeito de carregando do botão "Confirmar Reserva"

    useEffect(() => {
        const intervalo = window.setInterval(() => setAgora(new Date()), 30000);
        return () => window.clearInterval(intervalo);
    }, []);

    useEffect(() => {
        let ativo = true;

        async function buscarHorariosOcupados() {
            if (!dataReserva || !quadra?.id) {
                setHorariosOcupados([]);
                setErroHorarios("");
                return;
            }

            setCarregandoHorarios(true);
            setErroHorarios("");

            const { data, error } = await supabase
                .from("reservas")
                .select("horaio")
                .eq("id_quadra", quadra.id)
                .eq("dia_reserva", dataReserva);

            if (!ativo) return;

            if (error) {
                console.error("Erro ao buscar horários ocupados:", error);
                setErroHorarios("Não foi possível consultar a disponibilidade. Tente novamente.");
                setHorariosOcupados([]);
            } else {
                setHorariosOcupados((data || []).map((reserva) => String(reserva.horaio).slice(0, 5)));
            }

            setCarregandoHorarios(false);
        }

        buscarHorariosOcupados();

        return () => {
            ativo = false;
        };
    }, [dataReserva, quadra?.id]);

    // =========================================================================
    // 3. FUNÇÃO QUE SALVA A RESERVA NO BANCO (SUPABASE)
    // =========================================================================
    // Essa função é chamada quando o formulário do modal é enviado (botão de confirmar)
    const handleReserva = async (e) => {
        e.preventDefault();
        if (horarioJaPassou(dataReserva, horarioInicioReserva)) {
            alert("Esse horário já passou. Escolha um horário futuro.");
            setHorarioInicioReserva("");
            setHorarioFimReserva("");
            return;
        }

        const inicioEmMinutos = converterHorarioEmMinutos(horarioInicioReserva);
        const fimEmMinutos = converterHorarioEmMinutos(horarioFimReserva);
        const horariosReserva = criarFaixasDeHorario(quadra.horario_inicio, quadra.horario_fim)
            .filter((faixa) => (
                converterHorarioEmMinutos(faixa.inicio) >= inicioEmMinutos
                && converterHorarioEmMinutos(faixa.fim) <= fimEmMinutos
            ))
            .map((faixa) => faixa.inicio);

        if (!horariosReserva.length || horariosReserva.some((horario) => horariosOcupados.includes(horario))) {
            alert("Este intervalo não está mais disponível. Escolha outros horários.");
            return;
        }

        setLoadingReserva(true);

        try {
            sessionStorage.setItem("reservaPendente", JSON.stringify({
                quadraId: quadra.id,
                quadraNome: quadra.nome,
                tipoJogo: nomeDoEsporte(quadra.tipo_jogo),
                dataReserva,
                horarioInicioReserva,
                horarioFimReserva,
                horariosReserva,
                duracaoHoras: horariosReserva.length,
                participantes: Number(participantes),
                capacidade: Number(quadra.capacidade),
                preco: Number(quadra.preco),
            }));
            setIsModalOpen(false);
            navigate("/pagamento");
        } catch (error) {
            console.error("Erro ao preparar a reserva:", error);
            alert("Não foi possível continuar para o pagamento. Confira os dados e tente novamente.");
        } finally {
            setLoadingReserva(false);
        }
    };

    // =========================================================================
    // 4. BUSCA DOS DADOS DA QUADRA AO ABRIR A PÁGINA
    // =========================================================================
    // useEffect roda automaticamente assim que a página abre ou quando quadraId muda.
    useEffect(() => {
        const fetchQuadra = async () => {
            setLoading(true);
            try {
                // Buscando a quadra dinamicamente de acordo com o ID recebido (ex: 22)
                const { data, error } = await supabase
                    .from("quadras")
                    .select("*")
                    .eq("id", quadraId)
                    .single();

                if (error) {
                    console.error("Erro ao buscar a quadra:", error);
                    setQuadra(null);
                } else {
                    setQuadra(data);
                }
            } catch (err) {
                console.error("Erro inesperado:", err);
                setQuadra(null);
            } finally {
                setLoading(false);
            }
        };

        if (quadraId) {
            fetchQuadra();
        }
    }, [quadraId]);

    if (loading) {
        return <div className="loading-container"><h2>Carregando detalhes...</h2></div>;
    }

    if (!quadra) {
        return <div className="error-container"><h2>Quadra não encontrada!</h2></div>;
    }

    // =========================================================================
    // 5. CÁLCULO DOS DIAS DA SEMANA DISPONÍVEIS
    // =========================================================================
    // Verifica quais dias a quadra funciona (ex: funcionamento_seg = true) no banco.
    // Isso será usado tanto para exibir as tags na tela quanto nas opções do modal.
    const diasDisponiveis = (() => {
        if (!quadra) return [];
        const mapaDias = [
            { campo: "funcionamento_seg", nome: "Segunda" },
            { campo: "funcionamento_ter", nome: "Terça" },
            { campo: "funcionamento_qua", nome: "Quarta" },
            { campo: "funcionamento_qui", nome: "Quinta" },
            { campo: "funcionamento_sex", nome: "Sexta" },
            { campo: "funcionamento_sab", nome: "Sábado" },
            { campo: "funcionamento_dom", nome: "Domingo" },
        ];
        const diasAtivos = mapaDias.filter(d => quadra[d.campo]).map(d => d.nome);
        const diasConfigurados = diasDaSemana.some((dia) => Object.prototype.hasOwnProperty.call(quadra, dia.campo));

        if (diasAtivos.length) return diasAtivos;
        if (diasConfigurados) return [];
        return Array.isArray(quadra.dias_funcionamento) ? quadra.dias_funcionamento : [];
    })();
    const diasOperacionais = diasDaSemana.filter((dia) => diasDisponiveis.includes(dia.nome));
    const faixasDeHorario = criarFaixasDeHorario(quadra.horario_inicio, quadra.horario_fim);
    const horariosOcupadosSet = new Set(horariosOcupados);
    const horariosInicioDisponiveis = faixasDeHorario.filter((faixa) => (
        !horariosOcupadosSet.has(faixa.inicio)
        && !horarioJaPassou(dataReserva, faixa.inicio, agora)
    ));
    const indiceInicioSelecionado = faixasDeHorario.findIndex((faixa) => faixa.inicio === horarioInicioReserva);
    const horariosFimDisponiveis = [];

    if (indiceInicioSelecionado >= 0) {
        for (let indice = indiceInicioSelecionado; indice < faixasDeHorario.length; indice += 1) {
            const faixa = faixasDeHorario[indice];
            if (horariosOcupadosSet.has(faixa.inicio)) break;
            horariosFimDisponiveis.push(faixa.fim);
        }
    }

    const indiceFimSelecionado = faixasDeHorario.findIndex((faixa) => faixa.fim === horarioFimReserva);
    const duracaoHoras = indiceInicioSelecionado >= 0 && indiceFimSelecionado >= indiceInicioSelecionado
        ? indiceFimSelecionado - indiceInicioSelecionado + 1
        : 0;
    const precoTotal = duracaoHoras * Number(quadra.preco || 0);
    const anoCalendario = mesCalendario.getFullYear();
    const mesCalendarioNumero = mesCalendario.getMonth();
    const quantidadeDiasMes = new Date(anoCalendario, mesCalendarioNumero + 1, 0).getDate();
    const primeiroDiaMes = new Date(anoCalendario, mesCalendarioNumero, 1).getDay();
    const hojeFormatado = formatarDataLocal(new Date());
    const diasDoCalendario = [
        ...Array.from({ length: primeiroDiaMes }, () => null),
        ...Array.from({ length: quantidadeDiasMes }, (_, indice) => indice + 1),
    ];
    const dataReservaFormatada = dataReserva
        ? new Date(`${dataReserva}T12:00:00`).toLocaleDateString("pt-BR", { dateStyle: "full" })
        : "";

    function selecionarDataReserva(data) {
        setDataReserva(data);
        setHorarioInicioReserva("");
        setHorarioFimReserva("");
    }

    function selecionarHorarioInicio(horario) {
        setHorarioInicioReserva(horario);
        const indice = faixasDeHorario.findIndex((faixa) => faixa.inicio === horario);
        const primeiraFaixaLivre = faixasDeHorario.slice(indice).find((faixa) => !horariosOcupadosSet.has(faixa.inicio));
        setHorarioFimReserva(primeiraFaixaLivre?.fim || "");
    }

    // =========================================================================
    // 6. RENDERIZAÇÃO (TELA VISUAL HTML/JSX)
    // =========================================================================
    // Aqui é retornado todo o código que o usuário vê na tela.
    return (
        <div id="pagina-detalhes">
            <div className="detalhes-container">
                <Link to="/quadras" className="voltar-detalhes">← Voltar para quadras</Link>
                <div className="detalhes-header">
                    <h1>{quadra.nome}</h1>
                    <span className="tipo-jogo-badge">{nomeDoEsporte(quadra.tipo_jogo)}</span>
                </div>

            <div className="detalhes-content">
                <div className="detalhes-main">
                    <div className="imagem-container">
                        {quadra.imagem ? (
                            <img src={quadra.imagem} alt={`Imagem da quadra ${quadra.nome}`} className="quadra-img" />
                        ) : (
                            <div className="imagem-placeholder">Imagem não disponível</div>
                        )}
                    </div>
                    
                    <div className="info-section">
                        <h2>Sobre a quadra</h2>
                        <p className="descricao">{quadra.descricao}</p>
                        
                        <div className="info-grid">
                            <div className="info-item">
                                <strong>📍 Endereço:</strong>
                                <span>{quadra.endereco}</span>
                            </div>
                            <div className="info-item">
                                <strong>👥 Capacidade:</strong>
                                <span>{quadra.capacidade} pessoas</span>
                            </div>
                            <div className="info-item">
                                <strong>☂️ Cobertura:</strong>
                                <span>{quadra.cobertura ? "Coberta" : "Descoberta"}</span>
                            </div>
                            <div className="info-item">
                                <strong>⏰ Horário:</strong>
                                <span>{quadra.horario_inicio} às {quadra.horario_fim}</span>
                            </div>
                        </div>

                        {quadra.outros && (
                            <div className="outros-section">
                                <strong>📌 Outros Detalhes:</strong>
                                <p>{quadra.outros}</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="detalhes-sidebar">
                    <div className="reserva-card">
                        <h3>Reservar Quadra</h3>
                        <div className="preco-container">
                            <span className="preco-valor">
                                {Number(quadra.preco).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </span>
                            <span className="preco-periodo">/ hora</span>
                        </div>
                        
                        <div className="dias-funcionamento">
                            <h4>Dias de Funcionamento</h4>
                            <div className="dias-grid">
                                {diasOperacionais.map((dia) => (
                                    <span key={dia.campo} className="dia-badge">
                                        {dia.nome} · {String(quadra.horario_inicio).slice(0, 5)} às {String(quadra.horario_fim).slice(0, 5)}
                                    </span>
                                ))}
                                {!diasOperacionais.length && <p>A quadra não tem dias de funcionamento cadastrados.</p>}
                            </div>
                        </div>
                        
                        {/* Botão alterado para abrir o modal ao clicar (novo) */}
                        <button className="btn-reservar" onClick={() => setIsModalOpen(true)}>Solicitar Reserva</button>
                    </div>
                </div>
            </div>
            </div>

            {/* Modal de Reserva (novo) */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>Solicitar Reserva</h2>
                        <form onSubmit={handleReserva}>
                            <div className="form-group">
                                <label>Data da Reserva</label>
                                <div className="calendario-reserva">
                                    <p className="horario-funcionamento-reserva">
                                        Funcionamento: {diasOperacionais.map((dia) => dia.nome).join(", ") || "dias não cadastrados"}
                                        {diasOperacionais.length > 0 && ` · ${String(quadra.horario_inicio).slice(0, 5)} às ${String(quadra.horario_fim).slice(0, 5)}`}
                                    </p>
                                    <div className="cabecalho-calendario-reserva">
                                        <button
                                            type="button"
                                            aria-label="Mês anterior"
                                            onClick={() => setMesCalendario(new Date(anoCalendario, mesCalendarioNumero - 1, 1))}
                                        >
                                            ‹
                                        </button>
                                        <strong>{mesCalendario.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}</strong>
                                        <button
                                            type="button"
                                            aria-label="Próximo mês"
                                            onClick={() => setMesCalendario(new Date(anoCalendario, mesCalendarioNumero + 1, 1))}
                                        >
                                            ›
                                        </button>
                                    </div>
                                    <div className="grade-calendario-reserva" aria-label="Calendário de disponibilidade">
                                        {["D", "S", "T", "Q", "Q", "S", "S"].map((dia, indice) => (
                                            <span className="dia-semana-calendario" key={`${dia}-${indice}`}>{dia}</span>
                                        ))}
                                        {diasDoCalendario.map((dia, indice) => {
                                            if (!dia) {
                                                return <span className="dia-vazio-calendario" key={`vazio-${indice}`} />;
                                            }

                                            const data = new Date(anoCalendario, mesCalendarioNumero, dia);
                                            const dataFormatada = formatarDataLocal(data);
                                            const diaFuncionamento = diasOperacionais.some((item) => item.dia === data.getDay());
                                            const habilitado = dataFormatada >= hojeFormatado && diaFuncionamento;

                                            return (
                                                <button
                                                    className={`dia-calendario-reserva${dataReserva === dataFormatada ? " selecionado" : ""}`}
                                                    type="button"
                                                    key={dataFormatada}
                                                    disabled={!habilitado}
                                                    aria-pressed={dataReserva === dataFormatada}
                                                    aria-label={`${data.toLocaleDateString("pt-BR", { dateStyle: "full" })}${diaFuncionamento ? " disponível" : " indisponível"}`}
                                                    onClick={() => selecionarDataReserva(dataFormatada)}
                                                >
                                                    {dia}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    <p className="legenda-calendario-reserva">Os dias ativos seguem o funcionamento cadastrado para esta quadra.</p>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Horário de início</label>
                                <select
                                    value={horarioInicioReserva}
                                    onChange={(e) => selecionarHorarioInicio(e.target.value)}
                                    required
                                    disabled={!dataReserva || carregandoHorarios || Boolean(erroHorarios)}
                                >
                                    <option value="">
                                        {carregandoHorarios ? "Verificando horários..." : "Selecione o início"}
                                    </option>
                                    {horariosInicioDisponiveis.map((faixa) => (
                                        <option key={faixa.inicio} value={faixa.inicio}>{faixa.inicio}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Horário de término</label>
                                <select
                                    value={horarioFimReserva}
                                    onChange={(e) => setHorarioFimReserva(e.target.value)}
                                    required
                                    disabled={!horarioInicioReserva || carregandoHorarios || Boolean(erroHorarios)}
                                >
                                    <option value="">Selecione o término</option>
                                    {horariosFimDisponiveis.map((horario) => (
                                        <option key={horario} value={horario}>{horario}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Campo para quantidade de participantes */}
                            <div className="form-group">
                                <label>Participantes</label>
                                <input 
                                    type="number" 
                                    min="1" 
                                    max={quadra.capacidade || undefined}
                                    value={participantes} 
                                    onChange={(e) => setParticipantes(e.target.value)} 
                                    placeholder={`Máximo: ${quadra.capacidade} participantes`}
                                    required 
                                />
                            </div>

                            {erroHorarios && <p className="erro-horarios-reserva" role="alert">{erroHorarios}</p>}
                            {dataReservaFormatada && (
                                <p className="resumo-valor-reserva">
                                    {dataReservaFormatada} · {duracaoHoras} {duracaoHoras === 1 ? "hora" : "horas"}
                                    <strong>{precoTotal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</strong>
                                </p>
                            )}

                            <div className="modal-actions">
                                {/* Botão para fechar o modal sem salvar */}
                                <button type="button" className="btn-cancelar" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                                <button
                                    type="submit"
                                    className="btn-confirmar"
                                    disabled={loadingReserva || carregandoHorarios || Boolean(erroHorarios) || !duracaoHoras || !participantes || Number(participantes) > Number(quadra.capacidade)}
                                >
                                    {loadingReserva ? "Continuando..." : "Continuar para pagamento"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Detalhes;