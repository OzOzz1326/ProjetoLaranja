import './Rodape.css';

function Rodape() {
  return (
    <footer className="rodape">
      <nav>
        <a href="#home">Início</a>
        <a href="#quadras">Quadras</a>
        <a href="#eventos">Eventos</a>
        <a href="#contato">Contato</a>
      </nav>
      <p>&copy; {new Date().getFullYear()} Sport In City. Todos os direitos reservados.</p>
    </footer>
  );
}

export default Rodape;