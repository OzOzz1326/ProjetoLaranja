import './Rodape.css';

function Rodape() {
  return (
    <footer className="rodape">
      <nav>
        <a href="#home">Início</a>
        <a href="#sobre">Sobre</a>
        <a href="#contato">Contato</a>
      </nav>
      <p>&copy; {new Date().getFullYear()} Meu Site. Todos os direitos reservados.</p>
    </footer>
  );
}

export default Rodape;