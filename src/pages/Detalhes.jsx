import { useEffect, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { supabase } from "../supabase";
import "./Detalhes.css";

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
    const [diaSemana, setDiaSemana] = useState("");
    const [dataReserva, setDataReserva] = useState("");
    const [horarioReserva, setHorarioReserva] = useState("");
    const [participantes, setParticipantes] = useState(1);
    const [loadingReserva, setLoadingReserva] = useState(false); // Efeito de carregando do botão "Confirmar Reserva"

    // =========================================================================
    // 3. FUNÇÃO QUE SALVA A RESERVA NO BANCO (SUPABASE)
    // =========================================================================
    // Essa função é chamada quando o formulário do modal é enviado (botão de confirmar)
    const handleReserva = async (e) => {
        e.preventDefault();
        setLoadingReserva(true);

        try {
            sessionStorage.setItem("reservaPendente", JSON.stringify({
                quadraId: quadra.id,
                quadraNome: quadra.nome,
                tipoJogo: quadra.tipo_jogo,
                dataReserva,
                horarioReserva,
                participantes: Number(participantes),
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
        return diasAtivos.length > 0 
            ? diasAtivos 
            : (quadra.dias_funcionamento || ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"]);
    })();

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
                    <span className="tipo-jogo-badge">{quadra.tipo_jogo}</span>
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
                                {diasDisponiveis.map((dia, index) => (
                                    <span key={index} className="dia-badge">{dia}</span>
                                ))}
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
                            {/* Campo para selecionar o dia da semana disponível (novo) */}
                            <div className="form-group">
                                <label>Dia da Semana Disponível</label>
                                <select 
                                    value={diaSemana} 
                                    onChange={(e) => setDiaSemana(e.target.value)} 
                                    required
                                >
                                    <option value="">Selecione um dia disponível</option>
                                    {diasDisponiveis.map((dia, index) => (
                                        <option key={index} value={dia}>{dia}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Campo para selecionar a data no calendário */}
                            <div className="form-group">
                                <label>Data da Reserva</label>
                                <input 
                                    type="date" 
                                    value={dataReserva} 
                                    onChange={(e) => setDataReserva(e.target.value)} 
                                    required 
                                />
                            </div>
                            
                            {/* Campo para o horário */}
                            <div className="form-group">
                                <label>Horário</label>
                                <input 
                                    type="time" 
                                    value={horarioReserva} 
                                    onChange={(e) => setHorarioReserva(e.target.value)} 
                                    required 
                                />
                            </div>

                            {/* Campo para quantidade de participantes */}
                            <div className="form-group">
                                <label>Participantes</label>
                                <input 
                                    type="number" 
                                    min="1" 
                                    value={participantes} 
                                    onChange={(e) => setParticipantes(e.target.value)} 
                                    required 
                                />
                            </div>

                            <div className="modal-actions">
                                {/* Botão para fechar o modal sem salvar */}
                                <button type="button" className="btn-cancelar" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                                <button type="submit" className="btn-confirmar" disabled={loadingReserva}>
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