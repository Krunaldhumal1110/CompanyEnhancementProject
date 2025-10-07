import React, { useRef, useState, useEffect } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import { Alert, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
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
	const location = useLocation();
	const queryClient = useQueryClient();
	const navigate = useNavigate();

	// State hooks
	const [showCompleteDialog, setShowCompleteDialog] = useState(false);
	const [drawingFile, setDrawingFile] = useState(null);
	const [masterFile, setMasterFile] = useState(null);
	const [masterMsg, setMasterMsg] = useState("");
	const [drawingMsg, setDrawingMsg] = useState("");
	const masterInputRef = useRef();
	const fileInputRef = useRef();
	const [showSuccess, setShowSuccess] = useState(false);
	const [missingPDFs, setMissingPDFs] = useState([]);

		// Fetch machine data (Tanstack Query v5 object form)
		const { data: machine, isLoading: machineLoading } = useQuery({
			queryKey: ["machine", id],
			queryFn: () => fetchMachine(id)
		});
		// Fetch QC forms
		const { data: qcForms = [], isLoading: qcLoading } = useQuery({
			queryKey: ["qcForms", id],
			queryFn: () => fetchQCForms(id)
		});

	// Can complete logic (example: all PDFs uploaded)
	const canComplete = qcForms.length > 0 && qcForms.every(qc => qc.pdfPath);
			// Helper to extract readable server error messages (Axios)
			const getErrorMessage = (err) => {
				if (!err) return 'Unknown error';
				if (err.response && err.response.data) {
					if (typeof err.response.data === 'string') return err.response.data;
					if (err.response.data.message) return err.response.data.message;
					try { return JSON.stringify(err.response.data); } catch (e) {}
				}
				return err.message || String(err);
			};

			const [completeError, setCompleteError] = useState(null);

			// Mutation for completing machine (Tanstack Query v5 object form)
			const completeMutation = useMutation({
				mutationFn: () => completeMachineApi(id),
				onSuccess: () => {
					// Invalidate both the single machine and the machines list so other views update
					queryClient.invalidateQueries({ queryKey: ["machine"] });
					queryClient.invalidateQueries({ queryKey: ["machines"] });
					setShowSuccess(true);
					setCompleteError(null);
					setTimeout(() => {
						navigate("/completed");
					}, 1000);
				},
				onError: (err) => {
					const msg = getErrorMessage(err);
					setCompleteError(msg);
				}
			});

	// Upload handlers (dummy, replace with your logic)
	const uploadMasterCard = async () => {
		setMasterMsg("Uploading...");
		// TODO: implement upload logic
		setTimeout(() => setMasterMsg("Uploaded!"), 1000);
	};
	const uploadDrawing = async () => {
		setDrawingMsg("Uploading...");
		// TODO: implement upload logic
		setTimeout(() => setDrawingMsg("Uploaded!"), 1000);
	};

		if (machineLoading || qcLoading || !machine) return <div className="flex items-center justify-center h-screen animate-pulse text-2xl font-bold text-blue-500">Loading...</div>;

		return (
			<>
				{/* Modern Header */}
				<header className="w-full py-6 bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg mb-6 flex items-center justify-between px-8 animate-fade-in">
					<h1 className="text-3xl font-extrabold text-white tracking-tight drop-shadow-lg">Machine Details</h1>
					<span className="text-lg text-white/80 font-medium">ID: {machine.id}</span>
				</header>

				{/* Card with Tailwind styles and animation */}
				<div className="max-w-xl mx-auto p-8 bg-white rounded-3xl shadow-2xl border border-gray-200 animate-fade-in">
					{showSuccess && (
						<div className="mb-4 px-4 py-2 rounded bg-green-100 text-green-800 font-semibold animate-fade-in">QC Form submitted successfully!</div>
					)}
					{completeError && (
						<div className="mb-4 px-4 py-2 rounded bg-red-100 text-red-800 font-semibold animate-fade-in">{completeError}</div>
					)}
					{missingPDFs.length > 0 && (
						<div className="mb-4 px-4 py-2 rounded bg-yellow-100 text-yellow-800 font-semibold animate-fade-in">Please upload {missingPDFs.join(', ')}.</div>
					)}

					<div className="mb-4 text-2xl font-bold text-blue-700">{machine.name} Details</div>
					<div className="mb-2 text-lg"><span className="font-semibold text-gray-700">Model:</span> {machine.model || 'N/A'}</div>
					<div className="mb-2 text-lg"><span className="font-semibold text-gray-700">Product No.:</span> {machine.productNo || 'N/A'}</div>

					{/* Master Card Upload */}
					<div className="mb-4">
						<span className="font-semibold text-gray-700">Master Card:</span> {machine.masterCardInfo ? (
							<>
								<a href={`http://localhost:8080/api/machines/${id}/mastercard`} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-800">View PDF</a>
								<span className="ml-2 text-xs text-gray-400">(Last uploaded: {getFileDate(machine.masterCardInfo) || 'N/A'})</span>
							</>
						) : 'N/A'}
						<label className="ml-4 inline-block">
							<input type="file" accept="application/pdf" hidden ref={masterInputRef} onChange={e => setMasterFile(e.target.files[0])} />
							<span className="px-3 py-1 rounded bg-blue-100 text-blue-700 font-semibold cursor-pointer hover:bg-blue-200 transition">Upload Master Card</span>
						</label>
						<button className="ml-2 px-3 py-1 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 transition" onClick={uploadMasterCard} disabled={!masterFile}>Upload</button>
						{masterMsg && <span className="ml-2 text-sm text-purple-600">{masterMsg}</span>}
					</div>

					{/* Electric Drawing Upload */}
					<div className="mb-4">
						<span className="font-semibold text-gray-700">Electric Drawing:</span> {machine.electricDrawingPath ? (
							<>
								<a href={`http://localhost:8080/api/machines/${id}/drawingpdf`} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-800">View PDF</a>
								<span className="ml-2 text-xs text-gray-400">(Last uploaded: {getFileDate(machine.electricDrawingPath) || 'N/A'})</span>
							</>
						) : 'N/A'}
						<label className="ml-4 inline-block">
							<input type="file" accept="application/pdf" hidden ref={fileInputRef} onChange={e => setDrawingFile(e.target.files[0])} />
							<span className="px-3 py-1 rounded bg-purple-100 text-purple-700 font-semibold cursor-pointer hover:bg-purple-200 transition">Upload Drawing</span>
						</label>
						<button className="ml-2 px-3 py-1 rounded bg-purple-600 text-white font-semibold hover:bg-purple-700 transition" onClick={uploadDrawing} disabled={!drawingFile}>Upload</button>
						{drawingMsg && <span className="ml-2 text-sm text-blue-600">{drawingMsg}</span>}
					</div>

					{/* QC Forms */}
					<div className="mb-2 text-lg font-semibold text-gray-700">QC Forms:</div>
					<ul className="mb-4">
						{qcForms.length === 0 && (
							<li className="text-gray-400">No QC forms submitted yet.</li>
						)}
						{qcForms.map(qc => (
							qc.pdfPath ? (
								<li key={qc.id} className="flex items-center mb-2">
									<a
										href={`http://localhost:8080/api/qc/${qc.id}/pdf`}
										target="_blank"
										rel="noopener noreferrer"
										className="px-2 py-1 rounded bg-blue-100 text-blue-700 font-semibold hover:bg-blue-200 transition mr-2"
									>
										View PDF
									</a>
									<a
										href={`http://localhost:8080/api/qc/${qc.id}/pdf/download`}
										target="_blank"
										rel="noopener noreferrer"
										className="px-2 py-1 rounded bg-green-100 text-green-700 font-semibold hover:bg-green-200 transition mr-2"
										download
									>
										Download PDF
									</a>
									<span className="ml-2 text-xs text-gray-400">(Last uploaded: {getFileDate(qc.pdfPath) || 'N/A'})</span>
								</li>
							) : null
						))}
					</ul>

					{qcForms.length === 0 && (
						<Link to={`/qcform?machineId=${id}`} className="inline-block px-4 py-2 rounded bg-blue-500 text-white font-semibold hover:bg-blue-600 transition mr-2">Fill QC Form</Link>
					)}

					{!machine.completed && (
						<button
							className={`px-4 py-2 rounded font-semibold transition ${canComplete ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
							onClick={() => canComplete && setShowCompleteDialog(true)}
							disabled={!canComplete}
						>
							Mark as Complete
						</button>
					)}

					<Link to="/" className="ml-4 px-4 py-2 rounded bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition">Back</Link>
				</div>

			{/* ✅ Single Confirmation Dialog (removed duplicates) */}
			<Dialog open={showCompleteDialog} onClose={() => setShowCompleteDialog(false)}>
				<DialogTitle>Move Machine to Completed List?</DialogTitle>
				<DialogContent>
					<Typography>
						Should this machine move to completed machine list or not?
					</Typography>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setShowCompleteDialog(false)}>No</Button>
					<Button
						color="success"
						onClick={() => {
							setShowCompleteDialog(false);
							completeMutation.mutate();
						}}
					>
						Yes
					</Button>
				</DialogActions>
			</Dialog>
		</>
	);
}

export default MachineDetail;
