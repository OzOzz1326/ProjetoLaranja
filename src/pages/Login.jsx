import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../supabase";
import "./Cadastro.css";
import "./Login.css";

function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [entrando, setEntrando] = useState(false);

    async function entrar(evento) {
        evento.preventDefault();

        if (!supabase) {
            alert("Não foi possível conectar ao serviço de login.");
            return;
        }

        setEntrando(true);

        try {
            const { data, error } = await supabase.auth.signInWithPassword({ email, password: senha });

            if (error) {
                console.error("Erro ao fazer login:", error);
                alert(`Não foi possível entrar: ${error.message}`);
                return;
            }

            const { data: perfil, error: erroPerfil } = await supabase
                .from("usuarios")
                .select("id")
                .eq("email", data.user.email)
                .maybeSingle();

            if (erroPerfil || !perfil) {
                console.error("Não foi possível encontrar o perfil do usuário:", erroPerfil);
                await supabase.auth.signOut();
                alert("Não foi possível localizar seu perfil. Confira se o cadastro foi concluído.");
                return;
            }

            navigate("/pagina-inicial");
        } catch (error) {
            console.error("Erro inesperado ao fazer login:", error);
            alert("Ocorreu um erro ao entrar. Confira o console do navegador.");
        } finally {
            setEntrando(false);
        }
    }

    return (
        <main className="pagina-cadastro">
            <div className="titulo-pagina">
                <h1>Login</h1>
                <p>Bem-vindo de volta ao Sport In City</p>
            </div>

            <div className="card-form cadastro-card">
                <h2>Acesse sua conta</h2>

                <form className="form-cadastro" onSubmit={entrar}>
                    <div className="campo">
                        <label htmlFor="email">Email</label>
                        <input
                            id="email"
                            type="email"
                            placeholder="seuemail@exemplo.com"
                            value={email}
                            onChange={(evento) => setEmail(evento.target.value)}
                            required
                        />
                    </div>

                    <div className="campo">
                        <label htmlFor="senha">Senha</label>
                        <input
                            id="senha"
                            type="password"
                            placeholder="Senha"
                            value={senha}
                            onChange={(evento) => setSenha(evento.target.value)}
                            required
                        />
                    </div>

                    <div className="termos">
                        <a href="#" style={{ color: '#57C785', fontSize: '13px', textDecoration: 'none' }}>Esqueci minha senha</a>
                    </div>

                    <button type="submit" className="btn-salvar" disabled={entrando}>
                        {entrando ? "Entrando..." : "Entrar"}
                    </button>

                    <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: '#8ab894' }}>
                        Não possui uma conta? <Link to="/cadastro" style={{ color: '#57C785', fontWeight: 'bold', textDecoration: 'none' }}>Cadastre-se aqui!</Link>
                    </p>
                </form>
            </div>
        </main>
    );
}

export default Login;