import Button from '@mui/material/Button';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckIcon from '@mui/icons-material/Check';
import { useState } from 'react';
import axios from 'axios';

interface DeleteButtonProps {
    barcode: string;
    imgids: string;
}

const DeleteButton = ({ barcode, imgids }: DeleteButtonProps) => {

    const [isConfirmed, setIsConfirmed] = useState(false)
    const deleteUrl = `${import.meta.env.VITE_PO_DELETE_IMAGES_URL}?code=${barcode}&imgids=${imgids}&move_to_override=trash`

    const handleDelete = () => {
        if (!isConfirmed) {
            setIsConfirmed(true)
        } else {
            const data = new URLSearchParams()
            data.append('code', barcode)
            data.append('imgids', imgids)
            data.append('move_to_override', 'trash')
            try {
                axios.post(
                    deleteUrl,
                    data,
                    {
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded'
                        }
                    }
                )
            } catch (err) {
                console.error(err)
            }
        }
    }

  return (
    <Button 
        aria-label="delete"
        color={
            isConfirmed ? 
            'info'
            :
            'error'
        }
        startIcon={
            isConfirmed ? 
            <CheckIcon />
            :
            <DeleteIcon />
        }
        onClick={handleDelete}
        variant='contained'
    >
        { isConfirmed ? 
            "confirm"
            :
            "delete"
        }
    </Button>
  )
}

export default DeleteButton