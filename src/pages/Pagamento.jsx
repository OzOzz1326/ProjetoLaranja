import { useState } from "react";
import { Link } from "react-router-dom";
import "./Pagamento.css";

function Pagamento() {
    const [metodo, setMetodo] = useState("credito");

    const opcoesPagamento = [
        { id: "credito", titulo: "Cartão de crédito", detalhe: "Pagamentos parcelados", selo: "💳" },
        { id: "debito", titulo: "Cartão de débito", detalhe: "Pagamento à vista", selo: "💸" },
        { id: "pix", titulo: "Pix", detalhe: "Pagamento instantâneo", selo: "📱" },
    ];

    function confirmarPagamento(evento) {
        evento.preventDefault();
        alert("Reserva confirmada!");
    }

    return (
        <main id="pagina-pagamento" className="pagina-pagamento">
            <header className="cabecalho-pagamento">
                <Link className="voltar-pagamento" to="/quadras">← Voltar para quadras</Link>
                <p className="etiqueta-pagamento">RESERVA</p>
                <h1>Finalize sua reserva</h1>
                <p>Confira os detalhes e escolha como deseja pagar.</p>
            </header>

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

                    <p className="aviso-pagamento">Esta etapa não processa cobranças. Os dados do cartão não são solicitados nem armazenados.</p>
                </section>

                <aside className="resumo-pagamento" aria-labelledby="titulo-resumo-pagamento">
                    <div className="titulo-resumo-pagamento">
                        <p className="etiqueta-pagamento">RESUMO</p>
                        <h2 id="titulo-resumo-pagamento">Sua reserva</h2>
                    </div>

                    <div className="detalhes-quadra-pagamento">
                        <span className="marca-quadra-pagamento" aria-hidden="true">SC</span>
                        <div>
                            <h3>Quadra esportiva</h3>
                            <p>Futebol</p>
                        </div>
                    </div>

                    <dl className="linhas-resumo-pagamento">
                        <div><dt>Data</dt><dd>25/09/2026</dd></div>
                        <div><dt>Horário</dt><dd>19:00 às 20:00</dd></div>
                        <div><dt>Quadra · 1h</dt><dd>R$ 120,00 / h</dd></div>
                    </dl>

                    <div className="total-pagamento">
                        <span>Total</span>
                        <strong>R$ 120,00</strong>
                    </div>

                    <button className="botao-confirmar-pagamento" type="submit">
                        {metodo === "pix" ? "Confirmar pix" : "Continuar"}<span aria-hidden="true">→</span>
                    </button>
                    <p className="seguranca-pagamento">Você só paga depois de conferir os dados da reserva.</p>
                </aside>
            </form>
        </main>
    );
}

export default Pagamento;