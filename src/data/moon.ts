// TODO: 出典・対象日付きの検証済み月情報を登録する。推測による月齢計算は禁止。
export interface MoonDay { date: string; phase: string; age: number; source: string; }
export interface MoonEvent { type: 'newmoon' | 'fullmoon'; at: string; zodiac?: string; source: string; }
export const moonDays: MoonDay[] = [];
export const moonEvents: MoonEvent[] = [];
export const jstDate = (date = new Date()) => new Intl.DateTimeFormat('sv-SE', {timeZone:'Asia/Tokyo'}).format(date);
export function getMoonStatus(date = new Date()) {
 const day = jstDate(date);
 return { date: day, today: moonDays.find(d=>d.date === day), nextNew: [...moonEvents].sort((a,b)=>Date.parse(a.at)-Date.parse(b.at)).find(e=>e.type==='newmoon' && Date.parse(e.at)>date.getTime()), nextFull:[...moonEvents].sort((a,b)=>Date.parse(a.at)-Date.parse(b.at)).find(e=>e.type==='fullmoon' && Date.parse(e.at)>date.getTime()) };
}
