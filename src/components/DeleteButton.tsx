import Button from '@mui/material/Button';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckIcon from '@mui/icons-material/Check';
import LoopIcon from '@mui/icons-material/Loop';
import { useState } from 'react';
import axios from 'axios';

interface DeleteButtonProps {
    barcode: string;
    imgids: string;
    handleImageDeleted: () => void;
}

const DeleteButton = ({ barcode, imgids, handleImageDeleted }: DeleteButtonProps) => {

    const [isConfirmed, setIsConfirmed] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const deleteUrl = `${import.meta.env.VITE_PO_DELETE_IMAGES_URL}?code=${barcode}&imgids=${imgids}&move_to_override=trash`

    const handleDelete = () => {
        if (!isConfirmed) {
            setIsConfirmed(true)
        } else {
            setIsLoading(true)
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
                        },
                        withCredentials: true
                    }
                )
                .then(response => {
                    console.log(response)
                    setIsLoading(false)
                    handleImageDeleted()
                })
            } catch (err) {
                console.error(err)
                setIsLoading(false)
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
            isLoading ?
                <LoopIcon />
                :
                (isConfirmed ? 
                    <CheckIcon />
                    :
                    <DeleteIcon />
                )
        }
        onClick={handleDelete}
        variant='contained'
    >
        { isLoading ?
                'Loading'
                :
                (isConfirmed ? 
                    'Confirm'
                    :
                    'Delete'
                )
        }
    </Button>
  )
}

export default DeleteButton