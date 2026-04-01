import pickle
import numpy as np

# with open('model/pt.pkl', 'rb') as f:
#     pt = pickle.load(f)

# with open('model/similarity_score.pkl', 'rb') as f:
#     similarity_score = pickle.load(f)

# def similarity(book_name):
#     #index fetch
#     index = np.where(pt.index==book_name)[0][0]
#     similar_items = sorted(list(enumerate(similarity_score[index])), key=lambda x:x[1], reverse=True)[1:6]

#     similar_books = []
#     for i in similar_items:
#         similar_books.append(pt.index[i[0]])
        
#     return similar_books

# print(similarity("Harry Potter and the Goblet of Fire (Book 4)"))


with open('model/books_dict.pkl', 'rb') as f:
    books_dict = pickle.load(f)

# print(books_dict)


with open("model/popular_books.pkl", "rb") as f:
    popular_books = pickle.load(f)

print(popular_books)

# books_dict = list(books_dict.values())
# for i in books_dict:
#     if "Harry Potter and the Goblet of Fire (Book 4)" in i['title']:
#         print(i['id'])
#         print("found")
    
