import {getCollection,type CollectionEntry} from 'astro:content';
export type Article=CollectionEntry<'articles'>;
export async function getArticles(){
 const entries=(await getCollection('articles')).filter(e=>!e.data.draft);
 const slugs=new Set<string>();
 for(const e of entries){if(slugs.has(e.data.slug)||['oracle','oracle/cards','reading','about','moon','index'].includes(e.data.slug)||e.data.slug.startsWith('oracle/cards/'))throw new Error(`Duplicate or reserved article slug: ${e.data.slug}`);slugs.add(e.data.slug);if(e.data.updatedAt&&e.data.updatedAt<e.data.publishedAt)throw new Error(`Invalid article dates: ${e.id}`);}
 for(const e of entries)for(const slug of e.data.related)if(!slugs.has(slug))throw new Error(`Missing related article: ${slug}`);
 return entries.sort((a,b)=>b.data.publishedAt.getTime()-a.data.publishedAt.getTime()||a.data.slug.localeCompare(b.data.slug));
}
export function relatedArticles(entry:Article,all:Article[]){const choices=all.filter(e=>e.id!==entry.id);return [...entry.data.related.map(slug=>choices.find(e=>e.data.slug===slug)).filter((e):e is Article=>!!e),...choices.filter(e=>!entry.data.related.includes(e.data.slug))].slice(0,2);}
export const dateLabel=(date:Date)=>date.toISOString().slice(0,10).replaceAll('-','.');
