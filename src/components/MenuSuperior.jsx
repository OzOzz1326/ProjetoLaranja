import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './MenuSuperior.css';

function MenuSuperior() {
    const navigate = useNavigate();
    const [termoBusca, setTermoBusca] = useState("");

    function realizarBusca(evento) {
        evento.preventDefault();
        const termo = termoBusca.trim();

        if (termo) {
            navigate(`/quadras?busca=${encodeURIComponent(termo)}`);
            return;
        }

        navigate('/quadras');
    }

    return (
        <div>
            <nav className="navbar">
                <div className="logo-container">
                    <Link to="/pagina-inicial" aria-label="Ir para a página inicial">
                        <img src="../logosfundo.png" alt="Sportincity Logo" />
                    </Link>
                </div>

                <ul className="nav-links">
                    <li><Link to="/pagina-inicial">Início</Link></li>
                    <li><Link to="/quadras">Quadras</Link></li>
                    <li><Link to="/contato">Contato</Link></li>
                </ul>

                <div className="nav-actions">
                    <form className="search-container" onSubmit={realizarBusca}>
                        <input
                            type="text"
                            placeholder="Pesquisar..."
                            className="search-input"
                            id="busca"
                            value={termoBusca}
                            onChange={(evento) => setTermoBusca(evento.target.value)}
                        />
                        <button type="submit" className="search-btn" aria-label="Buscar">🔍</button>
                    </form>

                    <Link to="/login" className="btn-login" id="btn-login">
                        Login
                    </Link>
                </div>
            </nav>
        </div>
    );
}

export default MenuSuperior;
