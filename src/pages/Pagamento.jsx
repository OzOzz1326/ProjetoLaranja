import "./Pagamento.css"

function Pagamento() {
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
                                    onChange={() => {
                                        setMetodo(opcao.id);
                                        setMensagem("");
                                    }}
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

                    {metodo === "credito" && (
                        <label className="campo-parcelas-pagamento">
                            <span>Parcelamento</span>
                            <select value={parcelas} onChange={(evento) => setParcelas(evento.target.value)}>
                                {[1, 2, 3, 4, 5, 6].map((quantidade) => (
                                    <option value={quantidade} key={quantidade}>
                                        {quantidade}x de {total === null ? "a definir" : formataMoeda(total / quantidade)}{quantidade === 1 ? " à vista" : " sem juros"}
                                    </option>
                                ))}
                            </select>
                        </label>
                    )}

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
                            <h3>{nomeQuadra || "Nenhuma quadra selecionada"}</h3>
                            <p>{esporte || "Quadra esportiva"}</p>
                        </div>
                    </div>
                    {endereco && <p className="endereco-pagamento">{endereco}</p>}

                    <dl className="linhas-resumo-pagamento">
                        {dataReserva && <div><dt>Data</dt><dd>{dataReserva}</dd></div>}
                        {horarioReserva && <div><dt>Horário</dt><dd>{horarioReserva}</dd></div>}
                        {precoHora !== null && !Number.isNaN(precoHora) && (
                            <div><dt>Quadra · {quantidadeHoras}h</dt><dd>{formataMoeda(precoHora)} / h</dd></div>
                        )}
                    </dl>

                    <div className="total-pagamento">
                        <span>Total</span>
                        <strong>{total === null ? "A definir" : formataMoeda(total)}</strong>
                    </div>

                    {!quadraSelecionada && <p className="aviso-quadra-pagamento">Escolha uma quadra e um horário antes de continuar.</p>}
                    {mensagem && <p className="mensagem-pagamento" role="status">{mensagem}</p>}

                    <button className="botao-confirmar-pagamento" type="submit" disabled={!quadraSelecionada}>
                        {metodo === "local" ? "Confirmar opção" : "Continuar"}<span aria-hidden="true">→</span>
                    </button>
                    <p className="seguranca-pagamento">Você só paga depois de conferir os dados da reserva.</p>
                </aside>
            </form>
        </main>
    );
    );
}
export default Pagamento;
export default Pagamento;