import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import { useState } from 'react';
import axios from 'axios';
import PreviewOutlinedIcon from '@mui/icons-material/PreviewOutlined';
import Grid from '@mui/material/Unstable_Grid2';

const style = {
    position:'absolute',
    top:'10%',
    left:'10%',
    right:'10%',
    overflow:'scroll',
    height:'90%',
    display:'block',
    backgroundColor:'white',
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
            console.log(res.data.product);
            
            const usedData: any = {
                name: res.data.product.product_name || null,
                barcode: res.data.code || null,
                images: {},
                selectedImages: [],
                brands: res.data.product.brands || null,
                editors_tags: res.data.product.editors_tags || null,
                categories: res.data.product.categories || null,
                ingrediants: [],
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
            const selectedImages = res.data.product.selected_images;
            if (selectedImages) {
                for (const key in selectedImages) {
                    if (selectedImages[key].thumb && selectedImages[key].thumb.en) {
                      usedData.selectedImages.push(selectedImages[key].thumb.en);
                    }
                }
            }
            // loop through the ingrediants and keep only the text
            const ingrediants = res.data.product.ingredients;
            if (ingrediants) {
                for (const key in ingrediants) {
                    if (ingrediants[key].text) {
                        usedData.ingrediants.push(ingrediants[key].id);
                    }
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
                        <Typography id="modal-modal-title" variant="h5" component="h3">
                            {ticketInfo?.name}
                        </Typography>
                        <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                            Barcode : {ticketInfo?.barcode}
                        </Typography>
                        <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                            Brands : {ticketInfo?.brands}
                        </Typography>
                        <Typography>
                            Categories : {ticketInfo?.categories}
                        </Typography>
                        <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                            Selected Images :
                        </Typography>
                        {ticketInfo?.selectedImages ? (
                            <Box sx={{ display: 'flex', gap: '10px', alignItems: 'center', justifyContent: 'center', mt:2}}>
                                <Grid container spacing={2}>
                                    {ticketInfo.selectedImages.map((image: string, index: number) => (
                                        <Grid key={index}>
                                            <a href={image} target='_blank' key={index}>
                                                <img 
                                                    src={image} 
                                                    alt={index.toString()}
                                                    width={120}
                                                    height={120}
                                                    style={{objectFit: 'contain'}}
                                                />
                                            </a>
                                        </Grid>
                                    ))}
                                </Grid>
                            </Box>
                        ) : (
                            <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                                No selected images found
                            </Typography>
                        )}
                        <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                            Ingrediants :
                        </Typography>
                        {ticketInfo?.ingrediants ? (
                            <Box sx={{ display: 'flex', gap: '10px', alignItems: 'center', justifyContent: 'center', mt:2}}>
                                <Grid container spacing={2}>
                                    {ticketInfo.ingrediants.map((ingrediant: string, index: number) => (
                                        <Grid key={index}>
                                            <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                                                {ingrediant}
                                            </Typography>
                                        </Grid>
                                    ))}
                                </Grid>
                            </Box>
                        ) : (
                            <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                                No ingrediants found
                            </Typography>
                        )}
                        <Typography id="modal-modal-description" sx={{ mt: 2 }}>
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
                                                    width={120}
                                                    height={120}
                                                    style={{objectFit: 'contain'}}
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
                        <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                            Editors tags :
                        </Typography>
                        {ticketInfo?.editors_tags ? (
                            <Box sx={{ display: 'flex', gap: '10px', alignItems: 'center', justifyContent: 'center', mt:2}}>
                                <Grid container spacing={2}>
                                    {ticketInfo.editors_tags.map((tag: string, index: number) => (
                                        <Grid key={index} sx={{border: 'solid 1px black'}}>
                                            <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                                                {tag}
                                            </Typography>
                                        </Grid>
                                    ))}
                                </Grid>
                            </Box>
                        ) : (
                            <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                                No editors tags found
                            </Typography>
                        )

                        }
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