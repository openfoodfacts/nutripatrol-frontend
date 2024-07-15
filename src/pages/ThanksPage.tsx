import { Box, Button, Typography } from "@mui/material"
import { Link } from "react-router-dom"


const ThanksPage = () => {
  return (
    <Box sx={{zIndex: "-10", position: "absolute", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center",width: "100vw", height: "100vh"}}>
            <Typography variant="h3" style={{margin: '1rem 0'}}>
                Thanks for your feedback
            </Typography>
            <Typography variant="h5">
                We will review your feedback as soon as possible
            </Typography>
            <Button variant="outlined" sx={{margin: '1rem 0'}}>
                <Link to="/">Back to home</Link>
            </Button>
        </Box>
  )
}

export default ThanksPage