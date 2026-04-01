# 📖 Folio — Book Recommendation System

A calm, beautiful book recommendation web app built with FastAPI and Jinja2. Discover popular books, explore details, and get personalised recommendations powered by collaborative filtering.

---

## Features

- **Popular Books** — homepage showcasing 50 curated books in a responsive grid
- **Book Detail Page** — click any book to see its details and 5 similar recommendations
- **Smart Search** — live autocomplete search bar with two sections:
  - *Books* — titles matching your query
  - *You might also like* — similarity-based suggestions from the top match
- **Keyboard Navigation** — use ↑ ↓ arrows and Enter in the search dropdown
- **Smooth Transitions** — page fade-in and staggered card animations

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | FastAPI |
| Templating | Jinja2 |
| ML Model | Collaborative Filtering (cosine similarity) |
| Frontend | Vanilla JS, CSS3 |
| Fonts | Playfair Display, Lora, DM Sans |
| Deployment | Docker + Render |

---

## Project Structure

```
book_recommendation/
├── main.py                      # FastAPI app, routes, search API
├── Dockerfile                   # Docker config for Render deployment
├── requirements.txt             # Python dependencies
├── .dockerignore
│
├── model/                       # Pickle files (not committed to git)
│   ├── popular_books.pkl        # List of 50 popular book dicts
│   ├── books_dict.pkl           # {book_title: book_detail_dict}
│   ├── pt.pkl                   # Pivot table used by similarity model
│   └── similarity_score.pkl     # Precomputed cosine similarity matrix
│
├── templates/
│   ├── base.html                # Shared layout — navbar, search bar, footer
│   ├── index.html               # Homepage — 50 books grid
│   └── book_detail.html         # Detail page — book info + 5 recommendations
│
└── static/
    ├── css/style.css            # Full stylesheet
    └── js/main.js               # Autocomplete, animations, page transitions
```

---

## Pickle File Format

### `popular_books.pkl`
A list of 50 book dicts shown on the homepage:
```python
[
  {
    "title":     "The Alchemist",
    "author":    "Paulo Coelho",
    "image_url": "https://...",   # or None
  },
  ...
]
```

### `books_dict.pkl`
A dict keyed by book title for fast lookup:
```python
{
  "The Alchemist": {
    "title":     "The Alchemist",
    "author":    "Paulo Coelho",
    "image_url": "https://...",
    "year":      1988,            # optional
    "buy_url":   "https://...",   # optional
  },
  ...
}
```

### `pt.pkl`
A pivot table (pandas DataFrame) with book titles as the index, used by the similarity function.

### `similarity_score.pkl`
A precomputed cosine similarity matrix (numpy array) aligned with `pt.index`.

---

## How the Similarity Function Works

```python
def similarity(book_name):
    index = np.where(pt.index == book_name)[0][0]   # find row index
    similar_items = sorted(
        list(enumerate(similarity_score[index])),
        key=lambda x: x[1],
        reverse=True
    )[1:6]                                           # top 5, skip self
    return [pt.index[i[0]] for i in similar_items]  # return book titles
```

---

## Running Locally

### 1. Clone the repo
```bash
git clone https://github.com/yourusername/folio.git
cd folio
```

### 2. Install dependencies
```bash
pip install -r requirements.txt
```

### 3. Add your model files
Place your four pickle files inside a `model/` folder:
```
model/popular_books.pkl
model/books_dict.pkl
model/pt.pkl
model/similarity_score.pkl
```

### 4. Run the server
```bash
uvicorn main:app --reload --log-level warning
```

Visit `http://localhost:8000`

---

## Running with Docker

```bash
docker build -t folio .
docker run -p 8000:8000 folio
```

---

## Deploying to Render

1. Push your repo to GitHub (make sure `model/` folder is included)
2. Go to [render.com](https://render.com) → New Web Service
3. Connect your GitHub repo
4. Set environment to **Docker**
5. Render auto-detects the `Dockerfile` and deploys

> **Note:** If you update `style.css` or `main.js`, bump the version query string in `base.html` (`?v=4`, `?v=5`, etc.) to bust Render's CDN cache.

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Homepage with 50 popular books |
| `GET` | `/book/{book_name}` | Detail page for a specific book |
| `GET` | `/api/search?q={query}` | Autocomplete search — returns matches + suggestions |

### `/api/search` Response
```json
{
  "matches": [
    { "title": "Harry Potter", "author": "J.K. Rowling", "image_url": "..." }
  ],
  "suggestions": [
    { "title": "The Hobbit", "author": "J.R.R. Tolkien", "image_url": "..." }
  ]
}
```

---

## License

MIT
