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
import Paginate from '../components/Paginate'
import { Box } from '@mui/material';
import { useMediaQuery } from '@mui/material';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

interface Ticket {
  barcode: string;
  status: string;
  moderator_username?: string;
  // Add other properties here if needed
}

export default function ImageModerationPage() {

    const [Tickets, setTickets] = useState<Ticket[]>([])
    const [isLoading, setIsLoading] = useState<Boolean>(true)
    const [currentPage, setCurrentPage] = useState<number>(1)
    const [maxPage, setMaxPage] = useState<number>(1)
    const [reason, setReason] = useState<string | null>(null)
    const isMobile = useMediaQuery('(max-width:800px)')

    const fetchImageTickets = (url_: string) => {
        axios.get(url_).then(async (res) => {         
            
            const ticketsData = res.data.tickets;

            setTickets(ticketsData)
            setMaxPage(res.data.max_page)

            const ticketIds = ticketsData.map((ticket: any) => ticket.id);
            const flagsResponse = await axios.post(`${import.meta.env.VITE_API_URL}/flags/batch`, {
                ticket_ids: ticketIds
            });
            // update ticket by adding reasons from flags
            const ticketIdToFlags = flagsResponse.data.ticket_id_to_flags;
            const updatedTickets = ticketsData.map((ticket: any) => {
                ticket.reasons = ticketIdToFlags[ticket.id].map((flag: any) => flag.reason);
                ticket.comments = ticketIdToFlags[ticket.id].map((flag: any) => flag.comment);
                return ticket;
            });

            setTickets(updatedTickets);
            setIsLoading(false)
        }).catch((err) => {
            console.error(err)
        })
    }

    const url = `${import.meta.env.VITE_API_URL}/tickets?type_=image&status=open&page=${currentPage}&page_size=10${reason === null ? "" : `&reason=${reason}`}`

    // fetch tickets on page load
    useEffect(() => {
        setIsLoading(true)
        fetchImageTickets(url)
    }, [currentPage, reason])

    // fetch tickets when there are no tickets
    useEffect(() => {
        if (Tickets.length === 0) {
            // if the current page is empty, fetch the first page
            fetchImageTickets(url)
            if (Tickets.length === 0) {
                setCurrentPage(1)
            }
        }
    }, [Tickets.length])

    return (
        <>
            <Box sx={{width: "100vw", zIndex: "-10", color: '#281900', display: 'flex',flexDirection: "column", alignItems: "center", justifyContent:"center", padding: 2}}>
                <Typography variant="h4" sx={{fontSize: {xs: '1.2rem', md: '1.7rem'}}}>
                    Image Moderation
                </Typography>
            </Box>
            <Box sx={{display: 'flex', justifyContent: 'center', marginBottom: 2}}>
                <ToggleButtonGroup
                    value={reason}
                    exclusive
                    onChange={(_, newReasons) => {
                        setReason(newReasons)
                    }}
                    aria-label="text alignment"
                    size='small'
                    color='primary'
                >
                    <ToggleButton value="inappropriate">Inappropriate</ToggleButton>
                    <ToggleButton value="human">Human</ToggleButton>
                    <ToggleButton value="beauty">Beauty</ToggleButton>
                    <ToggleButton value="other">Other</ToggleButton>
                </ToggleButtonGroup>
            </Box>
            {
                // if the page is loading, display a loading message
                isLoading ? (
                    <Box sx={{position: "absolute", width: "100vw", height: "100vh", zIndex: "-10", color: '#281900', display: 'flex',flexDirection: "column", alignItems: "center", justifyContent:"center"}}>
                        <Typography variant="h4" sx={{fontSize: {xs: '1.2rem', md: '1.7rem'}}}>
                            Loading data...
                        </Typography>
                    </Box>
                ) : (
                    // if there are no tickets, display a message
                    Tickets.length === 0 ? (
                        <Box sx={{position: "absolute", width: "100vw", height: "100vh", zIndex: "-10", color: '#281900', display: 'flex',flexDirection: "column", alignItems: "center", justifyContent:"center"}}>
                            <Typography variant="h4" sx={{fontSize: {xs: '1.2rem', md: '1.7rem'}}}>
                                No tickets to moderate
                            </Typography>
                        </Box>
                    ) : (
                        // if there are tickets, display them in a table
                        <>
                            <Box sx={{ height: 400, width: '100%' }}>
                                <TableContainer component={Paper}>
                                    <Table aria-label="simple table">
                                        {!isMobile && 
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell align="center">Image</TableCell>
                                                    <TableCell align="center">Date</TableCell>
                                                    <TableCell align="center">Reasons</TableCell>
                                                    <TableCell align="center">Comments</TableCell>
                                                    <TableCell align="center">Moderated by</TableCell>
                                                    <TableCell align="center">Actions</TableCell>
                                                </TableRow>
                                            </TableHead>
                                        }
                                        <TableBody>
                                            {Tickets.map((ticket, index) => (
                                                <ImageTicket key={index} ticket={ticket} setTickets={setTickets} tickets={Tickets} />
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                                <Box sx={{display: 'flex', justifyContent: 'center', marginTop: 2}}>
                                    <Paginate currentPage={currentPage} setCurrentPage={setCurrentPage} maxPage={maxPage} />
                                </Box>
                            </Box>
                         </>
                    )
                )
            }
        </>
    )
}