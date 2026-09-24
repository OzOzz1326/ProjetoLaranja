import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Cadastro from "./pages/Cadastro";
import Quadras from "./pages/Quadras";

function App() {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path="/pagina-inicial" element={<Home/>}/>
          <Route path="/login" element={<Login/>}/>
          <Route path="/cadastro" element={<Cadastro/>}/>
          <Route path="/quadras" element={<Quadras/>}/>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;