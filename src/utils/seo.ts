export interface Crumb {name:string;url:string;}
export const jsonLd=(value:unknown)=>JSON.stringify(value).replace(/</g,'\\u003c');
