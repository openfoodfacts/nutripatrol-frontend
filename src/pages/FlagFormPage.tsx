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

export default function FlagFormPage() {

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

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        axios.post(`${import.meta.env.VITE_API_URL}/flags`, formData)
        console.log(formData);
    };

    return (
        <>
            <div style={{margin: '3rem 8rem', color: '#281900'}}>
                <h1 style={{margin: '2rem 0', fontSize: '1.5rem'}}>
                    🇫🇷 Signalez un problème
                </h1>
                <form onSubmit={handleSubmit}>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                label="barcode"
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
                                label="type"
                                name="type"
                                fullWidth
                                type="text"
                                value={formData.type}
                                onChange={handleChange}
                                required
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="url"
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
                                label="user id"
                                name="user_id"
                                fullWidth
                                type="text"
                                value={formData.url}
                                onChange={handleChange}
                                required
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="source"
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
                                label="flavor"
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