import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import { useState } from 'react';
import axios from 'axios';

const style = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 1000,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
  };

interface ModalInfoProps {
    barcode: string;
}

export default function ModalInfo({barcode}: ModalInfoProps) {

    const [open, setOpen] = useState(false);
    const handleTicketInfo = () => {
        axios.get(`${import.meta.env.VITE_PO_URL}/api/v2/product/${barcode}.json`).then((res) => {
            const usedData = {
                name: res.data.product.product_name || null,
                barcode: res.data.code || null,
                images: {
                    front_small: res.data.product.image_front_small_url || null,
                    ingrediants_small: res.data.product.image_ingredients_small_url || null,
                    nutrition_small: res.data.product.image_nutrition_small_url || null,
                    image_small: res.data.product.image_small_url || null,
                }
            }
            setTicketInfo(usedData);
            setIsLoaded(true);
        }).catch((err) => {
            console.error(err);
            setIsLoaded(true);
        })
    }
    const handleOpen = () => {
        handleTicketInfo();
        setOpen(true);
    };
    const handleClose = () => setOpen(false);
    const [isLoaded, setIsLoaded] = useState(false);
    const [ticketInfo, setTicketInfo] = useState<any>(null);


    return (
        <div>
            <Button onClick={handleOpen}>Open modal</Button>
            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="Ticket info"
                aria-describedby="Display ticket info (name, date, etc..)"
            >
                <Box sx={style}>
                {isLoaded ? (
                    <>
                        <Typography id="modal-modal-title" variant="h6" component="h2">
                            Product name : {ticketInfo?.name}
                        </Typography>
                        <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                            Barcode : {ticketInfo?.barcode}
                        </Typography>
                        {ticketInfo?.images ? (
                            <Box sx={{ display: 'flex', gap: '10px', alignItems: 'center', justifyContent: 'center'}}>
                                {Object.keys(ticketInfo.images).map((key) => (
                                    <a href={ticketInfo.images[key]} target='_blank' key={key}>
                                        <img 
                                            src={ticketInfo.images[key]} 
                                            alt={key}
                                            width={200}
                                            height={200}
                                        />
                                    </a>
                                ))}
                            </Box>
                        ) : (
                            <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                                No images found
                            </Typography>
                        )}
                    </>
                ) : (
                    <Typography id="modal-modal-title" variant="h6" component="h2">
                        Loading...
                    </Typography>
                )}
                </Box>
            </Modal>
        </div>
    )
}