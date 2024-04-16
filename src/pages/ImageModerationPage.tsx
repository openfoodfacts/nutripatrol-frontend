import { Typography } from '@mui/material';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { useEffect, useState } from 'react'
import axios from 'axios'
import ImageTicket from '../components/ImageTicket';

interface Ticket {
  barcode: string;
  status: string;
  // Add other properties here if needed
}

export default function ImageModerationPage() {

    const [Tickets, setTickets] = useState<Ticket[]>([])
    const [isLoading, setIsLoading] = useState<Boolean>(true)

    useEffect(() => {
        const fetchTickets = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/tickets?type_=image&status=open`);
                const ticketsData = await response.data;
                setTickets(ticketsData);
                setIsLoading(false);
            } catch (err) {
                console.error(err)
            }
        };
        fetchTickets()
    }, [])
        
    return (
        <>
            {
                // if the page is loading, display a loading message
                isLoading ? (
                    <div style={{position: "absolute", width: "100vw", height: "100vh", zIndex: "-10", color: '#281900', display: 'flex',flexDirection: "column", alignItems: "center", justifyContent:"center"}}>
                        <Typography variant="h4">
                            Loading data...
                        </Typography>
                    </div>
                ) : (
                    // if there are no tickets, display a message
                    Tickets.length === 0 ? (
                        <div style={{position: "absolute", width: "100vw", height: "100vh", zIndex: "-10", color: '#281900', display: 'flex',flexDirection: "column", alignItems: "center", justifyContent:"center"}}>
                            <Typography variant="h4">
                                No tickets to moderate
                            </Typography>
                        </div>
                    ) : (
                        // if there are tickets, display them in a table
                        <div>
                            <div style={{width: "100vw", zIndex: "-10", color: '#281900', display: 'flex',flexDirection: "column", alignItems: "center", justifyContent:"center", padding: 20}}>
                                <Typography variant="h4">
                                    Image Moderation
                                </Typography>
                            </div>
                            <div style={{ height: 400, width: '100%' }}>
                            <TableContainer component={Paper}>
                                <Table sx={{ minWidth: 650 }} aria-label="simple table">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell align="center">Image</TableCell>
                                            <TableCell align="center">Date</TableCell>
                                            <TableCell align="center">Actions</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                    {Tickets.map((ticket, index) => (
                                        <ImageTicket key={index} ticket={ticket} />
                                    ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                            </div>
                         </div>
                    )
                )
            }
        </>
    )
}