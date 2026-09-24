import "./Login.css"

function Login() {
    return (
        <div>
            <main className="container-login">
                <div className="card-login">
                    <div className="topo-card">
                        <div className="icone-login">
                            <div className="head-icon"></div>
                            <div className="body-icon"></div>
                        </div>
                        <h1 className="titulo-login">Login</h1>
                    </div>

                    <form className="formulario">
                        <label htmlFor="email">Telefone/Email:</label>
                        <input type="text" id="email" className="input-login" placeholder="Telefone ou Email" required />

                        <label htmlFor="senha">Senha:</label>
                        <input type="password" id="senha" className="input-login" placeholder="Senha" required />

                        <div className="botao-login">
                            <button type="submit" className="btn-entrar">Entrar</button>
                        </div>

                        <a href="#" className="esqueci-senha">Esqueci minha senha.</a>

                        <p className="cadastro">Não possui uma conta? <a href="cadastro.html">Cadastre-se aqui!</a></p>
                    </form>
                </div>
            </main>
        </div>
    );
}

export default Login;