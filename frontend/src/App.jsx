import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Dashboard from './Dashboard.jsx';
// import QCForm from './QCForm.jsx';
import MachineGrid from './MachineGrid.jsx';
import MachineDetail from './MachineDetail.jsx';
import CompletedMachines from './CompletedMachines.jsx';
import QCForm from './QCForm.jsx';
import { AppBar, Toolbar, Typography, Button, Container, CssBaseline } from '@mui/material';

function App() {
  return (
    <>
      <CssBaseline />
      <Router>
        <AppBar position="static" sx={{ background: '#ff9800' }}>
          <Toolbar>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>Company Intranet</Typography>
            <Button color="inherit" component={Link} to="/">Workshop Desktop</Button>
            {/* <Button color="inherit" component={Link} to="/qcform">QC Form</Button> */}
            <Button color="inherit" component={Link} to="/completed">Completed Machines</Button>
          </Toolbar>
        </AppBar>
        <Container sx={{ mt: 4, background: '#fff', minHeight: '90vh' }}>
          <Routes>
            <Route path="/" element={<MachineGrid />} />
            <Route path="/qcform" element={<QCForm />} />
            <Route path="/machine/:id" element={<MachineDetail />} />
            <Route path="/completed" element={<CompletedMachines />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </Container>
      </Router>
    </>
  );
}

export default App;
