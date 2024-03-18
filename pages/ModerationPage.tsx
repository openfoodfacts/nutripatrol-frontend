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
        axios.get(`${import.meta.env.VITE_API_URL}/tickets`).then((res) => {
            setTickets(res.data.tickets)
        })
    }, [])
        

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