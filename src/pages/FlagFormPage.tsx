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
import { useState, useContext } from 'react';
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
        image_id: "no_image", // only for image
        source: source || "", // not in the form
        flavor: flavor || "", // not in the form
        reason: "",
        comment: ""
    });

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
                window.location.replace('/');
            })
        } catch (err) {
            console.error(err)
        }
    };

    /* FORM FOR PRODUCT */
    return (
        <Container sx={{ marginTop: '2rem' }} >
            <Typography variant='h4'>
                Flag Form
            </Typography>
            <form onSubmit={handleSubmit}>
                <TextField
                    name="barcode"
                    label="Barcode"
                    value={formData.barcode}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                    required
                />
                {
                    type_==='image' && (
                        <TextField
                            name="image_id"
                            label="Image ID"
                            value={formData.image_id}
                            onChange={handleChange}
                            fullWidth
                            margin="normal"
                            required
                        />
                    )
                }
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
                    required
                />
                <Button type="submit" variant="contained" color="success">
                    Flag {type_}
                </Button>
            </form>
        </Container>
    )
}