import React, { useState, useRef } from 'react';
import { Grid, Card, CardContent, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Snackbar } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

const BLOCKS_X = 5;
const BLOCKS_Y = 3;
const BLOCKS = BLOCKS_X * BLOCKS_Y;

// API calls
const addMachineApi = async (formData) => {
  const { data } = await axios.post('/api/machines', formData, {
   headers: {
      "Content-Type": "multipart/form-data"}});
  return data;
};

const fetchMachines = async () => {
  const { data } = await axios.get('/api/machines');
  return data;
};

const completeMachineApi = async (id) => {
  const { data } = await axios.post(`/api/machines/${id}/complete`);
  return data;
};

const deleteMachineApi = async (id) => {
  await axios.delete(`/api/machines/${id}`);
};

function MachineGrid() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [pdfFile, setPdfFile] = useState(null);
  const fileInputRef = useRef();

  // ✅ React Query: fetch machines directly
  const { data: machines = [] } = useQuery({
    queryKey: ['machines'],
    queryFn: fetchMachines,
    staleTime: 5 * 60 * 1000, // keep cached for 5 minutes
    select: (data) =>
      Array.isArray(data)
        ? data.sort((a, b) => (a.blockNo || 0) - (b.blockNo || 0))
        : [],
    refetchOnWindowFocus: false,
  });

  // Helper to extract a readable error message from Axios errors
  const getErrorMessage = (err) => {
    if (!err) return 'Unknown error';
    if (err.response && err.response.data) {
      if (typeof err.response.data === 'string') return err.response.data;
      if (err.response.data.message) return err.response.data.message;
      try { return JSON.stringify(err.response.data); } catch (e) {}
    }
    return err.message || String(err);
  };

  // Mutations
  const addMachineMutation = useMutation({
    mutationFn: addMachineApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['machines'] });
    },
    onError: (err) => {
      setSnackbar({ open: true, message: getErrorMessage(err), action: null });
    }
  });

  const completeMachineMutation = useMutation({
    mutationFn: completeMachineApi,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['machines'] }),
    onError: (err) => {
      setSnackbar({ open: true, message: getErrorMessage(err), action: null });
    }
  });

  const deleteMachineMutation = useMutation({
    mutationFn: deleteMachineApi,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['machines'] }),
    onError: (err) => {
      setSnackbar({ open: true, message: getErrorMessage(err), action: null });
    }
  });

  // UI state
  const [open, setOpen] = useState(false);
  const [selectedBlock, setSelectedBlock] = useState(null);
  const MACHINE_MODELS = [
    'CPT425-SERRA',
    'CPT525-SERRA',
    'CPT625-SERRA',
    'CPT650-SERRA',
    'CPT825-SERRA',
  ];
  const [form, setForm] = useState({ model: '', productNo: '' });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', action: null });
  const [checkingMachineId, setCheckingMachineId] = useState(null);

  // Only show non-completed machines in workshop area
  const workshopMachines = machines.filter((m) => !m.completed);
  // Always 5x3 blocks, fill with non-completed machines or empty
  const blocks = Array.from({ length: BLOCKS }, (_, i) => {
    const machine = workshopMachines.find((m) => m.blockNo === i + 1);
    return machine ? { ...machine, block: i + 1 } : { block: i + 1 };
  });

  // Handlers
  const handleAddClick = (blockIdx) => {
    // Use the rendered blocks mapping to decide occupancy (keeps UI/data consistent)
    const block = blocks[blockIdx];
    const blockMachine = block && block.id;
    if (blockMachine) {
      setSnackbar({
        open: true,
        message: 'This block already has a machine. Please select an empty block.',
        action: null,
      });
      return;
    }
    setSelectedBlock(blockIdx);
    setForm({ model: '', productNo: '' });
    setOpen(true);
    setPdfFile(null);
  };

  const handleAddMachine = async () => {
    if (!form.model || !/^\d{7}$/.test(form.productNo)) {
      setSnackbar({ open: true, message: 'Enter model and unique 7-digit machine no.', action: null });
      return;
    }
    if (!pdfFile) {
      setSnackbar({ open: true, message: 'Please upload a master order PDF.', action: null });
      return;
    }
    const exists = machines.some((m) => m.productNo === form.productNo);
    if (exists) {
      setSnackbar({ open: true, message: 'Machine no. must be unique!', action: null });
      return;
    }

    const formData = new FormData();
    formData.append('name', `M/C-${selectedBlock + 1}`);
    formData.append('status', 'INCOMPLETE');
    formData.append('completed', false);
    formData.append('masterCardInfo', '');
    formData.append('electricDrawingPath', '');
    formData.append('machineNo', String(selectedBlock + 1));
    formData.append('model', form.model);
    formData.append('productNo', form.productNo);
    formData.append('blockNo', selectedBlock + 1);
    formData.append('pdf', pdfFile);

    try {
      await addMachineMutation.mutateAsync(formData);
      setOpen(false);
      setSelectedBlock(null);
      setPdfFile(null);
    } catch (err) {
      let msg = 'Upload failed';
      if (err?.response?.data) {
        if (typeof err.response.data === 'string') {
          msg = err.response.data;
        } else if (typeof err.response.data === 'object' && err.response.data.message) {
          msg = err.response.data.message;
        }
      }
      setSnackbar({
        open: true,
        message: msg,
        action: null,
      });
    }
  };

  const markComplete = async (machine) => {
    // Before marking complete, verify all required PDFs exist (master card, electric drawing, QC form)
    setCheckingMachineId(machine.id);
    try {
      const missing = [];
      if (!machine.masterCardInfo) missing.push('Master Card PDF');
      if (!machine.electricDrawingPath) missing.push('Electric Drawing PDF');

      // Check QC forms for this machine
      try {
        const { data: qcForms } = await axios.get(`/api/qc?machineId=${machine.id}`);
        const hasQcPdf = Array.isArray(qcForms) && qcForms.some(q => q.pdfPath);
        if (!hasQcPdf) missing.push('QC Form PDF');
      } catch (e) {
        // If QC endpoint fails, be conservative and show QC Form as missing
        missing.push('QC Form PDF');
      }

      if (missing.length > 0) {
        setSnackbar({ open: true, message: `Cannot complete: please upload ${missing.join(', ')}`, action: null });
        setCheckingMachineId(null);
        return;
      }

      await completeMachineMutation.mutateAsync(machine.id);
      setSnackbar({
        open: true,
        message: 'Machine marked complete. View completed list?',
        action: (
          <Button color="inherit" size="small" onClick={() => navigate('/completed')}>
            View Completed
          </Button>
        ),
      });
    } catch (err) {
      setSnackbar({ open: true, message: getErrorMessage(err), action: null });
    } finally {
      setCheckingMachineId(null);
    }
  };

  const removeMachine = async (id) => {
    await deleteMachineMutation.mutateAsync(id);
    setSnackbar({
      open: true,
      message: 'Machine removed from shopfloor and added to completed table.',
      action: null,
    });
  };

  // UI
  return (
    <>
      {/* Modern Header */}
      <header className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 sm:px-8 animate-fade-in gap-3">
        <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight drop-shadow-lg">Workshop Machines</h1>
        <span className="text-sm sm:text-lg text-white/80 font-medium">{blocks.filter(b => b.id).length} / {BLOCKS} Occupied</span>
      </header>

      {/* Responsive Grid with Tailwind */}
      <div className="grid gap-6 px-4 sm:px-6 pb-8 animate-fade-in grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {blocks.map((m, idx) => (
          <div key={idx} className="rounded-xl shadow-xl bg-white hover:scale-105 transition-transform duration-300 ease-in-out border-2 border-gray-100 flex flex-col items-center justify-center min-h-[140px] sm:min-h-[160px] p-4">
            {m.id ? (
              <>
                <div className="w-full flex flex-col items-center py-4">
                  <span className="text-md sm:text-lg font-bold text-blue-700 mb-1">Machine #{m.block}</span>
                  <span className="text-xs sm:text-sm text-gray-500">Model: <span className="font-semibold text-gray-700">{m.model}</span></span>
                  <span className="text-xs sm:text-sm text-gray-500">Product No.: <span className="font-semibold text-gray-700">{m.productNo}</span></span>
                  <div className="mt-2">
                    {m.masterCardInfo && m.electricDrawingPath ? (
                      <span className="inline-block px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">Ready</span>
                    ) : (
                      <span className="inline-block px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs font-semibold">Missing PDFs</span>
                    )}
                    {checkingMachineId === m.id && (
                      <span className="ml-2 inline-block text-sm text-gray-600">Checking...</span>
                    )}
                  </div>
                </div>
                <button
                  className="w-full sm:w-4/5 py-2 mb-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold shadow hover:from-blue-600 hover:to-purple-700 transition-colors duration-200"
                  onClick={() => navigate(`/machine/${m.id}`)}
                >
                  View Details
                </button>
                {!m.completed && (
                  <button
                    className="w-full sm:w-4/5 py-2 rounded-lg border border-yellow-400 text-yellow-700 font-semibold bg-yellow-50 hover:bg-yellow-100 transition-colors duration-200"
                    onClick={() => markComplete(m)}
                  >
                    Mark as Complete
                  </button>
                )}
              </>
            ) : (
              <button
                className="w-full sm:w-4/5 py-3 rounded-lg border border-blue-400 text-blue-700 font-semibold bg-blue-50 hover:bg-blue-100 transition-colors duration-200 mt-4"
                onClick={() => handleAddClick(idx)}
              >
                Add Machine
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Add Machine Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Add Machine</DialogTitle>
        <DialogContent>
          <TextField
            select
            label=""
            value={form.model}
            onChange={(e) => setForm({ ...form, model: e.target.value })}
            fullWidth
            margin="normal"
            SelectProps={{ native: true }}
            autoFocus
          >
            <option value="">Select Model</option>
            {MACHINE_MODELS.map((model) => (
              <option key={model} value={model}>
                {model}
              </option>
            ))}
          </TextField>
          <TextField
            label="Machine No. (7 digits)"
            value={form.productNo}
            onChange={(e) => setForm({ ...form, productNo: e.target.value })}
            fullWidth
            margin="normal"
            inputProps={{ maxLength: 7 }}
          />
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            style={{ display: 'block', marginTop: 16 }}
            onChange={(e) => setPdfFile(e.target.files[0])}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleAddMachine} variant="contained">
            Add
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
        action={snackbar.action}
      />
    </>
  );
}

export default MachineGrid;
