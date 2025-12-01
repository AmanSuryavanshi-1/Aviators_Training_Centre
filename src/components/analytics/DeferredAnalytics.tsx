"use client";

import { useEffect } from 'react';
import { getDeferredAnalyticsLoader } from '@/lib/analytics/deferredLoader';

/**
 * DeferredAnalytics Component
 * 
 * Manages deferred loading of third-party analytics scripts.
 * Reduces Total Blocking Time by loading GTM and Facebook Pixel
 * after critical content has rendered.
 */
export default function DeferredAnalytics() {
    useEffect(() => {
        const loader = getDeferredAnalyticsLoader();

        // Register Google Tag Manager
        loader.register({
            name: 'gtm',
            loadScript: () => {
                // Load GTM script dynamically
                const script = document.createElement('script');
                script.async = true;
                script.src = 'https://www.googletagmanager.com/gtag/js?id=G-XSRFEJCB7N';
                document.head.appendChild(script);

                script.onload = () => {
                    // Initialize GTM 
                    window.dataLayer = window.dataLayer || [];
                    function gtag(...args: any[]) {
                        window.dataLayer.push(args);
                    }
                    gtag('js', new Date());
                    gtag('config', 'G-XSRFEJCB7N', {
                        page_title: document.title,
                        page_location: window.location.href,
                        cookie_domain: 'aviatorstrainingcentre.in',
                        custom_map: {
                            custom_parameter_1: 'traffic_source',
                            custom_parameter_2: 'ai_platform',
                            custom_parameter_3: 'campaign_source',
                        },
                        send_page_view: true,
                        anonymize_ip: false,
                        allow_google_signals: true,
                        allow_ad_personalization_signals: true,
                    });

                    // Track domain information
                    gtag('event', 'domain_info', {
                        current_domain: window.location.hostname,
                        canonical_domain: 'www.aviatorstrainingcentre.in',
                        is_production: window.location.hostname === 'www.aviatorstrainingcentre.in',
                    });

                    if (process.env.NODE_ENV === 'development') {
                        console.log('✅ GTM loaded (deferred)');
                    }
                };
            },
            defer: 3000, // Load after 3 seconds
        });

        // Register Facebook Pixel
        loader.register({
            name: 'facebook-pixel',
            loadScript: () => {
                // Load Facebook Pixel dynamically
                const f: any = window;
                const b: any = document;
                const e = 'script';
                const v = 'https://connect.facebook.net/en_US/fbevents.js';

                if (f.fbq) return;

                const n: any = (f.fbq = function (...args: any[]) {
                    n.callMethod
                        ? n.callMethod.apply(n, args)
                        : n.queue.push(args);
                });

                if (!f._fbq) f._fbq = n;
                n.push = n;
                n.loaded = true;
                n.version = '2.0';
                n.queue = [];

                const t = b.createElement(e);
                t.async = true;
                t.src = v;
                const s = b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t, s);

                f.fbq('init', '1982191385652109');
                f.fbq('track', 'PageView');

                if (process.env.NODE_ENV === 'development') {
                    console.log('✅ Facebook Pixel loaded (deferred)');
                }
            },
            defer: 3000, // Load after 3 seconds
        });

        // Initialize deferred loading
        if (document.readyState === 'complete') {
            loader.init();
        } else {
            window.addEventListener('load', () => {
                loader.init();
            });
        }
    }, []);

    return null; // This component doesn't render anything
}

// Type declarations for window
declare global {
    interface Window {
        dataLayer: any[];
        fbq: (command: string, event?: string, params?: any) => void;
        _fbq: any;
    }
}
