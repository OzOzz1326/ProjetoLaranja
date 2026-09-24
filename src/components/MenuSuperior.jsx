import './MenuSuperior.css'

function MenuSuperior() {
    return (
        <div>
            <nav className="navbar">
                <div className="logo-container">
                    <img src="../logosfundo.png" alt="Sportincity Logo" />
                </div>
                <ul className="nav-links">
                    <li><a href="#">Início</a></li>
                    <li><a href="#">Quadras</a></li>
                </ul>
                <div className="search-container">
                    <input type="text" placeholder="Pesquisar..." className="search-input" id="busca" />
                    <button className="search-btn" aria-label="Buscar">🔍</button>
                </div>
                <button className="btn-login" id="btn-login">Login</button>
            </nav>
        </div>
    );
}

export default MenuSuperior;
