import { MouseEvent, FC } from 'react';
import { mdiChevronLeft, mdiChevronRight } from '@mdi/js';
import Button from '../Button';

interface PaginationProps {
    currentPage: number;
    numPages: number;
    goToPage: (page: number) => void;
}

const Pagination: FC<PaginationProps> = ({ currentPage, numPages, goToPage }) => {
    const totalPages = numPages;
    const maxPagesToShow = 3; // increase number of pages to show
    let start = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    const end = Math.min(totalPages, start + maxPagesToShow - 1);
    start = Math.max(1, end - maxPagesToShow + 1);

    const handleGoToPage = (page: number) => (e: MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        goToPage(page);
    };

    return (
        <div className="mx-2 flex items-center gap-1">
            {currentPage > 1 && (
                <Button
                    small
                    color="whiteDark"
                    onClick={handleGoToPage(currentPage - 1)}
                    icon={mdiChevronLeft}
                />
            )}
            {start > 2 && (
                // Show "1" if there are pages before start page to indicate truncation
                <Button small color="whiteDark" onClick={handleGoToPage(1)} label="1" />
            )}
            {start > 2 && <span className="mx-2">...</span>}
            {Array.from({ length: end - start + 1 }, (_, i) => start + i).map((page) => (
                <Button
                    active={page === currentPage}
                    key={page}
                    small
                    label={`${page}`}
                    color={page === currentPage ? 'lightDark' : 'whiteDark'}
                    onClick={handleGoToPage(page)}
                />
            ))}
            {end < totalPages - 1 && <span className="mx-2">...</span>}
            {end < totalPages && (
                <Button
                    small
                    color="whiteDark"
                    onClick={handleGoToPage(totalPages)}
                    label={`${totalPages}`}
                />
            )}
            {totalPages > 1 && currentPage < totalPages && (
                <Button
                    small
                    color="whiteDark"
                    onClick={handleGoToPage(currentPage + 1)}
                    icon={mdiChevronRight}
                />
            )}
        </div>
    );
};

export default Pagination;
