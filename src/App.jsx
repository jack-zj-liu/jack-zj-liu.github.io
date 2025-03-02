import React from "react";
import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./components/pages/Home";
import Animal from "./components/pages/Animal";
import Projects from "./components/pages/Projects";
import About from "./components/pages/About";
import Resume from "./components/pages/Resume";
import Codenames from "./components/pages/Codenames";

function App() {
  return (
    <>
    <Router>
      <Routes>
        <Route path="/" exact element={<Home />} />
        <Route path="/animal" element={<Animal />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/about" element={<About />} />
        <Route path="/resume" element={<Resume />} />
        <Route path="/codenames" element={<Codenames />} />
        
      </Routes>
    </Router>
  </>
  );
}

export default App;
