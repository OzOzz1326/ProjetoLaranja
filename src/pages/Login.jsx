import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../supabase";
import "./Login.css";

function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [entrando, setEntrando] = useState(false);

    async function entrar(evento) {
        evento.preventDefault();

        if (!supabase) {
            alert("Não foi possível conectar ao Supabase. Verifique a configuração.");
            return;
        }

        setEntrando(true);

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email.trim(),
                password: senha,
            });

            if (error) {
                console.error("Erro ao fazer login:", error);
                alert(`Não foi possível entrar: ${error.message}`);
                return;
            }

            // Busca os dados completos do usuário na tabela 'usuarios'
            const { data: perfil, error: erroPerfil } = await supabase
                .from("usuarios")
                .select("*")
                .eq("email", data.user.email)
                .maybeSingle();

            if (erroPerfil) {
                console.warn("Aviso ao buscar perfil adicional:", erroPerfil);
            }

            // Objeto do usuário com fallback para metadata do Auth
            const dadosUsuario = perfil || {
                id: data.user.id,
                email: data.user.email,
                nome: data.user.user_metadata?.nome || data.user.email.split("@")[0],
                data_nascimento: data.user.user_metadata?.data_nascimento || "",
            };

            // Guarda os dados da sessão do usuário no localStorage
            localStorage.setItem("usuario", JSON.stringify(dadosUsuario));

            alert(`Login realizado com sucesso! Bem-vindo(a), ${dadosUsuario.nome || "ao SportInCity"}!`);
            navigate("/pagina-inicial");
        } catch (error) {
            console.error("Erro inesperado ao fazer login:", error);
            alert("Ocorreu um erro ao entrar. Confira os dados digitados.");
        } finally {
            setEntrando(false);
        }
    }

    return (
        <main id="pagina-login" className="pagina-login">
            <div className="card-login">
                <div className="avatar-header-login">
                    <svg viewBox="0 0 24 24" width="64" height="64" fill="currentColor">
                        <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
                    </svg>
                </div>

                <h1>Login</h1>

                <form className="form-login" onSubmit={entrar}>
                    <div className="campo-login">
                        <label htmlFor="login-email">Telefone/Email:</label>
                        <input
                            id="login-email"
                            type="text"
                            placeholder="seuemail@exemplo.com"
                            value={email}
                            onChange={(evento) => setEmail(evento.target.value)}
                            required
                        />
                    </div>

                    <div className="campo-login">
                        <label htmlFor="login-senha">Senha:</label>
                        <input
                            id="login-senha"
                            type="password"
                            placeholder="Sua senha"
                            value={senha}
                            onChange={(evento) => setSenha(evento.target.value)}
                            required
                        />
                    </div>

                    <div className="esqueci-senha">
                        <a href="#" onClick={(e) => { e.preventDefault(); alert("Entre em contato com o suporte para redefinir sua senha."); }}>
                            Esqueci minha senha.
                        </a>
                    </div>

                    <button type="submit" className="btn-entrar" disabled={entrando}>
                        {entrando ? "Entrando..." : "Entrar"}
                    </button>

                    <p className="link-cadastro">
                        Não possui uma conta? <Link to="/cadastro">Cadastre-se aqui!</Link>
                    </p>
                </form>
            </div>
        </main>
    );
}

export default Login;