import { TextField, Button, Grid } from '@mui/material';
import axios from 'axios';
import { useState, ChangeEvent, FormEvent } from 'react';

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

export default function FlagFormPage(props: { user_id: string }) {

    const [formData, setFormData] = useState<FormData>({
        barcode: '',
        type: '',
        url: '',
        user_id: '',
        source: '',
        flavor: '',
        reason: '',
        comment: ''
    })

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setFormData({ ...formData, [name]: value });
    };

    // type of flag: 'product', 'image'
    const [type, setType] = useState<string>('product');

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        try {
            axios.post(`${import.meta.env.VITE_API_URL}/flags`, formData)
        } catch (error) {
            console.error(error);
        }
        console.log(formData);
    };

    if (type === 'product') {
        return (
            <>
                <div style={{margin: '3rem 3rem', color: '#281900'}}>
                    <h1 style={{margin: '2rem 0', fontSize: '1.5rem'}}>
                        🇫🇷 Signalez un problème
                    </h1>
                    <form onSubmit={handleSubmit}>
                        <Grid container spacing={2}>

                            <input type="hidden" name="type" value="product" />

                            <Grid item xs={12}>
                                <TextField
                                    label="barcode (auto)"
                                    name="barcode"
                                    fullWidth
                                    type='text'
                                    value={formData.barcode}
                                    onChange={handleChange}
                                    required
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    label="url (auto)"
                                    name="url"
                                    fullWidth
                                    type="text"
                                    value={formData.url}
                                    onChange={handleChange}
                                    required
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    label="user id (auto)"
                                    name="user_id"
                                    fullWidth
                                    type="text"
                                    value={formData.user_id}
                                    onChange={handleChange}
                                    required
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    label="source (auto)"
                                    name="source"
                                    fullWidth
                                    type="text"
                                    value={formData.source}
                                    onChange={handleChange}
                                    required
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    label="flavor (auto)"
                                    name="flavor"
                                    fullWidth
                                    type="text"
                                    value={formData.flavor}
                                    onChange={handleChange}
                                    required
                                />
                            </Grid>
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
}