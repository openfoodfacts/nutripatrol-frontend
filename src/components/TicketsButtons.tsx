import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import { Link } from 'react-router-dom';
import axios from 'axios';
import EditIcon from '@mui/icons-material/Edit';
import NotInterestedIcon from '@mui/icons-material/NotInterested';
import CheckIcon from '@mui/icons-material/Check';

// Change status of ticket to archived
function handleStatus(id: number, status: string) {
    try {
        axios.put(`${import.meta.env.VITE_API_URL}/tickets/${id}/status?status=${status}`)
        window.location.reload();
    } catch (error) {
        console.error(error);
    }
}

export default function BasicButtonGroup(props: { id: number, barcode: string }) {

    const linkUrl = `${import.meta.env.VITE_PO_URL}/cgi/product.pl?type=edit&code=${props.barcode}`;

    return (
        <ButtonGroup variant="contained" aria-label="ticket_actions">
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
                onClick={() => handleStatus(props.id, 'closed')}
            >
                No problem
            </Button>
            <Button
                variant="contained"
                color="success"
                endIcon={<CheckIcon />}
                onClick={() => handleStatus(props.id, 'closed')}
            >
                I fixed it!
            </Button>
        </ButtonGroup>
  );
}