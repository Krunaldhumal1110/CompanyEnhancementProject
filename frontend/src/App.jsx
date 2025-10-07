import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Dashboard from './Dashboard.jsx';
// import QCForm from './QCForm.jsx';
import MachineGrid from './MachineGrid.jsx';
import MachineDetail from './MachineDetail.jsx';
import CompletedMachines from './CompletedMachines.jsx';
import QCForm from './QCForm.jsx';
import TailwindCheck from './TailwindCheck.jsx';
import { CssBaseline } from '@mui/material';
import logo from './assets//cat-logo.png';

function App() {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <CssBaseline />
      <Router>
        {/* Responsive Tailwind header with collapsible mobile menu */}
        <header className="w-full bg-gradient-to-r from-indigo-600 to-pink-600 p-3 shadow-md">
          <div className="container mx-auto flex items-center justify-between md:gap-6">
            <div className="flex items-center gap-3">
              <img src="/cat-logo.png" alt="Catalis logo" className="logo-img block h-10" />
              <div className="flex flex-col">
                <div className="text-white font-extrabold text-sm sm:text-lg">Catalis Packaging Technologies Pvt. Ltd.</div>
                <div className="text-white/80 text-xs sm:text-sm">Manufacturers of Packaging Machinery</div>
              </div>
            </div>

            <nav className="hidden md:flex space-x-4">
              <Link to="/" className="text-white hover:underline">Workshop</Link>
              {/* <Link to="/qcform" className="text-white hover:underline">QC Form</Link> */}
              <Link to="/completed" className="text-white hover:underline">Completed</Link>
            </nav>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button aria-label="Toggle menu" onClick={() => setOpen(!open)} className="text-white p-2">
                {open ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                )}
              </button>
            </div>
          </div>

          {/* Mobile collapsible menu */}
          {open && (
            <div className="md:hidden bg-indigo-600/90 p-3 mobile-menu-enter-active">
              <Link to="/" className="block text-white py-2">Workshop</Link>
              {/* <Link to="/qcform" className="block text-white py-2">QC Form</Link> */}
              <Link to="/completed" className="block text-white py-2">Completed</Link>
            </div>
          )}
        </header>

        <main className="container mx-auto mt-6 bg-white min-h-[80vh] p-6 rounded-lg shadow-sm">
          <Routes>
            <Route path="/" element={<MachineGrid />} />
            <Route path="/qcform" element={<QCForm />} />
            <Route path="/machine/:id" element={<MachineDetail />} />
            <Route path="/completed" element={<CompletedMachines />} />
            <Route path="/tailwind-check" element={<TailwindCheck />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </main>
      </Router>
    </>
  );
}

export default App;
