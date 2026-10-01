import './Rodape.css';

function Rodape() {
  const anoAtual = new Date().getFullYear();

  return (
    <footer className="rodape-simples" role="contentinfo">
      <div className="rodape-simples-conteudo">
        <div className="rodape-simples-marca">
          <img src="/logosfundo.png" alt="Sport In City" className="rodape-simples-logo" />
          <span className="rodape-simples-titulo">SPORT IN CITY</span>
        </div>
        <p className="rodape-simples-direitos">
          &copy; {anoAtual} Sport In City. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
}

export default Rodape;