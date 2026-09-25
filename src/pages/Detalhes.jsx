import { useEffect, useState } from "react";
import { supabase } from "../supabase";
import "./Detalhes.css";

function Detalhes() {
    const [quadra, setQuadra] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchQuadra = async () => {
            try {
                // Buscando a quadra com ID 23 conforme solicitado
                const { data, error } = await supabase
                    .from("quadras")
                    .select("*")
                    .eq("id", 23)
                    .single();

                if (error) {
                    console.error("Erro ao buscar a quadra:", error);
                } else {
                    setQuadra(data);
                }
            } catch (err) {
                console.error("Erro inesperado:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchQuadra();
    }, []);

    if (loading) {
        return <div className="loading-container"><h2>Carregando detalhes...</h2></div>;
    }

    if (!quadra) {
        return <div className="error-container"><h2>Quadra não encontrada!</h2></div>;
    }

    // Simulando dias disponíveis caso não venha no banco, ou usando o valor do banco se existir
    const diasDisponiveis = quadra.dias_funcionamento || ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];

    return (
        <div className="detalhes-container">
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
                        
                        <button className="btn-reservar">Solicitar Reserva</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Detalhes;