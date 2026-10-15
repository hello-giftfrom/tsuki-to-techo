// Replace these paths to switch provisional editorial assets site-wide.
export const media = {
  lake: {src:'/images/v02/lake.webp',alt:'雪山と森に囲まれた湖畔の風景',width:1600,height:1067},
  journal: {src:'/images/v02/journal.webp',alt:'窓辺の手帳とペン、あたたかなキャンドルの灯り',width:1200,height:800},
  oracle: {src:'/images/v02/oracle-placeholder.webp',alt:'月の見える窓辺で手帳をひらく人のイラスト',width:700,height:1050},
} as const;
export type MediaKey=keyof typeof media;
export const socials: {label:string;url:string}[]=[];
