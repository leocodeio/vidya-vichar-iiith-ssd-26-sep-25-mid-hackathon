# Turborepo Starter

This repository is a **Turborepo** monorepo with two applications:  

- **API** → `apps/api`  
- **Web** → `apps/web`  

---

## 🚀 Getting Started

### 1. Install dependencies
```bash
pnpm install
```

---

### 2. Setup environment variables
Both projects require a `.env` file. Copy the `.env.example` in each project before running:

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
```

---

### 3. Development
Run **both apps** in dev mode:

```bash
pnpm rundev
```

*(this should be defined in root `package.json` as a Turborepo task that starts both `apps/api` and `apps/web` in parallel)*

---

### 4. Build
To build all apps:

```bash
pnpm run build
```

---

### 5. Start
Run the production build:

```bash
pnpm runs tatar
```

*(replace `tatar` with `start` if you meant that — looks like a typo!)*

---

## 📂 Project Structure
```
.
├── apps/
│   ├── api/    # Backend API
│   └── web/    # Frontend Web App
├── package.json
├── turbo.json
└── pnpm-workspace.yaml
```
