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
  // Add other properties here if needed
}

export default function ImageModerationPage() {

    const [Tickets, setTickets] = useState<Ticket[]>([])
    const [isLoading, setIsLoading] = useState<Boolean>(true)
    const [currentPage, setCurrentPage] = useState<number>(1)
    const [maxPage, setMaxPage] = useState<number>(1)
    const [reasons, setReasons] = useState<string[]>([])
    const isMobile = useMediaQuery('(max-width:800px)')

    const fetchImageTickets = (url_: string) => {
        axios.get(url_).then((res) => {            
            setTickets(res.data.tickets)
            setMaxPage(res.data.max_page)
            setIsLoading(false)
        }).catch((err) => {
            console.error(err)
        })
    }

    const reasonsQuery = reasons.map((reason) => `reason=${reason}`).join('&')
    const url = `${import.meta.env.VITE_API_URL}/tickets?type_=image&status=open&page=${currentPage}&page_size=8${reasonsQuery ? `&${reasonsQuery}` : ''}`

    // fetch tickets on page load
    useEffect(() => {
        setIsLoading(true)
        fetchImageTickets(url)
    }, [currentPage, reasons])

    // fetch tickets when there are no tickets
    useEffect(() => {
        if (Tickets.length === 0) {
            fetchImageTickets(url)
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
                    value={reasons}
                    onChange={(_, newReasons) => {
                        setReasons(newReasons)
                    }}
                    aria-label="text alignment"
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