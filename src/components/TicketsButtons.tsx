import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import { Link } from 'react-router-dom';
import axios from 'axios';
import EditIcon from '@mui/icons-material/Edit';
import NotInterestedIcon from '@mui/icons-material/NotInterested';
import CheckIcon from '@mui/icons-material/Check';

interface BasicButtonGroup {
    id: number;
    barcode: string;
    setTickets: any;
    tickets: any;
}

export default function BasicButtonGroup({id, barcode, setTickets, tickets}: BasicButtonGroup) {

    // Change status of ticket to archived
    function handleStatus(id: number, status: string) {
        try {
            axios.put(`${import.meta.env.VITE_API_URL}/tickets/${id}/status?status=${status}`)
            // remove ticket from tickets
            const updatedTickets = tickets.filter((ticket: any) => ticket.id !== id);
            setTickets(updatedTickets);
        } catch (error) {
            console.error(error);
        }
    }

    const linkUrl = `${import.meta.env.VITE_PO_URL}/cgi/product.pl?type=edit&code=${barcode}`;

    return (
        <ButtonGroup variant="contained" aria-label="ticket_actions">
            <Button 
                component={Link} 
                to={linkUrl} 
                variant='contained'
                color="inherit"
                endIcon={<EditIcon />}
                sx={{ maxHeight: '40px' }}
                target="_blank" >
                Edit
            </Button>
            <Button
                variant="contained"
                color="error"
                endIcon={<NotInterestedIcon />}
                sx={{ maxHeight: '40px' }}
                onClick={() => handleStatus(id, 'closed')}
            >
                No problem
            </Button>
            <Button
                variant="contained"
                color="success"
                endIcon={<CheckIcon />}
                sx={{ maxHeight: '40px' }}
                onClick={() => handleStatus(id, 'closed')}
            >
                I fixed it!
            </Button>
        </ButtonGroup>
  );
}