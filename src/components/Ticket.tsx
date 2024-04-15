import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Date from './Date'
import TicketsButtons from './TicketsButtons'

export default function Ticket({ticket}: any) {
    
    return (
        <TableRow
            key={ticket.barcode}
            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
        >
            <TableCell align="center">{ticket.barcode}</TableCell>
            <TableCell align="center">{ticket.type}</TableCell>
            <TableCell align="center">{ticket.image_id}</TableCell>
            <TableCell align="center">{ticket.flavor}</TableCell>
            <TableCell align="center">{ticket.reasons}</TableCell>
            <Date created_at={ticket.created_at} />
            <TableCell align="center"><TicketsButtons barcode={ticket.barcode} id={ticket.id} /></TableCell>
        </TableRow>
    )
}