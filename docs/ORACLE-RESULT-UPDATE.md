# オラクル結果体験の改修

2026-09-30。前回のv0.2作業に続く、オラクル結果部分だけの変更です。commit / pushは行っていません。

## 変更内容

- 正式タイトル36枚、ID、slug、keyword、章を維持。添付一覧の別タイトルや番号へは置換していません。
- `shortMessage` を `affirmation` へ統合し、`cardMessage` を追加。`message` と `journalPrompt` を36枚すべて書き直しました。
- 本文は受容 → 肯定 → カードからの提案 → 小さな行動、最後に手帳への問いという構成。未来や現在の事情を断定せず、カードごとの意味を分けています。
- affirmationは一文。messageは改行を除いて243〜286文字、cardMessageは89〜101文字、問いは各一問。
- 結果は画像・名前・keyword → 肯定文 → 本文 → ベージュの補足メッセージ → 手帳への問い → 控えめな再ドロー。
- カード名の下の単独装飾を削除。本文と補足メッセージを別々の領域にしました。
- PCの左右配置を維持。スマホ640px以下は縦一列、カード幅76%・最大280px・中央配置。本文に段落間の余白と行間を設定。

TOP、記事本文・記事システム、ナビ、カード背面、カード選択画面、シャッフル処理、Cloudflare・GitHub設定は今回変更していません。主要ファイルは作業開始時とのハッシュ一致で確認しました。

## カード画像

**36枚すべてplaceholderです。正式な個別カード画像は0枚です。**

添付MASTER REFERENCEは方向性として参照し、画像の切り出しや新規生成は行っていません。既存の人物・窓辺・月の共通イラストを各slugのWebPへ複製しています。画像パスは実在し、欠損を存在するようには扱っていません。カード上にも小さく「共通の仮イラスト」と明示します。

正式画像を表中のファイルへ上書きして再ビルドすれば、データ編集なしで差し替えられます。バイナリ内容を共通仮画像と比較しており、正式画像へ変われば仮画像ラベルも自動で外れます。ファイル欠損・読み込みエラーの場合は共通絵へ戻ります。縦2:3、contain表示、推奨700×1050px以上です。

## 36枚のタイトル・placeholder一覧

IDは内部の識別子です。表面・裏面に番号を追加していません。

| 内部ID | 正式タイトル | keyword | 画像（すべてplaceholder） |
| --- | --- | --- | --- |
| 1 | 余白 | SPACE | `public/images/oracle/yohaku.webp` |
| 2 | 芽吹き | GROW | `public/images/oracle/mebuki.webp` |
| 3 | 光 | LIGHT | `public/images/oracle/hikari.webp` |
| 4 | 静けさ | STILL | `public/images/oracle/shizukesa.webp` |
| 5 | 本音 | TRUE | `public/images/oracle/honne.webp` |
| 6 | 境界 | BOUNDARY | `public/images/oracle/kyokai.webp` |
| 7 | 選ぶ | CHOOSE | `public/images/oracle/erabu.webp` |
| 8 | 一歩 | STEP | `public/images/oracle/ippo.webp` |
| 9 | 手放す | RELEASE | `public/images/oracle/tebanasu.webp` |
| 10 | 満ちる | ENOUGH | `public/images/oracle/michiru.webp` |
| 11 | 待つ | WAIT | `public/images/oracle/matsu.webp` |
| 12 | 還る | RETURN | `public/images/oracle/kaeru.webp` |
| 13 | 好奇心 | CURIOSITY | `public/images/oracle/kokishin.webp` |
| 14 | 扉 | DOOR | `public/images/oracle/tobira.webp` |
| 15 | 出会い | MEET | `public/images/oracle/deai.webp` |
| 16 | 旅 | JOURNEY | `public/images/oracle/tabi.webp` |
| 17 | 遊び | PLAY | `public/images/oracle/asobi.webp` |
| 18 | 予感 | HINT | `public/images/oracle/yokan.webp` |
| 19 | 風 | BREEZE | `public/images/oracle/kaze.webp` |
| 20 | 鏡 | MIRROR | `public/images/oracle/kagami.webp` |
| 21 | 影 | SHADOW | `public/images/oracle/kage.webp` |
| 22 | 温度 | WARMTH | `public/images/oracle/ondo.webp` |
| 23 | 深呼吸 | BREATHE | `public/images/oracle/shinkokyu.webp` |
| 24 | 月影 | REFLECTION | `public/images/oracle/tsukikage.webp` |
| 25 | 勇気 | COURAGE | `public/images/oracle/yuki.webp` |
| 26 | 流れ | FLOW | `public/images/oracle/nagare.webp` |
| 27 | 整える | ORDER | `public/images/oracle/totonoeru.webp` |
| 28 | 伝える | VOICE | `public/images/oracle/tsutaeru.webp` |
| 29 | 育てる | NURTURE | `public/images/oracle/sodateru.webp` |
| 30 | 舵 | DIRECTION | `public/images/oracle/kaji.webp` |
| 31 | 受け取る | RECEIVE | `public/images/oracle/uketoru.webp` |
| 32 | 眠り | REST | `public/images/oracle/nemuri.webp` |
| 33 | ほどく | UNWIND | `public/images/oracle/hodoku.webp` |
| 34 | 感謝 | THANKS | `public/images/oracle/kansha.webp` |
| 35 | 灯り | LANTERN | `public/images/oracle/akari.webp` |
| 36 | 新しい月 | NEW MOON | `public/images/oracle/atarashii-tsuki.webp` |

