import { Typography, Box } from "@mui/material"

export default function Custom404() {
    return (
        <Box sx={{zIndex: "-10", position: "absolute", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center",width: "100vw", height: "100vh"}}>
            <Typography variant="h1" style={{margin: '1rem 0'}}>
                404
            </Typography>
            <Typography variant="h4">
                page not found
            </Typography>
        </Box>
    )
}