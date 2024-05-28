import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import Collapse from '@mui/material/Collapse';
import CloseIcon from '@mui/icons-material/Close';

interface AuthAlertProps {
    message: string;
    severity: 'error' | 'warning' | 'info' | 'success';
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}

export default function AuthAlert({ message, severity, isOpen, setIsOpen }: AuthAlertProps) {
    return (
        <Box sx={{ width: '100%' }} >
            <Collapse in={isOpen}>
                <Alert
                action={
                    <IconButton
                    aria-label="close"
                    color="inherit"
                    size="small"
                    onClick={() => {
                    setIsOpen(false);
                    }}
                    >
                    <CloseIcon fontSize="inherit" />
                    </IconButton>
                }
                severity={severity}
                sx={{ mb: 2 }}
                >
                    { message }
                </Alert>
            </Collapse>
        </Box>
    )
}