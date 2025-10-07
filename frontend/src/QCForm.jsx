
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { TextField, Button, MenuItem, Typography, Alert, Box } from '@mui/material';

const submitQCForm = async (form) => {
	const { data } = await axios.post('/api/qc', form);
	return data;
};

function QCForm() {
  const [searchParams] = useSearchParams();
  const machineId = Number(searchParams.get('machineId'));
  const [machineNo, setMachineNo] = useState('');
  const [form, setForm] = useState({ machineId, inspectorName: '', status: '', remarks: '' });
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch machine details to get machineNo
    async function fetchMachine() {
      try {
        const { data } = await axios.get(`/api/machines/${machineId}`);
        setMachineNo(data.productNo || data.machineNo || '');
      } catch {
        setMachineNo('');
      }
    }
    if (machineId) fetchMachine();
    setForm(f => ({ ...f, machineId }));
  }, [machineId]);

  const mutation = useMutation({
    mutationFn: submitQCForm,
    onSuccess: (data) => {
      navigate(`/machine/${machineId}`, { state: { qcSuccess: true } });
    }
  });
  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };
  const handleSubmit = e => {
    e.preventDefault();
    mutation.mutate(form);
  };
  return (
    <Box sx={{ maxWidth: 400 }}>
      <Typography variant="h5" gutterBottom align="center">QC Form</Typography>
      <Typography align="center" sx={{ mb: 2, fontWeight: 'bold' }}>Machine No.: {machineNo}</Typography>
      <form onSubmit={handleSubmit}>
        {/* Machine No. is shown above, not editable */}
        <TextField label="Inspector Name" name="inspectorName" value={form.inspectorName} onChange={handleChange} fullWidth margin="normal" required />
        <TextField select label="Status" name="status" value={form.status} onChange={handleChange} fullWidth margin="normal" required>
          <MenuItem value="PASS">PASS</MenuItem>
          <MenuItem value="FAIL">FAIL</MenuItem>
        </TextField>
        <TextField label="Remarks" name="remarks" value={form.remarks} onChange={handleChange} fullWidth margin="normal" multiline rows={2} />
        <Button type="submit" variant="contained" sx={{ mt: 2 }} disabled={mutation.isLoading}>
          {mutation.isLoading ? 'Submitting...' : 'Submit'}
        </Button>
        {mutation.isError && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {mutation.error?.response?.data || 'Submission failed. Please try again.'}
          </Alert>
        )}
      </form>
    </Box>
  );
}


export default QCForm;
