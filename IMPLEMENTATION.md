# 実装計画

## フェーズ構成

全体を2フェーズに分けて進める。

- **フェーズ1（フロントエンド先行）**: 認証・DB・実APIなし。モックデータのみでUIを構築し、画面デザインを確認する。
- **フェーズ2（バックエンド統合）**: Prisma・Auth0・AI アダプターを実装し、フロントエンドと結合する。

---

## フェーズ1: フロントエンド（モックレベル）

### Step 1 — Mantine セットアップ

**作業内容**
- Mantine v8 関連パッケージをインストール
  - `@mantine/core` `@mantine/hooks` `@mantine/charts` `@mantine/dates` `@mantine/notifications` `@mantine/form`
  - `recharts`（`@mantine/charts` の peer dependency）
  - `postcss-preset-mantine` `postcss-simple-vars`（dev）
- Tailwind CSS をアンインストール（`tailwindcss` `@tailwindcss/postcss`）
- `postcss.config.mjs` を Mantine 用に書き換え
- `app/globals.css` を書き換え（Tailwind 削除、Mantine CSS インポート）
- `next.config.ts` に `optimizePackageImports` を追加
- `app/layout.tsx` に `MantineProvider` + `ColorSchemeScript` + `mantineHtmlProps` を設定

**完了条件**: `npm run dev` が起動し、Mantine コンポーネントがレンダリングされる

---

### Step 2 — アプリシェル（ナビゲーション）

**作業内容**
- `app/(app)/layout.tsx` — Mantine `AppShell` で認証済みレイアウトを作成
  - デスクトップ: 左サイドバーにナビリンク（ホーム / 履歴 / 体重管理）
  - モバイル: 画面下部にボトムナビ（375px 以上対応）
- `app/page.tsx` — `/` を `/(app)` へリダイレクト

**完了条件**: 各ページへのリンクが機能し、モバイル・デスクトップ両レイアウトが表示される

---

### Step 3 — ホーム画面 UI（モックデータ）

**作業内容**
- `components/chat/ChatMessage.tsx`
  - 食品名・数量・カロリー・PFC を表示する解析結果カード
  - 信頼度バッジ（高 / 中 / 低）
- `components/chat/ChatInput.tsx`
  - Mantine `Textarea` + `ActionIcon` による入力エリア（下部固定）
  - 送信するとモックの解析結果カードが追加されるだけの状態にする
- `components/chat/ChatHistory.tsx`
  - メッセージ一覧（モックデータを表示）
  - 最新 20 件表示
- `components/charts/PFCDonutChart.tsx`
  - `@mantine/charts` の `DonutChart` で PFC バランスを表示
- `components/dashboard/DailySummary.tsx`
  - 当日の合計カロリー・PFC サマリーカード
  - 食事記録ごとに編集・削除ボタンを表示（動作はモック）
- `components/dashboard/CalorieBalance.tsx`
  - BMR 入力フォーム（身長・体重・年齢・性別、ハリス-ベネディクト式で計算）
  - 摂取カロリーと消費カロリーの差分表示
- `app/(app)/page.tsx`
  - 上部: 当日サマリー
  - 中央: チャット履歴
  - 下部固定: チャット入力エリア

**完了条件**: ホーム画面のすべての要素がモックデータで表示され、チャット入力で結果カードが追加される

---

### Step 4 — 履歴画面 UI（モックデータ）

**作業内容**
- `components/history/HistoryList.tsx`
  - 日付ごとにグループ化したリスト
  - 各日のグループに摂取カロリー合計・PFC 合計のサマリーを表示
  - 各記録に編集・削除ボタン（動作はモック）
- `app/(app)/history/page.tsx`

**完了条件**: 日付グループリストがモックデータで表示され、編集・削除ボタンが確認できる

---

### Step 5 — 体重管理画面 UI（モックデータ）

**作業内容**
- `components/dashboard/WeightInput.tsx`
  - 体重（kg）の数値入力フォーム + 記録ボタン
- `components/charts/WeightChart.tsx`
  - `@mantine/charts` の `LineChart` で体重推移グラフ
  - 表示期間切替ボタン（7日 / 30日 / 90日）
- `app/(app)/weight/page.tsx`
  - 体重入力フォーム（上部）
  - 体重推移グラフ（中央）
  - 記録一覧（下部）、各記録に編集・削除ボタン（動作はモック）

**完了条件**: 体重推移グラフがモックデータで表示され、期間切替が機能する

---

### Step 6 — ログイン画面 UI

