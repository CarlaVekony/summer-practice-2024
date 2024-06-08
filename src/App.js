import './App.css';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Login } from "./pages/login/index";
import { Signin } from "./pages/signin/index";
import { Home } from "./pages/home/index";
import { View } from "./pages/view/index";

function App() {
  return (
      <div className="App">
        <Router>
          <div className="content">
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/sign-in" element={<Signin />} />
              <Route path="/home" element={<Home />} />
              <Route path="/view/:groupId" element={<View />} />
            </Routes>
          </div>
        </Router>
      </div>
  );
}

export default App;
