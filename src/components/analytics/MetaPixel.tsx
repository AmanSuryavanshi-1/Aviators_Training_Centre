'use client';

import { usePathname } from 'next/navigation';
import Script from 'next/script';
import { useState } from 'react';

export default function MetaPixel() {
    const [loaded, setLoaded] = useState(false);
    const pathname = usePathname();

    return (
        <>
            <Script
                id="fb-pixel"
                strategy="lazyOnload"
                onLoad={() => setLoaded(true)}
                dangerouslySetInnerHTML={{
                    __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '796016392336829');
            fbq('track', 'PageView');
          `,
                }}
            />
            <noscript>
                <img
                    height="1"
                    width="1"
                    style={{ display: 'none' }}
                    src="https://www.facebook.com/tr?id=796016392336829&ev=PageView&noscript=1"
                    alt="facebook pixel"
                />
            </noscript>
        </>
    );
}
