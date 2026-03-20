# ✨ Wonderbiz Farewell Memories

A full-stack web app to share resignation memories, team photos/videos, and farewell messages — now powered by **MongoDB Atlas**.

## Features
- 💌 **Memories** — Share written resignation memories with emoji tags & likes
- 📸 **Photos** — Upload team photos, masonry gallery + lightbox viewer
- 🎬 **Videos** — Upload and stream team videos
- 💛 **Farewell Wall** — Leave messages with star ratings for team bond
- 📊 **Live Stats** — Dashboard counts pulled straight from MongoDB

## Tech Stack
- **Frontend**: React 18, CSS custom properties, Google Fonts (Playfair Display + DM Sans)
- **Backend**: Node.js, Express, Mongoose (MongoDB ODM), Multer
- **Database**: MongoDB Atlas (cloud, free tier)

---

## Setup & Run

### Step 1 — Create a Free MongoDB Atlas Cluster

1. Go to **https://cloud.mongodb.com** and sign up / log in
2. Click **"Build a Database"** → choose **M0 Free Tier** → pick any region → Create
3. Create a **database user** (save the username & password!)
4. Go to **Network Access** → Add IP Address → **Allow Access from Anywhere** (`0.0.0.0/0`)
5. Click **Connect** → **Drivers** → copy the connection string, e.g.:
   ```
   mongodb+srv://youruser:yourpassword@cluster0.abc123.mongodb.net/?retryWrites=true&w=majority
   ```

---

### Step 2 — Configure Environment Variables

```bash
cd server
cp .env.example .env
```

Open `.env` and paste your URI (add `/wonderbiz` as the database name):

```env
MONGO_URI=mongodb+srv://youruser:yourpassword@cluster0.abc123.mongodb.net/wonderbiz?retryWrites=true&w=majority
PORT=5000
```

> ⚠️ Replace `youruser`, `yourpassword`, and the cluster hostname with your real values.

---

### Step 3 — Install Dependencies

```bash
# Server
cd server
npm install

# Client (in a new terminal)
cd client
npm install
```

---

### Step 4 — Run the App

```bash
# Terminal 1 — Backend
cd server
npm run dev
# You should see:
# ✅  MongoDB connected successfully
# 🚀  Wonderbiz Memories server running on http://localhost:5000

# Terminal 2 — Frontend
cd client
npm start
# Opens http://localhost:3000
```

---

## Project Structure

```
wonderbiz-memories/
├── server/
│   ├── index.js          ← Express API + Mongoose queries
│   ├── models.js         ← Mongoose schemas (Memory, Photo, Video, Feedback)
│   ├── .env.example      ← Copy to .env and fill in MONGO_URI
│   ├── package.json
│   └── uploads/          ← Auto-created for uploaded files
│       ├── photos/
│       └── videos/
└── client/
    ├── public/index.html
    └── src/
        ├── App.js
        ├── api.js
        ├── index.js / index.css
        ├── components/
        │   ├── Navbar.js / Navbar.css
        │   └── Toast.js
        └── pages/
            ├── Home.js / Home.css
            ├── Memories.js / Memories.css
            ├── Photos.js / Photos.css
            ├── Videos.js / Videos.css
            └── Feedback.js / Feedback.css
```

---

## MongoDB Collections

| Collection  | Fields |
|-------------|--------|
| `memories`  | title, content, author, emoji, likes, likedBy[], createdAt |
| `photos`    | filename, url, caption, author, createdAt |
| `videos`    | filename, url, title, author, createdAt |
| `feedbacks` | author, message, rating (1–5), role, createdAt |

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/stats` | Live counts from MongoDB |
| GET | `/api/memories` | All memories (newest first) |
| POST | `/api/memories` | Create memory |
| PATCH | `/api/memories/:id/like` | Toggle like |
| DELETE | `/api/memories/:id` | Delete memory |
| GET | `/api/photos` | All photos |
| POST | `/api/photos` | Upload photo (multipart) |
| DELETE | `/api/photos/:id` | Delete photo + file |
| GET | `/api/videos` | All videos |
| POST | `/api/videos` | Upload video (multipart) |
| DELETE | `/api/videos/:id` | Delete video + file |
| GET | `/api/feedbacks` | All feedbacks |
| POST | `/api/feedbacks` | Create feedback |
| DELETE | `/api/feedbacks/:id` | Delete feedback |

---

## Production Notes
- Move uploaded files to **Cloudinary** or **AWS S3** for cloud file storage
- Add **JWT authentication** to protect delete endpoints
- Set `REACT_APP_API_URL` env var if client and server are on different domains
- Use `npm run build` in `/client` to create a production build
