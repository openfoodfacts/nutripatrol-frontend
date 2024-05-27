import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import { useState } from 'react';
import axios from 'axios';
import PreviewOutlinedIcon from '@mui/icons-material/PreviewOutlined';
import Grid from '@mui/material/Unstable_Grid2';

const style = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '90%',
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
    const buildUrl = (barcode: string, imageId: string, def: string, rev?: string) => {
        // split the barcode into 4 parts
        const part1 = barcode.slice(0, 3);
        const part2 = barcode.slice(3, 6);
        const part3 = barcode.slice(6, 9);
        const part4 = barcode.slice(9);
        // if rev is defined, return the url with rev
        if (rev) {
            return `${import.meta.env.VITE_PO_IMAGE_URL}/images/products/${part1}/${part2}/${part3}/${part4}/${imageId}.${rev}.${def}.jpg`;
        }
        // else return the url without rev
        return `${import.meta.env.VITE_PO_IMAGE_URL}/images/products/${part1}/${part2}/${part3}/${part4}/${imageId}.${def}.jpg`;
    }
    const handleTicketInfo = () => {
        axios.get(`${import.meta.env.VITE_PO_URL}/api/v2/product/${barcode}.json`).then((res) => {
            const usedData: any = {
                name: res.data.product.product_name || null,
                barcode: res.data.code || null,
                images: {},
                selectedImages: {},
            }
            // loop through the images and build the url
            if (res.data.product.images) {
                Object.keys(res.data.product.images).forEach((key) => {
                    if (isNaN(parseInt(key))) {
                        usedData.images[key] = buildUrl(barcode, key, '100', res.data.product.images[key].rev);
                    } else {
                        usedData.images[key] = buildUrl(barcode, key, '100');
                    }
                });
            }
            // loop through the selected images and keep only the url
            if (res.data.product.selected_images) {
                Object.keys(res.data.product.selected_images).forEach((key) => {
                    usedData.selectedImages[key] = res.data.product.selected_images[key].small;
                });
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
            <Button 
                onClick={handleOpen}
                startIcon={<PreviewOutlinedIcon />}
                size='small'
                color='primary'
            >
                Open preview
            </Button>
            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="Ticket info"
                aria-describedby="Display ticket info (name, date, etc..)"
            >
                <Box sx={style}>
                {isLoaded ? (
                    <>
                        <Typography id="modal-modal-title" variant="h5" component="h2">
                            {ticketInfo?.name}
                        </Typography>
                        <Typography id="modal-modal-description" variant="h6" sx={{ mt: 2 }}>
                            Barcode : {ticketInfo?.barcode}
                        </Typography>
                        <Typography id="modal-modal-description" variant="h6" sx={{ mt: 2 }}>
                            Images :
                        </Typography>
                        {ticketInfo?.images ? (
                            <Box sx={{ display: 'flex', gap: '10px', alignItems: 'center', justifyContent: 'center', mt:2}}>
                                <Grid container spacing={2}>
                                    {Object.keys(ticketInfo.images).map((key) => (
                                        <Grid key={key}>
                                            <a href={ticketInfo.images[key]} target='_blank' key={key}>
                                                <img 
                                                    src={ticketInfo.images[key]} 
                                                    alt={key}
                                                    width={150}
                                                    height={150}
                                                />
                                            </a>
                                        </Grid>
                                    ))}
                                </Grid>
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