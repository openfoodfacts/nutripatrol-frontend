import { Container, Typography } from '@mui/material'

export default function FlagInfos() {
    return (
        <Container maxWidth='lg'>
            <Typography variant="h4" sx={{margin: '4rem 0', fontSize: {xs: '1.2rem', md: '1.7rem'}, fontWeight: 700}}>
                You can flag a product, an image or a search result.
            </Typography>
            <Typography variant="body1" sx={{margin: '2rem 0', fontSize: {xs: '0.8rem', md: '1.2rem'}}}>
                To flag a product, you need to click on the "report" button on the product page. You will be redirected to the flag form page with the product's information already filled in.
            </Typography>
            <Typography variant="body1" sx={{margin: '2rem 0', fontSize: {xs: '0.8rem', md: '1.2rem'}}}>
                To flag an image, you need to click on the "report" button on the image page. You will be redirected to the flag form page with the image's information already filled in.
            </Typography>
            <Typography variant="body1" sx={{margin: '2rem 0', fontSize: {xs: '0.8rem', md: '1.2rem'}}}>
                To flag a search result, you need to click on the "report" button on the search result page. You will be redirected to the flag form page with the search result's information already filled in.
            </Typography>
        </Container>
    )
}