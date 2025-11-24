<div align="center">
  <img src="public/favicon.svg" alt="ResponScore Logo" width="120" height="120">
  
  # 👍 ResponScore
  
  **反応速度スコアリング・コミュニケーションアプリ**
  
  [![React](https://img.shields.io/badge/React-19.2.0-61DAFB?logo=react)](https://react.dev/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-3178C6?logo=typescript)](https://www.typescriptlang.org/)
  [![Vite](https://img.shields.io/badge/Vite-7.2.2-646CFF?logo=vite)](https://vite.dev/)
  
  [🚀 公開URL](https://responscore.pages.dev) | [📖 Documentation](.github/copilot-instructions.md)
</div>

---

## 📋 概要

ResponScore は、5人の会計事務所向けに設計された**反応速度スコアリング・コミュニケーションアプリ**です。タスクに対する絵文字リアクション（👍 了解、🟡 後で確認、🔴 対応中、✔ 完了）の反応速度に基づいてスコアを計算し、チームメンバーのランキングを表示します。

### ✨ 主な機能

- **📊 リアクションスコアリング** - 反応時間に応じた自動スコア計算（1分以内: +5点 〜 24時間以上: -5点）
- **🏆 リアンタイムランキング** - トップ3表彰台表示 + 全体順位表
- **📝 タスク管理** - タスク作成、詳細表示、ステータス自動更新
- **🎯 直感的UI** - 絵文字ボタンでワンクリック反応、トースト通知
- **📱 レスポンシブデザイン** - デスクトップ・モバイル対応

---

## 🏗️ アーキテクチャ

**3層アーキテクチャ**を採用し、保守性と拡張性を確保：

```
Repository Layer (データアクセス)
    ↓
Service Layer (ビジネスロジック)
    ↓
Component Layer (プレゼンテーション)
```

### 技術スタック

| 技術 | バージョン | 用途 |
|------|-----------|------|
| React | 19.2.0 | UIフレームワーク |
| TypeScript | 5.9.3 | 型安全性 |
| Vite | 7.2.2 | ビルドツール |
| React Router | 7.0.0 | ルーティング |
| localStorage | - | データ永続化（将来API移行予定） |

### ディレクトリ構造

```
src/
├── repositories/     # データアクセス層（localStorage抽象化）
├── services/         # ビジネスロジック層（DTOベース）
├── components/       # 再利用可能なUIコンポーネント
├── pages/           # ページコンポーネント（ルート単位）
├── utils/           # 純粋関数・ユーティリティ
├── types/           # TypeScript型定義
└── styles/          # グローバルCSS・デザインシステム
```

---

## 🚀 セットアップ

### 前提条件

- Node.js 18.x 以上
- npm 9.x 以上

### インストール

```bash
# リポジトリクローン
git clone https://github.com/Yokko405/ResponScore.git
cd ResponScore

# 依存関係インストール
npm install

# 開発サーバー起動
npm run dev
```

### ビルド

```bash
# 本番ビルド
npm run build

# プレビュー
npm run preview
```

---

## 📖 使い方

1. **ユーザー選択** - ヘッダーからユーザーを選択
2. **タスク作成** - タスク一覧ページでタスクを新規作成
3. **リアクション** - タスク詳細ページで絵文字ボタンを押す
4. **ランキング確認** - ランキングページでスコアと順位を確認

### スコアリングルール

| 反応時間 | スコア |
|---------|--------|
| ≤ 1分 | +5点 |
| ≤ 5分 | +4点 |
| ≤ 30分 | +3点 |
| ≤ 2時間 | +2点 |
| ≤ 24時間 | +1点 |
| > 24時間 | -5点 |

**ボーナス:** タスク完了（✔ 完了）: +3点

---

## 🎨 デザインシステム

プロジェクト全体で統一されたデザイントークンを使用：

- **カラー:** `--color-primary` (#1E88E5), `--color-unread` (赤), `--color-in_progress` (黄), `--color-done` (緑)
- **スペーシング:** `--space-{4, 8, 12, 16, 24, 32, 40, 48}`
- **ブレークポイント:** sm (640px), md (768px), lg (1024px), xl (1280px)

詳細は [`src/styles/global.css`](src/styles/global.css) を参照。

---

## 🤖 AI開発サポート

このプロジェクトはAIコーディングエージェント向けの詳細な開発ガイドを含んでいます：

📄 [`.github/copilot-instructions.md`](.github/copilot-instructions.md) - アーキテクチャ、パターン、ワークフロー、制約事項

---

## 🛠️ 開発ワークフロー

### 新機能追加

1. `src/types/index.ts` で型定義
2. `src/repositories/*.ts` でデータアクセス層実装
3. `src/services/*.ts` でビジネスロジック実装（DTOを返す）
4. `src/components/` or `src/pages/` でUI実装
5. `src/App.tsx` でルーティング追加（必要に応じて）

### デバッグ

- **localStorage確認:** DevTools → Application → Local Storage
- **React DevTools:** コンポーネント階層・フック状態確認
- **Toast通知:** エラーは5秒後に自動非表示（永続エラーはコンソール確認）

---

## 📦 デプロイ

現在のデプロイ先: **Cloudflare Pages**

🚀 **公開URL:** [https://responscore.pages.dev](https://responscore.pages.dev)

### デプロイ手順

```bash
# ビルド
npm run build

# Cloudflare Pagesへデプロイ（Wrangler使用）
npx wrangler pages deploy dist --project-name=responscore
```

---

## 🧪 テストデータ

初回起動時、以下のモックデータが自動ロード（[`src/utils/mockData.ts`](src/utils/mockData.ts)）：

- **ユーザー:** 5名（田中太郎、佐藤花子、鈴木次郎、渡辺健一、高橋美咲）
- **タスク:** 5件
- **リアクション:** 6件
- **スコア記録:** 6件

---

## 📝 ライセンス

このプロジェクトは個人利用・学習目的で作成されています。

---

## 🙋 サポート

質問・バグ報告は [Issues](https://github.com/Yokko405/ResponScore/issues) へお願いします。

---

<div align="center">
  Made with ❤️ by <a href="https://github.com/Yokko405">Yokko405</a>
</div>

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
