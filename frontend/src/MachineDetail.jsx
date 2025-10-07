import React, { useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Typography, Button, Box, List, ListItem, ListItemText } from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import dayjs from 'dayjs';

const fetchMachine = async (id) => {
	const { data } = await axios.get(`/api/machines/${id}`);
	return data;
};
const fetchQCForms = async (id) => {
	const { data } = await axios.get(`/api/qc?machineId=${id}`);
	return data;
};
const completeMachineApi = async (id) => {
	const { data } = await axios.post(`/api/machines/${id}/complete`);
	return data;
};

function getFileDate(path) {
	if (!path) return null;
	const match = path.match(/(\d{13})/);
	if (match) {
		const date = new Date(Number(match[1]));
		return dayjs(date).format('YYYY-MM-DD HH:mm');
	}
	return null;
}

function MachineDetail() {
	const { id } = useParams();
	const queryClient = useQueryClient();
	const [drawingFile, setDrawingFile] = useState(null);
	const [drawingMsg, setDrawingMsg] = useState('');
	const [qcMsg, setQcMsg] = useState('');
	const [masterFile, setMasterFile] = useState(null);
	const [masterMsg, setMasterMsg] = useState('');
	const fileInputRef = useRef();
	const masterInputRef = useRef();
	const { data: machine, isLoading } = useQuery({
		queryKey: ['machine', id],
		queryFn: () => fetchMachine(id)
	});
	const { data: qcForms = [] } = useQuery({
		queryKey: ['qcForms', id],
		queryFn: () => fetchQCForms(id)
	});
	const completeMutation = useMutation({
		mutationFn: () => completeMachineApi(id),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ['machine', id] })
	});
	const uploadDrawing = async () => {
		if (!drawingFile) {
			setDrawingMsg('Please select a PDF file.');
			return;
		}
		const formData = new FormData();
		formData.append('drawing', drawingFile);
		try {
			const { data } = await axios.post(`/api/machines/${id}/drawing`, formData);
			setDrawingMsg(data);
			queryClient.invalidateQueries({ queryKey: ['machine', id] });
		} catch (err) {
			setDrawingMsg(err?.response?.data || 'Upload failed');
		}
	};
	const uploadMasterCard = async () => {
		if (!masterFile) {
			setMasterMsg('Please select a PDF file.');
			return;
		}
		const formData = new FormData();
		formData.append('mastercard', masterFile);
		try {
			const { data } = await axios.post(`/api/machines/${id}/mastercard`, formData);
			setMasterMsg(data);
			queryClient.invalidateQueries({ queryKey: ['machine', id] });
		} catch (err) {
			setMasterMsg(err?.response?.data || 'Upload failed');
		}
	};
	const canComplete = Boolean(
		machine?.masterCardInfo &&
		machine?.electricDrawingPath &&
		qcForms.length > 0 &&
		qcForms.some(qc => qc.status === 'COMPLETE' && qc.pdfPath)
	);
	if (isLoading || !machine) return <div>Loading...</div>;
	return (
		<Box sx={{ mt: 2, maxWidth: 600, mx: 'auto', p: 3, background: '#fafafa', borderRadius: 2, boxShadow: 2 }}>
			<Typography variant="h5" sx={{ mb: 2 }}>{machine.name} Details</Typography>
			<Typography><b>Model:</b> {machine.model || 'N/A'}</Typography>
			<Typography><b>Product No.:</b> {machine.productNo || 'N/A'}</Typography>
			<Box sx={{ mb: 1 }}>
				<b>Master Card:</b> {machine.masterCardInfo ? (
					<>
						<a href={`/api/machines/${id}/mastercard`} target="_blank" rel="noopener noreferrer">View PDF</a>
						<span style={{ marginLeft: 8, color: '#888', fontSize: 12 }}>
							(Last uploaded: {getFileDate(machine.masterCardInfo) || 'N/A'})
						</span>
					</>
				) : 'N/A'}
				<Button variant="outlined" component="label" sx={{ ml: 2 }}>
					Upload Master Card
					<input type="file" accept="application/pdf" hidden ref={masterInputRef} onChange={e => setMasterFile(e.target.files[0])} />
				</Button>
				<Button variant="contained" onClick={uploadMasterCard} disabled={!masterFile} sx={{ ml: 1 }}>Upload</Button>
				{masterMsg && <Typography sx={{ ml: 2 }} color="secondary">{masterMsg}</Typography>}
			</Box>
			<Box sx={{ mt: 2, mb: 1 }}>
				<b>Electric Drawing:</b> {machine.electricDrawingPath ? (
					<>
						<a href={`/api/machines/${id}/drawingpdf`} target="_blank" rel="noopener noreferrer">View PDF</a>
						<span style={{ marginLeft: 8, color: '#888', fontSize: 12 }}>
							(Last uploaded: {getFileDate(machine.electricDrawingPath) || 'N/A'})
						</span>
					</>
				) : 'N/A'}
				<Button variant="outlined" component="label" sx={{ ml: 2 }}>
					Upload Electric Drawing
					<input type="file" accept="application/pdf" hidden ref={fileInputRef} onChange={e => setDrawingFile(e.target.files[0])} />
				</Button>
				<Button variant="contained" onClick={uploadDrawing} disabled={!drawingFile} sx={{ ml: 1 }}>Upload</Button>
				{drawingMsg && <Typography sx={{ ml: 2 }} color="secondary">{drawingMsg}</Typography>}
			</Box>
			<Typography sx={{ mt: 2, mb: 1 }}><b>QC Forms:</b></Typography>
			<List>
				{qcForms.map(qc => (
					<ListItem key={qc.id} sx={{ display: 'flex', alignItems: 'center' }}>
						<ListItemText primary={`QC Form #${qc.id} (${qc.status})`} />
						{qc.pdfPath && <>
							<Button href={`/api/qc/${qc.id}/pdf`} target="_blank">View PDF</Button>
							<span style={{ marginLeft: 8, color: '#888', fontSize: 12 }}>
								(Last uploaded: {getFileDate(qc.pdfPath) || 'N/A'})
							</span>
						</>}
					</ListItem>
				))}
			</List>
			<Button variant="outlined" color="primary" sx={{ mt: 1, mr: 2 }} component={Link} to={`/qcform?machineId=${id}`}>Fill QC Form</Button>
			{!machine.completed && (
				<Button variant="contained" color="success" sx={{ mt: 1 }} onClick={() => completeMutation.mutate()} disabled={!canComplete}>
					Mark as Complete
				</Button>
			)}
			<Button component={Link} to="/" sx={{ ml: 2, mt: 1 }}>Back</Button>
		</Box>
	);
}
export default MachineDetail;
