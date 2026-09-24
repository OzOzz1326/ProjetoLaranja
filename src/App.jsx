import { BrowserRouter, Route, Routes } from "react-router-dom";
import MenuSuperior from "./components/MenuSuperior";
import Rodape from "./components/Rodape";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Cadastro from "./pages/Cadastro";
import Quadras from "./pages/Quadras";

function App() {
  return (
    <BrowserRouter>
      <MenuSuperior />
      <Routes>
        <Route path="/pagina-inicial" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/quadras" element={<Quadras />} />
      </Routes>
      <Rodape />
    </BrowserRouter>
  );
}

export default App;