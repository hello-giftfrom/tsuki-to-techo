import {defineCollection} from 'astro:content';
import {z} from 'astro/zod';
import {glob} from 'astro/loaders';
const articles=defineCollection({loader:glob({pattern:'**/*.md',base:'./src/content/articles'}),schema:z.object({
 title:z.string(),description:z.string(),slug:z.string().regex(/^[a-z0-9]+(?:[/-][a-z0-9]+)*$/),
 category:z.enum(['新月の願い事','満月の手放し','手帳の書き方','オラクルカード','読みもの']),
 publishedAt:z.coerce.date(),updatedAt:z.coerce.date().optional(),author:z.literal('月と手帳'),
 image:z.enum(['lake','journal','oracle']),featured:z.boolean().default(false),related:z.array(z.string()).default([]),
 sources:z.array(z.object({title:z.string(),url:z.url()})).default([]),
 firsthandNote:z.string().optional(),draft:z.boolean().default(false),
})});
export const collections={articles};
