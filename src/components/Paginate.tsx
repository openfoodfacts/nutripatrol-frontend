import Pagination from '@mui/material/Pagination';

interface PaginateProps {
    currentPage: number;
    setCurrentPage: any;
    maxPage: number;
}

export default function Paginate({ currentPage, setCurrentPage, maxPage } : PaginateProps) {

    const handleChange = (event: React.ChangeEvent<unknown>, value: number) => {
        setCurrentPage(value);
    };

    return (
        <Pagination 
            count={maxPage} 
            page={currentPage} 
            onChange={handleChange}
            color='primary'
            shape="rounded" 
            size="large"
        />
    )
}