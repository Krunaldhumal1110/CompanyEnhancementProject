import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography } from '@mui/material';

console.log('Dashboard component mounted');
const fetchOngoingProjects = async () => {
	const { data } = await axios.get('/api/projects/ongoing');
		// Debug: confirm component mount
console.log('fetchOngoingProjects : ',data);
	return data;
};

function Dashboard() {
	const { data: projects = [] } = useQuery({
		queryKey: ['ongoingProjects'],
		queryFn: fetchOngoingProjects		
	});
	console.log('ongoingProjects : ',data);

	
	return (
		<>
			<Typography variant="h5" gutterBottom>Ongoing Projects</Typography>
			<TableContainer component={Paper}>
				<Table>
					<TableHead>
						<TableRow>
							<TableCell>ID</TableCell>
							<TableCell>Name</TableCell>
							<TableCell>Status</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{projects.map(p => (
							<TableRow key={p.id}>
								<TableCell>{p.id}</TableCell>
								<TableCell>{p.name}</TableCell>
								<TableCell>{p.status}</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</TableContainer>
		</>
	);
}
export default Dashboard;