**作業内容**
- `app/(auth)/login/page.tsx`
  - Mantine `Center` + `Paper` でカード形式のログイン画面
  - メール/パスワード入力フォーム（見た目のみ、送信は未実装）
  - Google ログインボタン（見た目のみ）
  - アプリロゴ・タイトルを表示

**完了条件**: `/login` にアクセスするとログイン画面が表示される

---

### Step 7 — PWA マニフェスト

**作業内容**
- `app/manifest.ts` — `MetadataRoute.Manifest` 型でマニフェスト定義
  - アプリ名・短縮名・テーマカラー・背景色
  - `display: "standalone"`
  - アイコン設定（192×192・512×512）
- `public/icons/` に PWA アイコンを配置

**完了条件**: Chrome DevTools の Application タブでマニフェストが認識される

---

## フェーズ2: バックエンド統合

> フェーズ1のデザイン確認後に着手する。

### Step 8 — DB スキーマ

- `npx prisma init` 実行
- `prisma/schema.prisma` に `User` / `MealRecord` / `WeightRecord` の3モデルを定義
- `lib/db.ts` — Prisma クライアントシングルトン（開発時のホットリロード対策込み）
- `npx prisma db push` でスキーマを Prisma Postgres に適用

---

### Step 9 — AI アダプター基盤

- `lib/ai/types.ts` — `AIAdapter` インターフェース・`NutritionAnalysis` / `ParsedMealItem` 型定義
- `lib/ai/mock.ts` — JSON のみ返すモック実装
- `lib/ai/index.ts` — `AI_PROVIDER=mock|gemini|claude` 環境変数でアダプターを切り替えるファクトリー
- `lib/ai/relevance.ts` — 食事・体重関連判定ロジック（LLM に渡す前のサーバー側フィルタ）

---

### Step 10 — Auth0 認証フロー

- Auth0 ダッシュボードでアプリ登録、コールバック URL 設定
- `.env.local` に `AUTH0_DOMAIN` / `AUTH0_CLIENT_ID` / `AUTH0_CLIENT_SECRET` / `AUTH0_SECRET` / `APP_BASE_URL` を設定
- `lib/auth0.ts` — `Auth0Client` インスタンス（Auth0 v4）
- `proxy.ts` — Auth0 v4 のルートプロキシ（`middleware.ts` の代替）
- `app/layout.tsx` に `UserProvider` を追加

---

### Step 11 — API ルート

- `app/api/analyze/route.ts` — POST: 関連性判定後、AI アダプターへ渡して `NutritionAnalysis` を返す
- `app/api/meals/route.ts` — GET（当日の最新20件）/ POST（新規保存）
- `app/api/meals/[id]/route.ts` — PUT（編集）/ DELETE
- `app/api/weight/route.ts` — GET（期間フィルタ）/ POST（体重記録）
- `app/api/weight/[id]/route.ts` — PUT（編集）/ DELETE
- `app/api/user/profile/route.ts` — GET / PUT（BMR・プロフィール情報）

---

### Step 12 — フロントエンドとの結合

- `app/(app)/page.tsx` — モックデータを実 API レスポンスに置き換え
- `app/(app)/history/page.tsx` — 実 API に接続
- `app/(app)/weight/page.tsx` — 実 API に接続
- 認証ガード（未ログイン時に `/login` へリダイレクト）を有効化

---

### Step 13 — PWA Service Worker

- `@serwist/next` をインストール・設定
- `app/sw.ts` — Serwist Service Worker エントリポイント
- `next.config.ts` に `@serwist/next` プラグイン設定を追加

---

### Step 14 — 動作確認・ビルド

- `npm run dev` でローカル全機能確認（ログイン・チャット・編集・削除・グラフ）
- `npm run build` でビルドエラーなし確認
- Lighthouse で PWA スコア確認

---

## 環境変数一覧（`.env.local`）

| 変数名                | 説明                                               |
| --------------------- | -------------------------------------------------- |
| `AUTH0_DOMAIN`        | Auth0 テナントドメイン                             |
| `AUTH0_CLIENT_ID`     | Auth0 クライアント ID                              |
| `AUTH0_CLIENT_SECRET` | Auth0 クライアントシークレット                     |
| `AUTH0_SECRET`        | セッション暗号化用のランダム文字列（32文字以上）   |
| `APP_BASE_URL`        | アプリのベース URL（例: `http://localhost:3000`）  |
| `DATABASE_URL`        | Prisma Postgres 接続文字列                         |
| `AI_PROVIDER`         | `mock` / `gemini` / `claude`（デフォルト: `mock`） |
