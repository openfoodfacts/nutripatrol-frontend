import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import { useState } from 'react';
import axios from 'axios';
import PreviewOutlinedIcon from '@mui/icons-material/PreviewOutlined';
import Grid from '@mui/material/Unstable_Grid2';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DeleteButton from './DeleteButton';

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
            console.log(res.data)        
            const usedData: any = {
                name: res.data.product.product_name || null,
                barcode: res.data.code || null,
                images: {},
                brands: res.data.product.brands || null,
                editors_tags: res.data.product.editors_tags || null,
                categories: [],
                ingredients: [],
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
            // loop through the ingredients and keep only the text
            const ingredients = res.data.product.ingredients;
            if (ingredients) {
                for (const key in ingredients) {
                    if (ingredients[key].text) {
                        usedData.ingredients.push(ingredients[key].id);
                    }
                }
            }
            // loop through the categories and keep only the text
            const categories = res.data.product.categories_hierarchy
            if (categories) {
                for (const key in categories) {
                    if (categories[key]) {
                        usedData.categories.push(categories[key]);
                    }
                }
            }
            console.log(usedData)
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
                            Images :
                        </Typography>
                        {ticketInfo?.images ? (
                            <Box sx={{ display: 'flex', gap: '20px', alignItems: 'center', justifyContent: 'center', mt:2}}>
                                <Grid container spacing={2}>
                                    {Object.keys(ticketInfo.images).map((key) => (
                                        <Grid key={key} sx={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                            <img 
                                                src={ticketInfo.images[key]} 
                                                alt={key}
                                                width={160}
                                                height={160}
                                                style={{objectFit: 'contain'}}
                                            />
                                            
                                            <DeleteButton barcode={ticketInfo.barcode} imgids={ticketInfo.key} />

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
                            Brands : {ticketInfo?.brands}
                        </Typography>
                        <Box sx={{ border: 'solid 1px black', p: 2 }}>
                            <Typography sx={{ mt: 2 }}>
                                Categories :
                            </Typography>
                            {ticketInfo?.categories ? (
                                <Box sx={{ display: 'flex', gap: '10px', alignItems: 'center', justifyContent: 'center', mt:2}}>
                                    <Grid container spacing={2}>
                                        {ticketInfo.categories.map((category: string, index: number) => (
                                            <Grid key={index}>
                                                <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                                                    {category}
                                                </Typography>
                                            </Grid>
                                        ))}
                                    </Grid>
                                </Box>
                            ) : (
                                <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                                    No categories found
                                </Typography>
                            )}
                        </Box>
                        <Box sx={{ border: 'solid 1px black', p: 2 }}>
                            <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                                Ingredients :
                            </Typography>
                            {ticketInfo?.ingredients ? (
                                <Box sx={{ display: 'flex', gap: '10px', alignItems: 'center', justifyContent: 'center', mt:2}}>
                                    <Grid container spacing={2}>
                                        {ticketInfo.ingredients.map((ingrediant: string, index: number) => (
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
                                    No ingredients found
                                </Typography>
                            )}
                        </Box>
                        <Accordion>
                            <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            aria-controls="panel1-content"
                            id="panel1-header"
                            >
                                <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                                    Editors tags :
                                </Typography>
                            </AccordionSummary>
                            <AccordionDetails>
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
                            </AccordionDetails>
                        </Accordion>
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