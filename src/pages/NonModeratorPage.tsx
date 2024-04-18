import { Typography, Box } from "@mui/material"

export default function NonModeratorPage() {
    return (
        <Box sx={{position: "absolute", width: "100vw", height: "100vh", zIndex: "-10", color: '#281900', display: 'flex',flexDirection: "column", alignItems: "center", justifyContent:"center"}}>
            <Typography variant="h4">
                You have to be moderator to access to this page.
            </Typography>
        </Box>
    )
}