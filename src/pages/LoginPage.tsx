import Button from '@mui/material/Button';
import { Link } from 'react-router-dom';
import { Typography, Box } from '@mui/material';

export default function LoginPage() {
    return (
        <Box sx={{position: "absolute", width: "100vw", height: "100vh", zIndex: "-10", color: '#281900', display: 'flex',flexDirection: "column", alignItems: "center", justifyContent:"center"}}>
            <Typography variant="h4" style={{margin: '2rem 0'}}>
                Login with your OpenFoodFacts account
            </Typography>
            <Button 
                component={Link} 
                to={`${import.meta.env.VITE_PO_URL}/cgi/session.pl`} 
                variant='contained'
                color="primary"
                target="_blank" >
                Login
            </Button>
        </Box>
    )
}