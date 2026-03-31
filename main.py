"""
Folio — FastAPI backend starter
Replace the pickle-loading sections with your actual pickle files.
"""

from fastapi import FastAPI, Request
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
import pickle
import numpy as np

app = FastAPI()

app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

# ── Load your pickle files here ──────────────────────────────────────────────
# popular_books: list of 50 dicts with keys: book_id, title, author, image_url
# books_dict:    dict mapping book_id → book detail dict (year, buy_url, etc.)
# similarity:    callable — similarity(book_name) → list of 5 book name strings

with open("model/popular_books.pkl", "rb") as f:
    popular_books = pickle.load(f)

with open("model/books_dict.pkl", "rb") as f:
    books_dict = pickle.load(f)

with open("model/pt.pkl", 'rb') as f:
    pt = pickle.load(f)

with open('model/similarity_score.pkl', 'rb') as f:
    similarity_score = pickle.load(f)

def similarity(book_name):
    #index fetch
    index = np.where(pt.index==book_name)[0][0]
    similar_items = sorted(list(enumerate(similarity_score[index])), key=lambda x:x[1], reverse=True)[1:6]

    similar_books = []
    for i in similar_items:
        similar_books.append(pt.index[i[0]])
        
    return similar_books



# Build a name → book lookup to convert similarity results back to book dicts
books_by_name = {book["title"]: book for book in books_dict.values()}

# ── Routes ────────────────────────────────────────────────────────────────────

@app.get("/")
async def index(request: Request):
    return templates.TemplateResponse(request, "index.html", {
        "books": popular_books,
    })


@app.get("/book/{book_id}")
async def book_detail(request: Request, book_id: str):
    book = books_dict.get(book_id)
    if not book:
        return templates.TemplateResponse(request, "index.html", {
            "books": popular_books,
        })

    rec_names = similarity(book["title"])          # call it like a function
    recommendations = [books_by_name[name] for name in rec_names if name in books_by_name]

    return templates.TemplateResponse(request, "book_detail.html", {
        "book": book,
        "recommendations": recommendations,
    })
