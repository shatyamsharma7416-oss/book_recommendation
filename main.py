"""
Folio — FastAPI backend
"""

from fastapi import FastAPI, Request
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse, Response
import pickle
import numpy as np

app = FastAPI()

app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

# ── Load pickle files ─────────────────────────────────────────────────────────
with open("model/popular_books.pkl", "rb") as f:
    popular_books = pickle.load(f)

with open("model/books_dict.pkl", "rb") as f:
    books_dict = pickle.load(f)  # {book_title: book_detail_dict}

with open("model/pt.pkl", "rb") as f:
    pt = pickle.load(f)

with open("model/similarity_score.pkl", "rb") as f:
    similarity_score = pickle.load(f)


def similarity(book_name):
    index = np.where(pt.index == book_name)[0][0]
    similar_items = sorted(
        list(enumerate(similarity_score[index])),
        key=lambda x: x[1],
        reverse=True
    )[1:6]
    return [pt.index[i[0]] for i in similar_items]

# Build name → book lookup for similarity results (case-insensitive)
books_by_name = {title.lower(): book for title, book in books_dict.items()}

# All books as a list for autocomplete matching
all_books_list = list(books_dict.values())

# ── Suppress Chrome DevTools 404 noise ───────────────────────────────────────
@app.get("/.well-known/appspecific/com.chrome.devtools.json")
async def chrome_devtools():
    return Response(status_code=204)

# ── Routes ────────────────────────────────────────────────────────────────────

@app.get("/")
async def index(request: Request):
    return templates.TemplateResponse(request, "index.html", {
        "request": request,
        "books": popular_books,
    })
    

@app.get("/book/{book_name:path}")
async def book_detail(request: Request, book_name: str):
    book = books_by_name.get(book_name.lower())
    if not book:
        return templates.TemplateResponse(request, "index.html", {
            "request": request,
            "books": popular_books,
        })

    rec_names = similarity(book["title"])
    recommendations = [
        books_by_name[name.lower()]
        for name in rec_names
        if name.lower() in books_by_name
    ]

    return templates.TemplateResponse(request, "book_detail.html", {
        "request": request,
        "book": book,
        "recommendations": recommendations,
    })


@app.get("/api/search")
async def search(q: str = ""):
    """
    Autocomplete endpoint.
    Returns:
      matches     — books whose title contains the query string (up to 6)
      suggestions — similar books based on the top match (up to 5)
    """
    q = q.strip()
    if len(q) < 2:
        return JSONResponse({"matches": [], "suggestions": []})

    q_lower = q.lower()

    # Find matching books (title contains query)
    matches = [
        book for book in all_books_list
        if q_lower in book["title"].lower()
    ][:6]

    # Get similarity suggestions based on the top match
    suggestions = []
    if matches:
        top_title = matches[0]["title"]
        try:
            rec_names = similarity(top_title)
            suggestions = [
                books_by_name[name.lower()]
                for name in rec_names
                if name.lower() in books_by_name
                and name.lower() not in [m["title"].lower() for m in matches]
            ][:5]
        except Exception:
            pass

    def serialize(book):
        return {
            "title":     book.get("title", ""),
            "author":    book.get("author", ""),
            "image_url": book.get("image_url") or "",
        }

    return JSONResponse({
        "matches":     [serialize(b) for b in matches],
        "suggestions": [serialize(b) for b in suggestions],
    })
