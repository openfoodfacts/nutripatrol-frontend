import Container from '@mui/material/Container';
import { Typography } from "@mui/material";
import { Button } from "@mui/material";
import { Link } from "react-router-dom";
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import FlagIcon from '@mui/icons-material/Flag';

export default function HomePage() {
    return (
        <>
            <Container maxWidth="lg">
                <Typography variant="h4" sx={{margin: '4rem 0', fontSize: {xs: '1.2rem', md: '1.7rem'}, fontWeight: 700}}>
                    Discover Nutripatrol: the moderation tool currently in development for OpenFoodFacts.
                </Typography>
                <Typography variant="body1" sx={{margin: '2rem 0', fontSize: {xs: '0.8rem', md: '1.2rem'}}}>
                    Nutripatrol simplifies the moderation of food products by offering an intuitive ticketing platform. You can quickly report errors, inconsistencies, or missing information on listed food products.
                </Typography>
                <Typography variant="body1" sx={{margin: '2rem 0', fontSize: {xs: '0.8rem', md: '1.2rem'}}}>
                    Join us in contributing to the improvement of the OpenFoodFacts database and helping consumers worldwide make informed decisions about their diet.
                </Typography>
                <Typography variant="body1" sx={{margin: '2rem 0', fontSize: {xs: '0.8rem', md: '1.2rem'}}}>
                    You can start by moderating images of food products. Click the button below to get started.
                </Typography>
                <Link to="/image-moderation" >
                    <Button variant='contained' color='inherit' sx={{margin: '1rem'}} endIcon={<PlayArrowIcon />}>
                        Get started
                    </Button>
                </Link>
                <Link to="/flag" >
                    <Button variant='contained' color='inherit' sx={{margin: '1rem'}} endIcon={<FlagIcon />}>
                        Flag a product
                    </Button>
                </Link>
            </Container>
        </>
    )
}