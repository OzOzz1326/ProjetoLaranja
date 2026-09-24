import "./Cadastro.css";
import "./Login.css";

function Login() {
    return (
        <main className="pagina-cadastro">
            <div className="titulo-pagina">
                <h1>Login</h1>
                <p>Bem-vindo de volta ao Sport In City</p>
            </div>

            <div className="card-form cadastro-card">
                <h2>Acesse sua conta</h2>

                <form className="form-cadastro">
                    <div className="campo">
                        <label htmlFor="email">Telefone/Email</label>
                        <input id="email" type="text" placeholder="Telefone ou Email" required />
                    </div>

                    <div className="campo">
                        <label htmlFor="senha">Senha</label>
                        <input id="senha" type="password" placeholder="Senha" required />
                    </div>

                    <div className="termos">
                        <a href="#" style={{ color: '#57C785', fontSize: '13px', textDecoration: 'none' }}>Esqueci minha senha</a>
                    </div>

                    <button type="submit" className="btn-salvar">
                        Entrar
                    </button>

                    <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: '#8ab894' }}>
                        Não possui uma conta? <a href="./Cadastro" style={{ color: '#57C785', fontWeight: 'bold', textDecoration: 'none' }}>Cadastre-se aqui!</a>
                    </p>
                </form>
            </div>
        </main>
    );
}

export default Login;