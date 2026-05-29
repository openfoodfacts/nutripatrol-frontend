import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import { Link } from 'react-router-dom';
import axios from 'axios';
import EditIcon from '@mui/icons-material/Edit';
import NotInterestedIcon from '@mui/icons-material/NotInterested';
import CheckIcon from '@mui/icons-material/Check';
import { useUser } from '../context/LoginContext';

interface BasicButtonGroup {
    id: number;
    barcode: string;
    setTickets: any;
    tickets: any;
}

export default function BasicButtonGroup({id, barcode, setTickets, tickets}: BasicButtonGroup) {
    const { userData } = useUser();

    // Change status of ticket to archived
    async function handleStatus(id: number, status: string) {
        try {
            const params = new URLSearchParams({ status });
            if (userData?.username) {
                params.set('moderator_username', userData.username);
            }
            await axios.put(
                `${import.meta.env.VITE_API_URL}/tickets/${id}/status?${params.toString()}`,
            );
            // remove ticket from tickets
            const updatedTickets = tickets.filter((ticket: any) => ticket.id !== id);
            setTickets(updatedTickets);
        } catch (error) {
            console.error(error);
        }
    }

    const linkUrl = `${import.meta.env.VITE_PO_URL}/cgi/product.pl?type=edit&code=${barcode}`;

    return (
        <ButtonGroup variant="contained" aria-label="ticket_actions" >
            <Button 
                component={Link} 
                to={linkUrl} 
                variant='contained'
                color="inherit"
                endIcon={<EditIcon />}
                target="_blank" >
                Edit
            </Button>
            <Button
                variant="contained"
                color="error"
                endIcon={<NotInterestedIcon />}
                onClick={() => handleStatus(id, 'closed')}
            >
                No problem
            </Button>
            <Button
                variant="contained"
                color="success"
                endIcon={<CheckIcon />}
                onClick={() => handleStatus(id, 'closed')}
            >
                I fixed it!
            </Button>
        </ButtonGroup>
  );
}