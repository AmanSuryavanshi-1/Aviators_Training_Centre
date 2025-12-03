export default function sanityLoader({ src, width, quality }: {
    src: string;
    width: number;
    quality?: number;
}) {
    // If it's a Sanity CDN URL, add optimization params
    if (src.includes('cdn.sanity.io')) {
        const url = new URL(src);
        url.searchParams.set('w', width.toString());
        url.searchParams.set('q', (quality || 75).toString());
        url.searchParams.set('auto', 'format');
        url.searchParams.set('fit', 'max');
        return url.toString();
    }
    return src;
}
