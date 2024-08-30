import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import WelcomePage from "./Components/WelcomePage";
import PossessionsPage from "./Components/PossessionsPage";
import PatrimoineGraph from "./Components/PatrimoineGraph";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/possessions" element={<PossessionsPage />} />
        <Route path="/graphique" element={<PatrimoineGraph />} />
      </Routes>
    </Router>
  );
}
