import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { Link } from 'react-router-dom';
import axios from 'axios';
import EditIcon from '@mui/icons-material/Edit';
import NotInterestedIcon from '@mui/icons-material/NotInterested';
import CheckIcon from '@mui/icons-material/Check';
import MoveUpIcon from '@mui/icons-material/MoveUp';
import { useState } from 'react';

interface BasicButtonGroup {
    id: number;
    barcode: string;
    setTickets: any;
    tickets: any;
}

export default function BasicButtonGroup({id, barcode, setTickets, tickets}: BasicButtonGroup) {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [isMoving, setIsMoving] = useState(false);
    const open = Boolean(anchorEl);

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

    // Move product to different project (OPF, OPFF, OBF)
    async function handleMoveProduct(productType: string, projectName: string) {
        setIsMoving(true);
        setAnchorEl(null);
        
        try {
            const data = new URLSearchParams();
            data.append('code', barcode);
            data.append('product_type', productType);
            
            await axios.post(
                `${import.meta.env.VITE_PO_URL}/cgi/product_jqm2.pl`,
                data,
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    withCredentials: true
                }
            );
            
            // Close the ticket after successful move
            handleStatus(id, 'closed');
            setIsMoving(false);
        } catch (error) {
            console.error(`Error moving product ${barcode} to ${projectName} (type: ${productType}):`, error);
            setIsMoving(false);
        }
    }

    const handleMoveClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMoveClose = () => {
        setAnchorEl(null);
    };

    const linkUrl = `${import.meta.env.VITE_PO_URL}/cgi/product.pl?type=edit&code=${barcode}`;

    return (
        <>
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
                    color="info"
                    endIcon={<MoveUpIcon />}
                    onClick={handleMoveClick}
                    disabled={isMoving}
                >
                    {isMoving ? 'Moving...' : 'Move to'}
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
            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleMoveClose}
            >
                <MenuItem onClick={() => handleMoveProduct('petfood', 'OPFF')}>
                    Move to OPFF (Pet Food)
                </MenuItem>
                <MenuItem onClick={() => handleMoveProduct('beauty', 'OBF')}>
                    Move to OBF (Beauty)
                </MenuItem>
                <MenuItem onClick={() => handleMoveProduct('product', 'OPF')}>
                    Move to OPF (Products)
                </MenuItem>
            </Menu>
        </>
  );
}