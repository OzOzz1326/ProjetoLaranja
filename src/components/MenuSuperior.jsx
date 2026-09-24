import { Link } from 'react-router-dom';
import './MenuSuperior.css';

function MenuSuperior() {
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
                </ul>

                <div className="nav-actions">
                    <div className="search-container">
                        <input type="text" placeholder="Pesquisar..." className="search-input" id="busca" />
                        <button className="search-btn" aria-label="Buscar">🔍</button>
                    </div>

                    <Link to="/login" className="btn-login" id="btn-login">
                        Login
                    </Link>
                </div>
            </nav>
        </div>
    );
}

export default MenuSuperior;
