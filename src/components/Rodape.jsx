import './Rodape.css';

function Rodape() {
  return (
    <footer className="rodape">
      <nav>
        <a href="#">Início</a>
        <a href="#">Quadras</a>
        <a href="#">Eventos</a>
        <a href="#">Contato</a>
      </nav>
      <p>&copy; {new Date().getFullYear()} Sport In City. Todos os direitos reservados.</p>
    </footer>
  );
}

export default Rodape;