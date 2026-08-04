import { useEffect, useState } from 'react';

const BREAKPOINTS = [
    { maxWidth: 640, items: 1 },
    { maxWidth: 1024, items: 2 },
    { maxWidth: 1280, items: 3 },
    { maxWidth: Infinity, items: 4 },
];

function resolve(width) {
    return (BREAKPOINTS.find((b) => width < b.maxWidth) || BREAKPOINTS.at(-1)).items;
}

export function useCarouselItemsPerView() {
    const [items, setItems] = useState(() => resolve(window.innerWidth));
    useEffect(() => {
        let t;
        const onResize = () => { clearTimeout(t); t = setTimeout(() => setItems(resolve(window.innerWidth)), 200); };
        window.addEventListener('resize', onResize);
        return () => { window.removeEventListener('resize', onResize); clearTimeout(t); };
    }, []);
    return items;
}

export default useCarouselItemsPerView;