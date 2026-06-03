
export const formatNumberCount = (views) => {
    if (views >= 1_000_000_000) {
        return `${Math.floor(views / 1_000_000_000)}b+`;
    } else if (views >= 1_000_000) {
        return `${Math.floor(views / 1_000_000)}m+`;
    } else if (views >= 1_000) {
        return `${Math.floor(views / 1_000)}k+`;
    }
    return `${views}`;
};
