import { Stack } from '@mui/material'
import ImageTicket from '../components/ImageTicket'
import { useEffect, useState } from 'react'
import axios from 'axios'

interface Ticket {
  barcode: string;
  status: string;
  // Add other properties here if needed
}

export default function ImageModerationPage() {

    const [Tickets, setTickets] = useState<Ticket[]>([])

    useEffect(() => {
        // send get request to api to get tickets and set Tickets to the response
        axios.get(`${import.meta.env.VITE_API_URL}/tickets?status=open`).then((res) => {
            setTickets(res.data.tickets)
        })
    }, [])
        
    if (Tickets.length === 0) {
        return (
            <div style={{position: "absolute", width: "100vw", height: "100vh", zIndex: "-10", color: '#281900', display: 'flex',flexDirection: "column", alignItems: "center", justifyContent:"center"}}>
                <h2 style={{fontSize: '1.4rem', margin: "2rem 0"}}>🇫🇷 Aucun nouveau ticket </h2>
                <h2 style={{fontSize: '1.4rem', margin: "2rem 0"}}>🇺🇸 / 🇬🇧 No new ticket </h2> 
            </div>
        )
    }
    return (
        <>
            <Stack spacing={2}>
                {
                // Map through the tickets and create a ticket component for each ticket with status
                Tickets.map((ticket) => (
                    ticket.status === "open" && <ImageTicket key={ticket.barcode} ticket={ticket} />
                ))
                }
            </Stack>
        </>
    )
}