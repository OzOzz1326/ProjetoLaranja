import MenuSuperior from "../components/MenuSuperior";
import Rodape from "../components/Rodape";
import Produto from "../components/Produto";

function Home() {

  const deck = {
    display: "flex",
    backgroundColor: "#F0F0F0",
    gap: 20,
    flexDirection: "row"
  }

  return (
    <div>      
      <h1>Rotas e Componentes</h1>
      <p><strong>Rotas:</strong> permite criar páginas e navegação no site</p>
      <p><strong>Compenentes:</strong> pequenas partes de site (layout) reutilizáveis</p>

      <div style={deck}>
        <Produto nome="Ablublublé" descricao="ablebleblu"/>
        <Produto nome="AAAAAAAAAAA" descricao="AKJFHSDLJK"/>
        <Produto nome="OMEGALUL" descricao="KekW"/>
      </div>      
    </div>
  );
}

export default Home;