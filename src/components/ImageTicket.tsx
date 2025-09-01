import { useState } from 'react';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Date from './Date'
import TicketsButtons from './TicketsButtons'
import Box from '@mui/material/Box';
import { useMediaQuery } from '@mui/material';
import InfoModal from './InfoModal';
import Modal from '@mui/material/Modal';
import Button from '@mui/material/Button';

export default function ImageTicket({ticket, setTickets, tickets}: {ticket: any, setTickets: any, tickets: any}) {

    const style = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '80%',
        bgcolor: 'background.paper',
        border: '2px solid #000',
        boxShadow: 24,
        p: 4,
    };

    const [open, setOpen] = useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const isMobile = useMediaQuery('(max-width:700px)');
    // format url to get mini image
    const imageUrl = ticket.url.replace(/\.jpg$/, '.400.jpg');  
    
    return (
        <TableRow
            key={ticket.barcode}
            sx={{ 
                '&:last-child td, &:last-child th': { border: 0 },
                display: isMobile ? 'flex' : 'table-row',
                flexDirection: isMobile ? 'column' : 'initial',
                alignItems: 'center',
                width: '100%',
            }}
        >
            <TableCell align="center">
                <Box 
                    sx={{
                        display: 'flex',
                        gap: '10px',
                        alignItems: 'center',
                        justifyContent: 'center',
                        '& img': {
                            transition: 'transform 0.3s ease-in-out',
                        },
                        '&:hover img': {
                            transform: 'scale(1.1)',
                        },
                    }}
                >
                    <div>
                        <Button onClick={handleOpen}>
                            <img 
                                src={imageUrl} 
                                alt={ticket.barcode}
                                width={250}
                                height={250}
                                style={{ objectFit: 'contain'}}
                            />
                        </Button>
                        <Modal
                            open={open}
                            onClose={handleClose}
                            aria-labelledby="modal-modal-title"
                            aria-describedby="modal-modal-description"
                        >
                            <Box sx={style}>
                                <img 
                                    src={imageUrl} 
                                    alt={ticket.barcode}
                                    width={700}
                                    height={700}
                                    style={{ objectFit: 'contain'}}
                                />
                            </Box>
                        </Modal>
                    </div>                    
                </Box>
            </TableCell>
            <Date created_at={ticket.created_at} />
            <TableCell align="center">{ticket.reasons}</TableCell>
            <TableCell align="center">{ticket.comments}</TableCell>
            <TableCell align="center">{ticket.moderator_username || '-'}</TableCell>
            <TableCell align="center">
                <InfoModal barcode={ticket.barcode} />
                <TicketsButtons barcode={ticket.barcode} id={ticket.id} setTickets={setTickets} tickets={tickets} />
            </TableCell>
        </TableRow>
    )
}