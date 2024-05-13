import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Date from './Date'
import TicketsButtons from './TicketsButtons'
import Box from '@mui/material/Box';
import { useMediaQuery } from '@mui/material';

export default function ImageTicket({ticket, setTickets, tickets}: {ticket: any, setTickets: any, tickets: any}) {

    const isMobile = useMediaQuery('(max-width:700px)');
    // format url to get mini image
    const imageUrl = ticket.url.replace(/\.jpg$/, '.100.jpg');
    
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
                <Box sx={{ display: 'flex', gap: '10px', alignItems: 'center', justifyContent: 'center'}}>
                    <img 
                        src={imageUrl} 
                        // src='https://images.openfoodfacts.net/images/products/327/408/000/5003/1.400.jpg'
                        alt={ticket.barcode}
                        width={100}
                        height={100}
                    />
                </Box>
            </TableCell>
            <Date created_at={ticket.created_at} />
            <TableCell align="center">
                <TicketsButtons barcode={ticket.barcode} id={ticket.id} setTickets={setTickets} tickets={tickets} />
            </TableCell>
        </TableRow>
    )
}