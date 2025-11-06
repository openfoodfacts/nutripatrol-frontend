import { 
    Typography, 
    Container, 
    TextField, 
    Select, 
    MenuItem, 
    Button, 
    InputLabel, 
    FormControl 
} from '@mui/material';
import axios from 'axios';
import { useState, useContext, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { reasons, sources, flavors } from '../const/flagsConst';
import LoginContext from '../contexts/login';

/**
 * Interfaces
 */
interface FlagFormProps {
    type_: 'product' | 'image' | 'search';
}

interface FormData {
    barcode: string;
    type: 'product' | 'image' | 'search';
    image_id?: string;
    user_id: string;
    source: string;
    flavor: string;
    reason: 'innapropriate' | 'duplicate' | 'other' | 'spam' | '';
    comment: string;

}

export default function FlagForm({ type_ }: FlagFormProps) {

    const [searchParams] = useSearchParams();
    const { userName } = useContext(LoginContext);
    const barcode = searchParams.get('barcode') || undefined;
    const source = searchParams.get('source') || undefined;
    const flavor = searchParams.get('flavor') || undefined;
    const image_id = searchParams.get('image_id') || undefined;
    const comment = searchParams.get('comment') || undefined;

    if ( source === undefined || !sources.includes(source) || flavor === undefined || !flavors.includes(flavor) ){
        return (
            <Container maxWidth='lg'>
                <Typography variant="h4" sx={{margin: '4rem 0', fontSize: {xs: '1.2rem', md: '1.7rem'}, fontWeight: 700}}>
                    Error: Wrong source or flavor
                </Typography>
            </Container>
        )
    }

    const [formData, setFormData] = useState<FormData>({
        barcode: barcode || "", // only for product and image
        type: type_, // product, image, search
        user_id: userName, // not in the form
        image_id: image_id, // only for image
        source: source || "", // not in the form
        flavor: flavor || "", // not in the form
        reason: "",
        comment: comment || ""
    });
    const [image, setImage] = useState<string | null>(null);

    // Helper function to validate imageId and barcode
    const isValidId = (value: string | undefined) => {
        // Only allow alphanumeric, underscore, hyphen
        return typeof value === 'string' && /^[a-zA-Z0-9_-]+$/.test(value);
    };

    useEffect(() => {
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
        if (type_ === 'image') {
            // Validate barcode and image_id before using them
            if (isValidId(formData.barcode) && isValidId(formData.image_id as string)) {
                const url = buildUrl(formData.barcode, formData.image_id as string, '400');
                axios.get(url).then(() => {
                    setImage(url);
                }
                ).catch((err) => {
                    console.error(err);
                })
            } else {
                setImage(null);
            }
        }
    }, [formData.type]);

    const handleChange = (e: any) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name as string]: value,
        }));
    };   

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            axios.post(`${import.meta.env.VITE_API_URL}/flags`, formData)
            .then(() => {
                window.location.replace('/thanks');
            })
        } catch (err) {
            console.error(err)
        }
    };

    /* FORM FOR PRODUCT */
    return (
        <Container sx={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }} >
            <Typography variant='h4'>
                {type_ === 'product' ? 'Flag a product' : 'Flag an image'}
            </Typography>
            {image && <img src={image} alt="product" style={{ width: '250px', margin: '2rem 0' }} />}
            <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', width: '70%'}}>
                <TextField
                    name="barcode"
                    label="Barcode"
                    value={formData.barcode}
                    onChange={handleChange}
                    fullWidth
                    disabled
                    margin="normal"
                    required
                />
                <FormControl fullWidth margin="normal">
                    <InputLabel id="reason">Reason *</InputLabel>
                    <Select
                        labelId='reason'
                        name="reason"
                        label="Reason *"
                        value={formData.reason}
                        onChange={handleChange}
                        fullWidth
                        required
                    >
                        { reasons[type_].map((reason) => (
                                <MenuItem key={reason.value} value={reason.value}>
                                    {reason.label}
                                </MenuItem>
                            ))    
                        }
                    </Select>
                </FormControl>
                <TextField
                    name="comment"
                    label="Comment"
                    value={formData.comment}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                />
                <Button type="submit" variant="contained" color="success" sx={{margin: '1rem 0', width: '15rem'}}>
                    Flag {type_}
                </Button>
            </form>
        </Container>
    )
}