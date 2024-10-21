import IconButton from '@mui/material/IconButton';
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
            try {
                axios.delete(deleteUrl)
            } catch (err) {
                console.error(err)
            }
        }
    }

  return (
    <IconButton aria-label="delete" color='error' onClick={handleDelete}>
        { isConfirmed ? 
        <CheckIcon /> 
            : 
        <DeleteIcon />
        }
    </IconButton>
  )
}

export default DeleteButton