import { Typography } from "@mui/material"
import Container from "@mui/material/Container"
import Button from "@mui/material/Button"
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import { Link } from "react-router-dom"

export default function Tutorial() {
    return (
        <Container maxWidth="lg">
            <Typography variant="h4" sx={{margin: '3rem 0', fontSize: {xs: '1.2rem', md: '1.7rem'}, fontWeight: 700}}>
                Discover Nutripatrol: the moderation tool currently in development for Open Food Facts.
            </Typography>
            <Typography variant="h6" sx={{margin: '2rem 0', fontSize: {xs: '0.8rem', md: '1.2rem'}}}>
                How to use Nutripatrol:
            </Typography>
            <Typography variant="body1" sx={{margin: '2rem 0', fontSize: {xs: '0.8rem', md: '1.2rem'}}}>
                1. Go to the Image Moderation page.
            </Typography>
            <Typography variant="body1" sx={{margin: '2rem 0', fontSize: {xs: '0.8rem', md: '1.2rem'}}}>
                2. Click on the image to view the full image.
            </Typography>
            <Typography variant="body1" sx={{margin: '2rem 0', fontSize: {xs: '0.8rem', md: '1.2rem'}}}>
                3. You can click on the ticket to view more information about the ticket.
            </Typography>
            <Typography variant="body1" sx={{margin: '2rem 0', fontSize: {xs: '0.8rem', md: '1.2rem'}}}>
                4. If the image has no issues, click on the red checkmark to close the ticket.
            </Typography>
            <Typography variant="body1" sx={{margin: '2rem 0', fontSize: {xs: '0.8rem', md: '1.2rem'}}}>
                5. If the image has issues, click on edit button to edit the ticket.
            </Typography>
            <Typography variant="body1" sx={{margin: '2rem 0', fontSize: {xs: '0.8rem', md: '1.2rem'}}}>
                6. Now you have to delete the problematic image, check if this image is selected and check if product is a real one.
            </Typography>
            <Typography variant="body1" sx={{margin: '2rem 0', fontSize: {xs: '0.8rem', md: '1.2rem'}}}>
                7. Then you can click on the green checkmark to close the ticket.
            </Typography>
            <Link to="/image-moderation" >
                <Button variant='contained' color='inherit' sx={{margin: '1rem'}} endIcon={<PlayArrowIcon />}>
                    Images moderation
                </Button>
            </Link>
        </Container>
    )
}