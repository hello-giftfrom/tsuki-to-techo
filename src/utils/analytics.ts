type EventName = 'oracle_start' | 'oracle_theme_select' | 'card_select' | 'card_result' | 'journal_prompt_view' | 'newmoon_click' | 'fullmoon_click';
declare global { interface Window { dataLayer?: unknown[]; gtag?: (...args: unknown[])=>void; } }
export function track(name: EventName, params: {theme?: string; card_id?: number; location?: string} = {}) { window.gtag?.('event', name, params); }
export function initializeAnalytics() {
 const id = import.meta.env.PUBLIC_GA4_ID;
 if (!/^G-[A-Z0-9]+$/.test(id || '') || window.gtag) return;
 window.dataLayer = window.dataLayer || [];
 window.gtag = function(..._args: unknown[]) { window.dataLayer!.push(arguments); };
 window.gtag('js',new Date()); window.gtag('config',id,{send_page_view:false});
 const script = document.createElement('script'); script.async=true;script.src=`https://www.googletagmanager.com/gtag/js?id=${id}`;document.head.append(script);
}
