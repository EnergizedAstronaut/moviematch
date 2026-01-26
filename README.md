# MovieMatch 🎬

MovieMatch is a Next.js app that helps two people compare their movie tastes and find the best movies to watch together. 
MovieMatch highlights shared favorites and recommends movies you’ll both enjoy.

🔗 Live demo: https://moviematch-gamma.vercel.app
<img width="1279" height="1149" alt="Screenshot 2026-01-26 at 11 28 20" src="https://github.com/user-attachments/assets/f47b8c47-e56d-4b28-b282-cfcd8848941b" />
<img width="1236" height="1092" alt="Screenshot 2026-01-26 at 11 29 37" src="https://github.com/user-attachments/assets/a3810f5f-bb64-4636-b610-a49b861bf458" />
<img width="1266" height="898" alt="Screenshot 2026-01-26 at 11 30 43" src="https://github.com/user-attachments/assets/682e5192-06fe-4222-b92d-f2f878b75475" />


It includes:

- **Togetherness Mode**
- Movie search powered by TMDB
- Personalized recommendations based on shared genres
- Shared watchlist comparison
- Trending movies section
- Movie details modal
- Simple login + dashboard pages (Next.js app structure)

---

## 🚀 Features

### Togetherness Mode
Compare movie lists between two people and discover shared favorites.

### Search & Add
Search for movies via TMDB and add them to each person’s list.

### Recommendations
Get movie suggestions based on shared genres between both lists.

### Watch Together
View common movies both people like.

---

## 📁 Project Structure

moviematch/
├─ app/
│ ├─ layout.jsx
│ ├─ page.jsx
│ ├─ dashboard/
│ │ └─ page.jsx
│ └─ auth/
│ ├─ login/
│ │ └─ page.jsx
│ └─ logout/
│ └─ page.jsx
├─ components/
│ └─ MovieTracker.jsx
├─ styles/
│ └─ globals.css
├─ tailwind.config.js
├─ postcss.config.js
├─ next.config.js
└─ package.json

---

Got it — your **README is missing proper Markdown formatting** so everything is running together as plain text.

Here’s the **fixed section** with proper headings, line breaks, and code blocks so it displays correctly.

---

# ✅ Fix for the “Installation” section

Replace your current installation section with this:

````md
## 🛠️ Installation

### 1. Clone the repo

```bash
git clone https://github.com/EnergizedAstronaut/moviematch.git
cd moviematch
````

### 2. Install dependencies

```bash
npm install
```

### 3. Add TMDB API Key

Create a `.env.local` file:

```env
NEXT_PUBLIC_TMDB_API_KEY=YOUR_TMDB_API_KEY
```

You can get an API key here: [https://www.themoviedb.org/settings/api](https://www.themoviedb.org/settings/api)

### 4. Run the project

```bash
npm run dev
```

Open:

```
http://localhost:3000
```

````

---

# ✅ Your full README section after fixing

Copy/paste this whole block into your README and it will display correctly:

```md
## 🛠️ Installation

### 1. Clone the repo

```bash
git clone https://github.com/EnergizedAstronaut/moviematch.git
cd moviematch
````

### 2. Install dependencies

```bash
npm install
```

### 3. Add TMDB API Key

Create a `.env.local` file:

```env
NEXT_PUBLIC_TMDB_API_KEY=YOUR_TMDB_API_KEY
```

You can get an API key here: [https://www.themoviedb.org/settings/api](https://www.themoviedb.org/settings/api)

### 4. Run the project

```bash
npm run dev
```

Open:

```
http://localhost:3000
```





🌟 Technologies
Next.js 14
React 18
Tailwind CSS
TMDB API
Lucide Icons

⭐ Contributing
Want to help?
Feel free to open issues or create pull requests.

📄 License
This project is open-source and available under the MIT License.
