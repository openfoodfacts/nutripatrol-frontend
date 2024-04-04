import { TextField, Button, Grid } from '@mui/material';
import axios from 'axios';
import { useState, ChangeEvent, FormEvent } from 'react';
import { useParams } from 'react-router-dom';

interface FormData {
    barcode: string;
    type: string;
    url: string;
    user_id: string;
    source: string;
    flavor: string;
    reason: string;
    comment: string;
}

export default function FlagFormPage() {

    const { source, flavor, barcode, user_id } = useParams<{ source: string, flavor: string, barcode: string, user_id: string }>();

    const [formData, setFormData] = useState<FormData>({
        barcode: barcode ?? '',
        type: '',
        url: '',
        user_id: user_id ?? '',
        source: source ?? '',
        flavor: flavor ?? '',
        reason: '',
        comment: ''
    })

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        try {
            axios.post(`${import.meta.env.VITE_API_URL}/flags`, formData)
        } catch (error) {
            console.error(error);
        }
        console.log(formData);
    };

    return (
        <>
            <div style={{margin: '3rem 3rem', color: '#281900'}}>
                <h1 style={{margin: '2rem 0', fontSize: '1.5rem'}}>
                    🇫🇷 Signalez un problème
                </h1>
                <form onSubmit={handleSubmit}>
                    <Grid container spacing={2}>

                        <input type="hidden" name="barcode" value={formData.barcode} />
                        <input type="hidden" name="type" value="product" />
                        <input type="hidden" name="url" value={`${import.meta.env.VITE_PO_URL}/product/${formData.barcode}`} />
                        <input type="hidden" name="user_id" value={formData.user_id} />
                        <input type="hidden" name="source" value={formData.source} />
                        <input type="hidden" name="flavor" value={formData.flavor} />

                        <Grid item xs={12}>
                            <TextField
                                label="reason"
                                name="reason"
                                fullWidth
                                type="text"
                                value={formData.reason}
                                onChange={handleChange}
                                required
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="comment"
                                name="comment"
                                fullWidth
                                type="text"
                                value={formData.comment}
                                onChange={handleChange}
                                required
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <Button type="submit" variant="contained" color="primary">
                                Envoyer
                            </Button>
                        </Grid>
                    </Grid>
                </form>
            </div>
        </>
    )
}