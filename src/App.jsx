import { BrowserRouter, Route, Routes } from "react-router-dom";
import BackgroundGotas from "./components/BackgroundGotas";
import MenuSuperior from "./components/MenuSuperior";
import Rodape from "./components/Rodape";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Cadastro from "./pages/Cadastro";
import Quadras from "./pages/Quadras";
import CriarQuadra from "./pages/CriarQuadra";
import Pagamento from "./pages/Pagamento";
import Contato from "./pages/Contato";
import Detalhes from "./pages/Detalhes";
import Perfil from "./pages/Perfil";
import Sobre from "./pages/Sobre";
import { TemaProvider, useTema } from "./context/TemaContext";

function ConteudoApp() {
  const { tema, temaInfo } = useTema();

  return (
    <div id="app-shell" className={tema}>
      <BackgroundGotas cores={temaInfo.paleta} />
      <MenuSuperior />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/pagina-inicial" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/perfil" element={<Perfil />} />
        <Route path="/quadras" element={<Quadras />} />
        <Route path="/cadastrar-quadra" element={<CriarQuadra />} />
        <Route path="/pagamento" element={<Pagamento />} />
        <Route path="/contato" element={<Contato />} />
        <Route path="/detalhes" element={<Detalhes />} />
        <Route path="/detalhes/:id" element={<Detalhes />} />
        <Route path="/perfil" element={<Perfil />} />
        <Route path="/sobre" element={<Sobre />} />
      </Routes>
      <Rodape />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <TemaProvider>
        <ConteudoApp />
      </TemaProvider>
    </BrowserRouter>
  );
}

export default App;