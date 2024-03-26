import Paper from '@mui/material/Paper';
import { styled } from '@mui/material/styles';
import Date from './Date'
import CloseButton from './CloseButton'
import ArchiveButton from './ArchiveButton'
import BarcodeButton from './BarcodeButton'

const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.text.primary,
  }));

export default function Ticket({ticket}: any) {
    
    return (
        <Item>
            <div className='ticket-container'>
                
                <p>barcode : {ticket.barcode}</p>
                <p>type: {ticket.type}</p>
                <Date created_at={ticket.created_at} />
                <div style={{ display: 'flex', gap: '30px' }}>
                    <BarcodeButton barcode={ticket.barcode} />
                    <CloseButton id={ticket.id} />
                    <ArchiveButton id={ticket.id} />
                </div>
            </div>
        </Item>
    )
}