## 変更ファイル（今回分）

- `src/data/cards.ts`：36枚の明示的なデータと全原稿。
- `src/components/OracleResult.astro`：結果の順番・本文と補足欄・装飾削除。
- `src/components/CardArt.astro`：実在画像、仮画像表示、読み込み時のfallback。
- `src/utils/oracle-art.mjs`：ビルド時の仮画像判定。
- `src/styles/oracle-result.css`：結果だけに適用するPC／スマホスタイル。
- `src/pages/oracle/cards/[slug].astro`：descriptionをaffirmationへ接続。
- `public/images/oracle/*.webp`：上表の36個の実ファイル。
- `scripts/check-oracle.mjs`：新フィールド・文字数・画像の実在を検証。
- `scripts/check-browser.mjs`：390px追加、全36枚×4幅の長文・画像・配置確認。
- `README.md`、本報告書：運用と検証記録。

## 検証

| 項目 | 結果 |
| --- | --- |
| `npm run check` | 成功：0 errors / 0 warnings / 0 hints |
| `npm run build` | 成功：static・46ページ |
| 静的HTML・内部リンク・SEO | 既存のcheck-site.pyが成功 |
| カードデータ・状態遷移 | check-oracle.mjsが成功。全36枚、各章9枚、連打防止、結果切替、再ドロー、フォーカス等 |
| 文字数・仮画像実在 | 全36枚が指定範囲内。実ファイルとビルド出力のsrc・肯定文・補足本文を確認 |
| 正式画像への交換判定 | 共通絵と別画像でplaceholder判定が切り替わることを確認 |
| ID・タイトル・URLなど | 変更前の36枚と一致 |
| PC 1440pxの実表示 | 成功：全36枚の文章・画像・左右配置、主要6画面 |
| モバイル390px・360px・320px | 成功：各幅で全36枚の縦一列配置・カード幅・長文・横はみ出し検証 |

### ブラウザー確認完了（2026-09-30 18:59 JST）

ユーザーが通常ターミナルで実行した更新後の結果を確認しました。Chromium 151.0.7922.34で、全36枚×4幅の144件と主要6画面×4幅の24件、合計168件が成功しています。検証データは `qa-output/results.json`、画面は同フォルダーのPNGです。

- 1440px・390px・360px・320pxで、全36枚のタイトル・肯定文・本文・補足・問いをデータと照合。
- カード画像のデコード成功、横はみ出しなし、表示順・PC左右配置・スマホ縦一列・画像幅70〜80%内を確認。
- 選択・フリップ後の結果表示、キーボード選択、再ドロー、連打防止、reduced-motion、TOPへ戻る導線が成功。
- 保存画像を目視確認し、長文・長いカード名の配置、段落間隔、仮画像表記を確認。今回の確認に伴うサイト実装の修正は不要でした。
- 個別カードの長い全ページ画像では、画面外の関連記事画像が遅延読み込み前の背景で写っているものがあります。主要画面テストでは画像を読み込ませてから確認しており、別途カード本体は全36枚で読み込み済みを検証しています。

今回はデスクトップChromiumによる画面幅・タッチ設定のエミュレーションです。実機iPhone／Safariの検証とは区別しています。成果物はGit管理対象外です。

## push可否

静的・ロジック・更新後のブラウザー検証が成功し、GitHubへpush可能なローカル検証済みの状態です。ユーザーの指定どおり、commit / pushは行わずローカルで止めています。本番Cloudflareでのデプロイ・SITE_URL・リダイレクトの確認は別途必要です。
