import type {APIRoute} from 'astro';
import {getCollection} from 'astro:content';
import {cards} from '../data/cards';
export const GET: APIRoute = async ({site}) => {
const paths=['/','/oracle/','/oracle/cards/','/moon/',...(await getCollection('articles')).map(e=>`/${e.id}/`),...cards.map(c=>`/oracle/cards/${c.slug}/`)];
return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${paths.map(p=>`<url><loc>${new URL(p,site)}</loc></url>`).join('')}</urlset>`,{headers:{'Content-Type':'application/xml'}});
};
