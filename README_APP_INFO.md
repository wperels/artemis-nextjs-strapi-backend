# Artemis App

A full-stack web application built with **Next.js** (frontend) and **Strapi** (backend/CMS).

---

## 🗂️ Project Structure

This project is split into two separate repositories and VS Code workspaces:

| Part     | Local Folder                                                     |
|----------|------------------------------------------------------------------|
| Frontend | "C:\Users\wpere\Local Sites\artemis-nextjs-strapi"       
| Backend  | "C:\Users\wpere\Local Sites\artemis-nextjs-strapi-backend" 

---

## 🔗 GitHub Repositories

- **Frontend:** https://github.com/wperels/artemis-nextjs-strapi
- **Backend:** https://github.com/wperels/artemis-nextjs-strapi-backend

---

## 🚀 Local Startup Instructions

### Backend (Strapi)

1. Open the backend folder in VS Code.
2. In the terminal, run:
   ```bash
   npm run develop
   ```
3. Strapi admin panel opens at: `http://localhost:1337/admin`(use account: ***REMOVED***)

### Frontend (Next.js)

1. Open the frontend folder in VS Code.
2. In the terminal, run:
   ```bash
   npm run dev
   ```
3. App opens at: `http://localhost:3003`

> **Note:** Always start the **backend first**, then the frontend.

---

## 🌐 Local Environment

| Resource           | URL / Info                     |
|--------------------|--------------------------------|
| Local App URL      | `http://localhost:3003`        |
| Local Strapi Admin | `http://localhost:1337/admin`  |
| Strapi Login Email |  ***REMOVED***        |
| Strapi Password    |  ***REMOVED***                     |

---

## ☁️ Deployed Environment

| Resource              | URL / Info                                                       |
|-----------------------|------------------------------------------------------------------|
| Deployed App URL      | https://wp-nextjs-strapi.vercel.app/                             |
| Deployed Strapi Admin | https://wp-nextjs-strapi-backend.onrender.com/admin              |
| Strapi Login Email    | ***REMOVED***                                            |
| Strapi Password       | q***REMOVED***                                             |

---

## 🛠️ Hosting & Service Accounts

### Vercel (Frontend Hosting)
- **Dashboard:** https://vercel.com
- **Account Email:** ***REMOVED***
- **Project Name:** wp-nextjs-strapi

### Render (Backend Hosting + Database)
- **Dashboard:** https://dashboard.render.com/
- **Account Email:** ***REMOVED***
- **Backend Service Name:** wp-nextjs-strapi-backend
- **PostgreSQL Database Name:** wp-strapi-db
- **Plan:** PostgreSQL Starter tier ($7/month)

### Cloudinary (Media Storage)
- **Dashboard:** https://cloudinary.com
- **Account Email:** ***REMOVED***
- **Cloud Name:** ***REMOVED***

---

## 🔑 Environment Variables

### Frontend (`.env.local`)
```env
NEXT_PUBLIC_STRAPI_URL= https://wp-nextjs-strapi-backend.onrender.com/admin
```

### Backend (`.env`)
```env
DATABASE_URL= ***REMOVED***
CLOUDINARY_NAME= ***REMOVED***
CLOUDINARY_KEY= ***REMOVED***
CLOUDINARY_SECRET= ***REMOVED***
FRONTEND_URL= https://wp-nextjs-strapi.vercel.app/
```

---

## 📝 Notes

- The frontend and backend are maintained in **separate GitHub repositories** and opened in **separate VS Code instances**.
- Local and deployed Strapi instances use **different admin accounts** — see the sections above for each.
- Media assets (images, uploads) are stored and served through **Cloudinary**.
- NOT(The backend database on Render is a **paid tier** to prevent data loss (free tier databases are deleted after inactivity).)
- The backend database is hosted on Neon (serverless PostgreSQL free tier) — data is preserved without inactivity deletion, replacing the previous Render PostgreSQL paid tier ($7/month).