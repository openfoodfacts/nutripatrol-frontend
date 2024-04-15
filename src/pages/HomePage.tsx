import { Typography } from "@mui/material"

export default function HomePage() {
    return (
        <>
            <div style={{margin: '3rem 8rem', color: '#281900'}}>
                <Typography variant="h4" style={{margin: '4rem 0'}}>
                    Discover Nutripatrol: the moderation tool currently in development for OpenFoodFacts.
                </Typography>
                <Typography variant="body1" style={{margin: '2rem 0'}}>
                    Nutripatrol simplifies the moderation of food products by offering an intuitive ticketing platform. You can quickly report errors, inconsistencies, or missing information on listed food products.
                </Typography>
                <Typography variant="body1" style={{margin: '2rem 0'}}>
                    Join us in contributing to the improvement of the OpenFoodFacts database and helping consumers worldwide make informed decisions about their diet.
                </Typography>
            </div>
        </>
    )
}