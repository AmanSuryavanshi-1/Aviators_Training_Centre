export const getMotionProps = () => {
    if (typeof window === 'undefined') return {};

    // Disable animations on mobile for performance
    const isMobile = window.innerWidth < 768;

    return isMobile ? {
        initial: false,
        animate: false,
        transition: { duration: 0 },
    } : {
        // Normal animation props can be spread here if needed, 
        // or this function can be used to override specific props
    };
};

export const mobileViewport = {
    once: true,
    amount: 0.2
};
