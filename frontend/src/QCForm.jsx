import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { TextField, Button, MenuItem, Typography, Alert, Box } from '@mui/material';

const submitQCForm = async (form) => {
  const { data } = await axios.post('/api/qc', form);
  return data;
};

function QCForm() {
	const [form, setForm] = useState({ machineId: '', inspectorName: '', status: '', remarks: '' });
	const [pdfLink, setPdfLink] = useState(null);
	const mutation = useMutation({
		mutationFn: submitQCForm,
		onSuccess: (data) => {
			setPdfLink(`/api/qc/${data.id}/pdf`);
		}
	});
	const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });
	const handleSubmit = e => {
		e.preventDefault();
		mutation.mutate(form);
	};
	if (pdfLink) {
		return (
			<Box sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
				<Typography variant="h6" sx={{ mb: 2 }}>QC Form PDF</Typography>
				<iframe src={pdfLink} title="QC Form PDF" width="100%" height="600px" style={{ border: '1px solid #ccc' }} />
			</Box>
		);
	}
	return (
		<Box sx={{ maxWidth: 400 }}>
			<Typography variant="h5" gutterBottom>QC Form</Typography>
			<form onSubmit={handleSubmit}>
				<TextField label="Machine ID" name="machineId" value={form.machineId} onChange={handleChange} fullWidth margin="normal" required />
				<TextField label="Inspector Name" name="inspectorName" value={form.inspectorName} onChange={handleChange} fullWidth margin="normal" required />
				<TextField select label="Status" name="status" value={form.status} onChange={handleChange} fullWidth margin="normal" required>
					<MenuItem value="PASS">PASS</MenuItem>
					<MenuItem value="FAIL">FAIL</MenuItem>
				</TextField>
				<TextField label="Remarks" name="remarks" value={form.remarks} onChange={handleChange} fullWidth margin="normal" multiline rows={2} />
				<Button type="submit" variant="contained" sx={{ mt: 2 }} disabled={mutation.isLoading}>Submit</Button>
			</form>
		</Box>
	);
}
export default QCForm;
