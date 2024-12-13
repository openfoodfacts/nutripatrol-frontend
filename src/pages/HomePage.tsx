import Container from '@mui/material/Container';
import { Typography } from "@mui/material";

export default function HomePage() {
    return (
        <>
            <Container maxWidth="lg">
                <Typography variant="h4" sx={{margin: '3rem 0', fontSize: {xs: '1.2rem', md: '1.7rem'}, fontWeight: 700}}>
                    What is Nutripatrol?
                </Typography>
                <Typography variant="body1" sx={{margin: '1rem 0', fontSize: {xs: '0.8rem', md: '1.2rem'}}}>
                    NutriPatrol is a specialized ticketing application designed to streamline moderation on OpenFoodFacts.
                    It helps the community flag and address issues in the product database, ensuring the accuracy and reliability of the information.
                    With NutriPatrol, moderators can review, track, and resolve tickets submitted by contributors and users efficiently, maintaining the integrity of OpenFoodFacts.
                </Typography>
                <Typography variant="h4" sx={{margin: '3rem 0', fontSize: {xs: '1.2rem', md: '1.7rem'}, fontWeight: 700}}>
                    Reporting a Product on OpenFoodFacts
                </Typography>
                <Typography variant="body1" sx={{margin: '1rem 0', fontSize: {xs: '0.8rem', md: '1.2rem'}}}>
                    Found an error or problematic content? You can easily report it directly on the <a href='https://world.openfoodfacts.org'>OpenFoodFacts website</a>!
                    Each product page and images includes an option to flag issues.
                    These reports are sent to NutriPatrol, where moderators can review and act upon them.
                    Your vigilance plays a vital role in improving the quality of the database
                </Typography>
                <Typography variant="h4" sx={{margin: '3rem 0', fontSize: {xs: '1.2rem', md: '1.7rem'}, fontWeight: 700}}>
                    How to Become a Moderator
                </Typography>
                <Typography variant="body1" sx={{margin: '1rem 0', fontSize: {xs: '0.8rem', md: '1.2rem'}}}>
                    Becoming a moderator is a rewarding way to deepen your involvement with OpenFoodFacts.
                    Start by <a href="https://wiki.openfoodfacts.org/Database_Team">contributing to the database</a>: scan products, complete their details, and help categorize them.
                    With consistent participation and as you gain experience in the community, you can request to become a moderator.
                    Moderators are selected based on their dedication, understanding of the platform, and commitment to OpenFoodFacts’ mission.
                    See also <a href="https://wiki.openfoodfacts.org/Moderation">Moderation topic on our wiki</a>.
                </Typography>
            </Container>
        </>
    )
}