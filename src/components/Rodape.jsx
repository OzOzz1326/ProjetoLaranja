import { Link } from 'react-router-dom';
import './Rodape.css';

function Rodape() {
  return (
    <footer className="rodape">
      <div className="rodape-contato">
        <span>Contato</span>
        <Link to="/contato">Fale conosco</Link>
      </div>
      <nav>
        <Link to="/pagina-inicial">Início</Link>
        <Link to="/quadras">Quadras</Link>
        <a href="#">Sobre nós</a>
      </nav>
      <p>&copy; {new Date().getFullYear()} Sport In City. Todos os direitos reservados.</p>
    </footer>
  );
}

export default Rodape;