import pickle
import numpy as np

with open('pt.pkl', 'rb') as f:
    pt = pickle.load(f)

with open('similarity_score.pkl', 'rb') as f:
    similarity_score = pickle.load(f)

def similarity(book_name):
    #index fetch
    index = np.where(pt.index==book_name)[0][0]
    similar_items = sorted(list(enumerate(similarity_score[index])), key=lambda x:x[1], reverse=True)[1:6]

    similar_books = []
    for i in similar_items:
        similar_books.append(pt.index[i[0]])
        
    return similar_books

print(similarity("The Kitchen God's Wife"))
