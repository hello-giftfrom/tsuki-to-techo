# v0.2 画像管理

生成方法：組み込み imagegen による新規生成（generate）。参照画像の切り抜き・合成は行っていません。生成後にSharpでWebPへ最適化しました。

| 配信用ファイル | サイズ | 用途 |
| --- | --- | --- |
| `public/images/v02/lake.webp` | 1600×1067 | TOP、夜の背景、記事の仮アイキャッチ |
| `public/images/v02/journal.webp` | 1200×800 | 手帳紹介、記事の仮アイキャッチ |
| `public/images/v02/oracle-placeholder.webp` | 700×1050 | 36枚共通の仮カード絵、オラクル記事 |

パスとaltは `src/data/media.ts` に集約。カード固有画像は `public/images/oracle/[slug].webp` に配置して再ビルドします。カードの固定比率は2:3、contain表示です。生成した風景は実在の場所・当日の月を示す写真ではありません。

## 使用プロンプト

### 湖畔

Use case: photorealistic-natural. A standalone wide 3:2 editorial landscape for a refined Japanese Nordic journaling magazine. Blue-hour snowy Scandinavian mountains and a still lake, pine forest on the right, tiny timber cabin with warm lit windows at the right shore. A softly glowing moon in the upper right sky. Upper left is pale cream-blue twilight sky with generous uncluttered negative space for dark Japanese title text added later; lower left is darker blue lake for small white text. Muted navy, warm ivory and soft beige, subtle natural film texture. Beautiful quiet photographic scenery, not a UI mockup. No text, logos, cards, phones, borders or collage.

### 手帳

Use case: photorealistic-natural. Wide 3:2 editorial lifestyle photograph for a Scandinavian journaling magazine. A well-used open cream notebook with a few indistinct handwritten strokes, fountain pen, ivory ceramic mug with a simple dark botanical pattern, a small glowing candle and delicate dried branches on a natural linen-covered wooden desk beside a Nordic cabin window. Soft late afternoon light mixed with candle warmth, muted ivory beige navy palette, tactile paper and cloth, quiet intimate atmosphere, refined composition, no readable words, no logos, no people, no overlay text, no mockup, no collage.

### 共通カード

Use case: illustration-story. One standalone vertical 2:3 Nordic vintage storybook oracle illustration, no text and absolutely no numbers. A young adult in a long muted navy dress sits quietly at an open wooden window with a blank cream journal on their lap. A small candle, dried botanical sprigs, soft moon above a still lake, distant snowy mountains and pine forest. A little narrative moment of pausing and listening to oneself. Hand-painted gouache and delicate engraved botanical linework on aged ivory paper, desaturated indigo, parchment beige, tiny muted gold highlights. Elegant thin double-line border with subtle leaves; full scene not an abstract symbol, no tarot suits, no Justice sword/scales, no lettering, no title, no collage. This will serve as a shared provisional oracle illustration until each card gets individual artwork.
