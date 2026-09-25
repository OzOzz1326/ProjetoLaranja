import { BrowserRouter, Route, Routes } from "react-router-dom";
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

function App() {
  return (
    <BrowserRouter>
      <MenuSuperior />
      <Routes>
        <Route path="/pagina-inicial" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/quadras" element={<Quadras />} />
        <Route path="/cadastrar-quadra" element={<CriarQuadra />} />
        <Route path="/pagamento" element={<Pagamento />} />
        <Route path="/contato" element={<Contato />} />
        <Route path="/detalhes" element={<Detalhes />} />
      </Routes>
      <Rodape />
    </BrowserRouter>
  );
}

export default App;