# Migration to Local SQLite

This project was originally built for the Manus platform with MySQL. To run it locally as a standalone app, follow these steps:

## 1. Move Project
**CRITICAL:** Move this entire project folder out of iCloud Drive to avoid permission errors.
Recommended location: `~/Projects/CASPERS_PAINTWORKS` or `~/Code/CASPERS_PAINTWORKS`.

## 2. Install Dependencies
Run the following commands in the new folder:
```bash
npm install
npm install drizzle-orm better-sqlite3
npm install -D drizzle-kit @types/better-sqlite3
# Uninstall Manus specific plugins
npm uninstall vite-plugin-manus-runtime
```

## 3. Update Configuration
### Package.json
Remove `"vite-plugin-manus-runtime": "..."` from `package.json` dependencies and `vite.config.ts` plugins.

### Database Schema
Replace `drizzle/schema.ts` with the SQLite version:
```bash
mv drizzle/schema.ts drizzle/schema.mysql.backup.ts
mv drizzle/schema.sqlite.ts drizzle/schema.ts
```

### Database Connection
Replace `server/db.ts` with the SQLite version:
```bash
mv server/db.ts server/db.mysql.backup.ts
mv server/db.sqlite.ts server/db.ts
```

### Drizzle Config
Replace `drizzle.config.ts`:
```bash
mv drizzle.config.ts drizzle.config.mysql.backup.ts
mv drizzle.config.sqlite.ts drizzle.config.ts
```

## 4. Database Setup
Run migrations to create the local `sqlite.db` file:
```bash
npx drizzle-kit push
```

## 5. Download Assets
Download the images from the live site to your local folder:
```bash
npx tsx scripts/download_images.ts
```

## 6. Additional Updates
You may need to update `server/shopDb.ts` and `server/cmsDb.ts` to use SQLite syntax for inserts (replace `.insertId` with `.returning({ id: table.id })`).
Also update imports in those files to remove `drizzle-orm/mysql2`.

## 7. Run Local Server
```bash
npm run dev
```
The site should now be accessible at `http://localhost:3000`.
