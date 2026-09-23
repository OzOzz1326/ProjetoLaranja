import "./Home.css"

function Home() {
  return (
    <div>      
      <nav className="navbar">
        <div className="logo-container">
            <img src="../logosfundo.png" alt="Sportincity Logo"/>
        </div>
        <ul className="nav-links">
            <li><a href="#">Início</a></li>
            <li><a href="#">Quadras</a></li>
            <li><a href="#" className="ativo">Filiais</a></li>
            <li><a href="#">Torneios</a></li>
        </ul>
        <div className="search-container">
            <input type="text" placeholder="Pesquisar..." className="search-input" id="busca"/>
            <button className="search-btn" aria-label="Buscar">🔍</button>
        </div>
        <button className="btn-login" id="btn-login">Login</button>
    </nav>

    <main class="pagina-cadastro">

        <div class="titulo-pagina">
            <h1>Cadastro de Filial</h1>
            <p>Preencha os dados abaixo para registrar uma nova filial no Sport In City</p>
        </div>

        <div class="paineis">

            <div class="painel-esquerdo">

                <div class="card-form">
                    <h2>Dados da Filial</h2>

                    <form id="form-filial">

                        <div class="campo">
                            <label for="nome-filial">Nome da Filial</label>
                            <input type="text" id="nome-filial" name="nome-filial"
                                   placeholder="Ex: Sportincity Centro" required minlength="5"/>
                        </div>

                        <div class="campo">
                            <label for="responsavel">Responsável</label>
                            <input type="text" id="responsavel" name="responsavel"
                                   placeholder="Nome do responsável" required/>
                        </div>

                        <div class="campos-linha">
                            <div class="campo">
                                <label for="telefone">Telefone / WhatsApp</label>
                                <input type="tel" id="telefone" name="telefone"
                                       placeholder="(16) 99999-9999" required/>
                            </div>
                            <div class="campo">
                                <label for="email">E-mail</label>
                                <input type="email" id="email" name="email"
                                       placeholder="contato@filial.com" required/>
                            </div>
                        </div>

                        <div class="campo">
                            <label for="descricao">Descrição</label>
                            <textarea id="descricao" name="descricao"
                                      placeholder="Descreva a filial brevemente..."></textarea>
                        </div>

                    </form>
                </div>

                <div class="card-form">
                    <h2>Dados da Quadra</h2>

                    <form id="form-quadra">

                        <div class="campo">
                            <div class="form-quadras">
                                <label for="nome-campo">Nome do Campo / Estádio</label>
                                <input type="text" id="nome-campo" name="nome-campo"
                                       placeholder="Ex: Arena Central" required/>
                            
    
                                <div class="campo">
                                    <label for="tipo-campo">Tipo de Campo</label>
                                    <select id="tipo-campo" name="tipo-campo" required>
                                        <option value="" disabled selected>Selecione o tipo...</option>
                                        <option value="society">Society (Grama Sintética)</option>
                                        <option value="salao">Salão (Piso)</option>
                                        <option value="campo">Campo (Grama Natural)</option>
                                        <option value="areia">Areia</option>
                                        <option value="tenis">Tênis</option>
                                        <option value="beach-tenis">Beach Tênis</option>
                                        <option value="volei">Vôlei</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div class="grupo-checkbox">
                            <label>Dias de Funcionamento</label>
                            <div class="dias-semana">
                                <label>
                                    <input type="checkbox" name="dias" value="seg"/>
                                    Seg
                                </label>
                                <label>
                                    <input type="checkbox" name="dias" value="ter"/>
                                    Ter
                                </label>
                                <label>
                                    <input type="checkbox" name="dias" value="qua"/>
                                    Qua
                                </label>
                                <label>
                                    <input type="checkbox" name="dias" value="qui"/>
                                    Qui
                                </label>
                                <label>
                                    <input type="checkbox" name="dias" value="sex"/>
                                    Sex
                                </label>
                                <label>
                                    <input type="checkbox" name="dias" value="sab"/>
                                    Sáb
                                </label>
                                <label>
                                    <input type="checkbox" name="dias" value="dom"/>
                                    Dom
                                </label>
                            </div>
                        </div>

                        <div class="campo">
                            <label>Horário de Funcionamento</label>
                            <div class="horario-container">
                                <input type="time" id="hora-abertura" name="hora-abertura" required/>
                                <span>até</span>
                                <input type="time" id="hora-fechamento" name="hora-fechamento" required/>
                            </div>
                        </div>

                    </form>
                </div>

            </div>

            <div class="painel-direito">

                <div class="card-form">
                    <h2>Endereço e Categoria</h2>

                    <form id="form-endereco">

                        <div class="campos-linha">
                            <div class="campo">
                                <label for="cep">CEP</label>
                                <input type="text" id="cep" name="cep"
                                       placeholder="00000-000" required maxlength="9"/>
                            </div>
                            <div class="campo">
                                <label for="numero">Número</label>
                                <input type="text" id="numero" name="numero"
                                       placeholder="Ex: 123" required/>
                            </div>
                        </div>

                        <div class="campo">
                            <label for="endereco">Endereço</label>
                            <input type="text" id="endereco" name="endereco"
                                   placeholder="Rua, Avenida..." required/>
                        </div>

                        <div class="campo">
                            <label for="complemento">Complemento</label>
                            <input type="text" id="complemento" name="complemento"
                                   placeholder="Apto, Bloco, Sala... (opcional)"/>
                        </div>

                        <div class="campos-linha">
                            <div class="campo">
                                <label for="bairro">Bairro</label>
                                <input type="text" id="bairro" name="bairro"
                                       placeholder="Bairro" required/>
                            </div>
                            <div class="campo">
                                <label for="cidade">Cidade</label>
                                <input type="text" id="cidade" name="cidade"
                                       placeholder="Cidade" required/>
                            </div>
                        </div>

                        <div class="campos-linha">
                            <div class="campo">
                                <label for="estado">Estado</label>
                                <input type="text" id="estado" name="estado"
                                       placeholder="UF" required maxlength="2"/>
                            </div>
                            <div class="campo">
                                <label for="pais">País</label>
                                <input type="text" id="pais" name="pais"
                                       placeholder="Brasil" required/>
                            </div>
                        </div>

                        <div class="campo">
                            <label for="categoria">Categoria (Esporte)</label>
                            <select id="categoria" name="categoria" required>
                                <option value="" disabled selected>Selecione o esporte...</option>
                                <option value="futebol">Futebol</option>
                                <option value="tenis">Tênis</option>
                                <option value="beach-tenis">Beach Tênis</option>
                                <option value="volei">Futvôlei</option>
                            </select>
                        </div>

                        <div class="toggle-tipo">
                            <span>Tipo de Quadra</span>
                            <div class="toggle-botoes">
                                <button type="button" class="btn-toggle ativo" id="btn-fechada"
                                        onclick="selecionarTipo('fechada')">
                                    🏠 Quadra Fechada
                                </button>
                                <button type="button" class="btn-toggle" id="btn-aberta"
                                        onclick="selecionarTipo('aberta')">
                                    🌤️ Quadra Aberta
                                </button>
                            </div>
                            <input type="hidden" id="tipo-quadra" name="tipo-quadra" value="fechada"/>
                        </div>

                    </form>
                </div>

            </div>
        </div>

        <div class="container-salvar">
            <button type="submit" class="btn-salvar" id="btn-salvar"
                    onclick="salvarFormulario()">
                Salvar Filial
            </button>
        </div>

    </main>
    </div>
  );
}

export default Home;