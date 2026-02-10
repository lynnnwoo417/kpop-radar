import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import EventDetail from './pages/EventDetail';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/event/:id" element={<EventDetail />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
