import React from 'react';
import { List, ListItem, ListItemText, Button, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const fetchCompletedMachines = async () => {
	const { data } = await axios.get('/api/machines/completed');
	return data;
};

function CompletedMachines() {
	const navigate = useNavigate();
	const { data: machines = [] } = useQuery({
		queryKey: ['completedMachines'],
		queryFn: fetchCompletedMachines
	});
	return (
		<>
			<Typography variant="h5" sx={{ mt: 2 }}>Completed Machines</Typography>
			<List>
				{machines.map(m => (
					<ListItem key={m.id}>
						<ListItemText primary={m.name} secondary={`Model: ${m.model || ''} | Product No.: ${m.productNo || ''}`} />
						<Button variant="outlined" onClick={() => navigate(`/machine/${m.id}`)}>View Details</Button>
					</ListItem>
				))}
			</List>
		</>
	);
}
export default CompletedMachines;
