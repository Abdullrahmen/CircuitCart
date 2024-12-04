import { Routes, Route } from 'react-router';
import './App.css';
import Home from './pages/Home/Home';

function App() {
  return (
    <div className="app">
      {' '}
      <Routes>
        {' '}
        <Route path="/" element={<Home />} />{' '}
        {/* <Route path="/about" element={<About />} />  */}
        {/* <Route path="/contact" element={<Contact /> */}
      </Routes>{' '}
    </div>
  );
}

export default App;
