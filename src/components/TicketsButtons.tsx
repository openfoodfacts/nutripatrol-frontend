import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import { Link } from 'react-router-dom';
import axios from 'axios';

// Change status of ticket to archived
function handleStatus(id: number, status: string) {
    axios.put(`${import.meta.env.VITE_API_URL}/tickets/${id}/status?status=${status}`)
    window.location.reload();
}

export default function BasicButtonGroup(props: { id: number, barcode: string }) {

    const linkUrl = `${import.meta.env.VITE_PO_URL}/cgi/product.pl?type=edit&code=${props.barcode}`;

    return (
        <ButtonGroup variant="contained" aria-label="ticket_actions">
            <Button 
                component={Link} 
                to={linkUrl} 
                variant='contained'
                color="primary"
                target="_blank" >
                Edit
            </Button>
            <Button
                variant="outlined"
                color="error"
                onClick={() => handleStatus(props.id, 'closed')}
            >
                No problem
            </Button>
            <Button
                variant="outlined"
                color="success"
                onClick={() => handleStatus(props.id, 'closed')}
            >
                I fixed it!
            </Button>
        </ButtonGroup>
  );
}