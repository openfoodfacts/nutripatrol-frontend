import { Typography, Container, TextField, Button } from '@mui/material';
import { useState } from 'react';

interface FlagFormProps {
    type_: 'product' | 'image' | 'search';
}

interface FormData {
    barcode: string;
    type: 'product' | 'image' | 'search';
    url: string;
    user_id: string;
    source: string;
    flavor: string;
    reason: string;
    comment: string;

}

export default function FlagForm({ type_ }: FlagFormProps) {

    const [formData, setFormData] = useState<FormData>({
        barcode: "",
        type: type_,
        url: "",
        user_id: "",
        source: "",
        flavor: "",
        reason: "",
        comment: ""
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
      };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        // You can do something with the form data here, like submit it to a server
        console.log('Form data:', formData);
    };

    return (
        <Container sx={{ marginTop: '2rem' }} >
            <Typography>
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
                />
                <TextField
                    name="url"
                    label="URL"
                    value={formData.url}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                />
                <TextField
                    name="user_id"
                    label="User ID"
                    value={formData.user_id}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                />
                <TextField
                    name="source"
                    label="Source"
                    value={formData.source}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                />
                <TextField
                    name="flavor"
                    label="Flavor"
                    value={formData.flavor}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                />
                <TextField
                    name="reason"
                    label="Reason"
                    value={formData.reason}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                />
                <TextField
                    name="comment"
                    label="Comment"
                    value={formData.comment}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                />
                <Button type="submit" variant="contained" color="success">
                    Flag {type_}
                </Button>
            </form>
        </Container>
    )
}