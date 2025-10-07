import React, { useState, useRef } from 'react';
import { Grid, Card, CardContent, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Snackbar } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

const BLOCKS = 12;

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

  // Mutations
  const addMachineMutation = useMutation({
    mutationFn: addMachineApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['machines'] });
    },
  });

  const completeMachineMutation = useMutation({
    mutationFn: completeMachineApi,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['machines'] }),
  });

  const deleteMachineMutation = useMutation({
    mutationFn: deleteMachineApi,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['machines'] }),
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

  // Always 12 blocks, fill with machines or empty
  const blocks = Array.from({ length: BLOCKS }, (_, i) => {
    const machine = machines.find((m) => m.blockNo === i + 1);
    return machine ? { ...machine, block: i + 1 } : { block: i + 1 };
  });

  // Handlers
  const handleAddClick = (blockIdx) => {
    const blockMachine = machines.find((m) => m.blockNo === blockIdx + 1);
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
    await completeMachineMutation.mutateAsync(machine.id);
    setSnackbar({
      open: true,
      message: 'Would you like to remove this machine from shopfloor?',
      action: (
        <Button color="inherit" size="small" onClick={() => removeMachine(machine.id)}>
          Yes, Remove
        </Button>
      ),
    });
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
      <Grid container spacing={2} sx={{ mt: 2, background: '#fff', minHeight: '80vh', p: 2 }}>
        {blocks.map((m, idx) => (
          <Grid item xs={6} sm={4} md={3} key={idx}>
            <Card
              sx={{
                background: m.completed
                  ? '#c8e6c9'
                  : m.status === 'INCOMPLETE'
                  ? '#ffcdd2'
                  : '#fff',
                minHeight: 120,
              }}
            >
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h6">Machine No. {m.block}</Typography>
                {m.id ? (
                  <>
                    <Typography variant="subtitle1">Model: {m.model}</Typography>
                    <Typography variant="subtitle2">Product No.: {m.productNo}</Typography>
                    <Button
                      variant="contained"
                      onClick={() => navigate(`/machine/${m.id}`)}
                      sx={{ mt: 1 }}
                    >
                      View Details
                    </Button>
                    {!m.completed && (
                      <Button
                        variant="outlined"
                        color="warning"
                        sx={{ mt: 1 }}
                        onClick={() => markComplete(m)}
                      >
                        Mark as Complete
                      </Button>
                    )}
                  </>
                ) : (
                  <Button
                    variant="outlined"
                    color="primary"
                    sx={{ mt: 2 }}
                    onClick={() => handleAddClick(idx)}
                  >
                    Add Machine
                  </Button>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

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
