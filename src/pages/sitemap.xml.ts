import type {APIRoute} from 'astro';
import {getArticles} from '../utils/articles';
import {cards} from '../data/cards';
const escape=(s:string)=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
export const GET:APIRoute=async({site})=>{
 const articles=await getArticles();
 const pages=[...['/','/oracle/','/reading/','/about/'].map(path=>({path,lastmod:undefined as string|undefined})),...articles.map(e=>({path:`/${e.data.slug}/`,lastmod:(e.data.updatedAt??e.data.publishedAt).toISOString()})),...cards.map(c=>({path:`/oracle/cards/${c.slug}/`,lastmod:undefined}))];
 return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${pages.map(p=>`<url><loc>${escape(new URL(p.path,site).href)}</loc>${p.lastmod?`<lastmod>${p.lastmod}</lastmod>`:''}</url>`).join('')}</urlset>`,{headers:{'Content-Type':'application/xml'}});
};
