'use client';

import dynamic from 'next/dynamic';

const WhatsAppChat = dynamic(() => import('./WhatsAppChat'), {
    ssr: false
});

export default function WhatsAppChatWrapper() {
    return <WhatsAppChat />;
}
