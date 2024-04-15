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
        // send get request to api to get tickets and set Tickets to the response
        axios.get(`${import.meta.env.VITE_API_URL}/tickets?type_=image&status=open`).then((res) => {
            setTickets(res.data)
            setIsLoading(false)
        }).catch((err) => {
            console.error(err)
        })
    }, [])
        
    return (
        <>
            {
                // if the page is loading, display a loading message
                isLoading ? (
                    <div>Is loading...</div>
                ) : (
                    Tickets.length === 0 ? (
                        <div style={{position: "absolute", width: "100vw", height: "100vh", zIndex: "-10", color: '#281900', display: 'flex',flexDirection: "column", alignItems: "center", justifyContent:"center"}}>
                            <h2 style={{fontSize: '1.4rem', margin: "2rem 0"}}>No new ticket </h2> 
                        </div>
                    ) : (
                        <div>
                            <h2 style={{width: "100vw", zIndex: "-10", color: '#281900', display: 'flex',flexDirection: "column", alignItems: "center", justifyContent:"center", padding: 20}}>
                                Image moderation
                            </h2>
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
                                    {Tickets.map((ticket) => (
                                        <ImageTicket ticket={ticket} />
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