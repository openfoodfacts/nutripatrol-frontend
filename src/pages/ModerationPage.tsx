import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { useEffect, useState } from 'react'
import axios from 'axios'
import Ticket from '../components/Ticket'
import { Typography } from '@mui/material';
import { Box } from '@mui/material';
import { useMediaQuery } from '@mui/material';

interface Ticket {
    barcode: string;
    status: string;
    type: string;
    image_id: string;
    flavor: string;
    created_at: string;
    id: number;
    reasons?: string;
  // Add other properties here if needed
}

export default function ImageModerationPage() {

    const [Tickets, setTickets] = useState<Ticket[]>([])
    const [isLoading, setIsLoading] = useState<Boolean>(true)
    const isMobile = useMediaQuery('(max-width:800px)')

    useEffect(() => {
        const fetchTickets = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/tickets?status=open`);
                const ticketsData = response.data;
                setTickets(ticketsData);

                const ticketIds = ticketsData.map((ticket: any) => ticket.id);
                const flagsResponse = await axios.post(`${import.meta.env.VITE_API_URL}/flags/batch`, {
                    ticket_ids: ticketIds
                });

                // update ticket by adding reasons from flags
                const ticketIdToFlags = flagsResponse.data.ticket_id_to_flags;
                const updatedTickets = ticketsData.map((ticket: any) => {
                    ticket.reasons = ticketIdToFlags[ticket.id].map((flag: any) => flag.reason);
                    return ticket;
                });

                setTickets(updatedTickets);
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
                    <Box sx={{position: "absolute", width: "100vw", height: "100vh", zIndex: "-10", color: '#281900', display: 'flex',flexDirection: "column", alignItems: "center", justifyContent:"center"}}>
                        <Typography variant="h4" sx={{fontSize: {xs: '1.2rem', md: '1.7rem'}}}>
                            Loading data...
                        </Typography>
                    </Box>
                ) : (
                    // if there is no ticket, display a message
                    Tickets.length === 0 ? (
                        <Box sx={{position: "absolute", width: "100vw", height: "100vh", zIndex: "-10", color: '#281900', display: 'flex',flexDirection: "column", alignItems: "center", justifyContent:"center"}}>
                            <Typography variant="h4" sx={{fontSize: {xs: '1.2rem', md: '1.7rem'}}}>
                                No tickets to moderate
                            </Typography>
                        </Box>
                    ) : (
                        // if there are tickets, display them in a table
                        <div>
                            <Box sx={{width: "100vw", zIndex: "-10", color: '#281900', display: 'flex',flexDirection: "column", alignItems: "center", justifyContent:"center", padding: 2}}>
                                <Typography variant="h4" sx={{fontSize: {xs: '1.2rem', md: '1.7rem'}}}>
                                    Ticket Moderation
                                </Typography>
                            </Box>
                            <Box sx={{ height: 400, width: '100%' }}>
                                <TableContainer component={Paper}>
                                    <Table aria-label="simple table">
                                        {!isMobile &&
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell align="center">Barcode</TableCell>
                                                    <TableCell align="center">Type</TableCell>
                                                    <TableCell align="center">Image ID</TableCell>
                                                    <TableCell align="center">Flavor</TableCell>
                                                    <TableCell align="center">Reasons</TableCell>
                                                    <TableCell align="center">Created at</TableCell>
                                                    <TableCell align="center">Actions</TableCell>
                                                </TableRow>
                                            </TableHead>
                                        }
                                        <TableBody>
                                        {Tickets.map((ticket, index) => (
                                            <Ticket key={index} ticket={ticket} />
                                        ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Box>
                        </div>
                    )
                )
            }
        </>
    )
}