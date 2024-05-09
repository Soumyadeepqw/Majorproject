import random
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.models import User
from .models import CartItem, Favorite, Product, Review
from .serializers import (
    CartItemSerializer,
    ProductSerializer,
    ProductFavSerializer,
    FavoriteSerializer,
    ReviewSerializer,
)
from rest_framework.status import HTTP_404_NOT_FOUND

# Create your views here.
import pandas as pd
from .models import Product
import numpy as np


import re
import nltk
from nltk.tokenize import word_tokenize
from nltk.tag import pos_tag
from nltk.corpus import wordnet
from nltk.stem import WordNetLemmatizer
from string import punctuation
import spacy
from SPARQLWrapper import SPARQLWrapper2, JSON
import pandas as pd
from tabulate import tabulate


nltk.download("punkt")
nltk.download("averaged_perceptron_tagger")
nltk.download("maxent_ne_chunker")
nltk.download("words")
nltk.download("wordnet")
nlp_spacy = spacy.load("en_core_web_sm")


def import_excel_data():
    df = pd.read_excel("./project_s_products.xlsx")
    for index, row in df.iterrows():
        discount = row["discount"]
        if pd.isnull(discount) or discount == "nan":
            discount = None
        product = Product(
            name=row["name"],
            brand=row["brand"],
            price=row["price"],
            rating=row["rating"],
            discount=discount,
            image_url=row["image_url"],
            color=row["color"],
            gender=row["gender"],
            category=row["category"],
            tags=row["tags"],
            sizes=row["sizes"],
            warranty=row["warranty"]
        )
        product.save()


@api_view(["POST"])
def PRODUCTS(request):
    category = request.data["cat"]
    user_id = request.data["userId"]
    # print(type(category))
    if category:
        products = Product.objects.filter(category=category)  # Filter by category
    else:
        products = Product.objects.all()

    if user_id == "undefined":
        serializer = ProductSerializer(products, many=True)
    else:
        serializer = ProductFavSerializer(
            products, context={"user_id": int(user_id)}, many=True
        )

    return Response(serializer.data)


@api_view(["POST"])
def product_by_id(request):
    product_id = request.data["productId"]
    user_id = request.data["userId"]

    # if product_id is None:
    #     return Response({'error': 'Missing product_id query parameter'}, status=400)

    try:
        product = Product.objects.get(pk=product_id)
    except Product.DoesNotExist:
        return Response({"error": "Product not found"}, status=HTTP_404_NOT_FOUND)
    if user_id == "undefined":
        serializer = ProductSerializer(product)
    else:
        serializer = ProductFavSerializer(product, context={"user_id": int(user_id)})
    return Response(serializer.data)


categories = ["hoodies", "games", "toys", "gadgets", "mobiles"]


# popular
@api_view(["POST"])
def home_products(request):
    # user_id = request.META.get('HTTP_USER_ID')
    user_id = request.data

    # print(dict(request.META))
    # print("user_id", request.data)
    products = []
    for category in categories:
        limited_products = Product.objects.filter(category=category)[
            :3
        ]  # Filter and limit to 2
        products.extend(limited_products)  # Append limited products for each category
    if user_id == "undefined":
        serializer = ProductSerializer(products, many=True)
    else:
        serializer = ProductFavSerializer(
            products, context={"user_id": int(user_id)}, many=True
        )

    return Response(serializer.data)


# carousals
@api_view(["GET"])
def hero_products(request):
    products = []
    for category in categories:
        all_products = Product.objects.filter(category=category)
        limited_products = random.sample(
            list(all_products), 2
        )  # Randomly sample 2 products
        products.extend(limited_products)
    serializer = ProductFavSerializer(products, context={"user_id": 1}, many=True)
    return Response(serializer.data)


@api_view(["POST"])
def new_products(request):
    user_id = request.data

    products = []
    for category in categories:
        limited_products = Product.objects.filter(category=category).order_by("-id")[
            :2
        ]  # Order by descending ID and slice last 2
        products.extend(limited_products)
    if user_id == "undefined":
        serializer = ProductSerializer(products, many=True)
    else:
        serializer = ProductFavSerializer(
            products, context={"user_id": int(user_id)}, many=True
        )

    return Response(serializer.data)


# nlp -----------------------------

questions = [
    "Show me the top rated ea game.",
    "Find Hoodie in Black color.",
    "Find brand comefohome in Hoodies in size M",
    "Can I see television sorted by customer review?",
    "Show me Hoodie with a discount of at least 30%.",
    "Can you recommend televisions under Price $800",
    "Find Refrigarator with a warranty of at least one year",
]

class_keywords = {
    "Hoodie": "Hoodie",
    "hoodies": "Hoodie",
    "hoodie": "Hoodie",
    "Jumpers": "Hoodie",
    "jumpers": "Hoodie",
    "Jumpers": "Hoodie",
    "jumpers": "Hoodie",
    "Jumper": "Hoodie",
    "jumper": "Hoodie",
    "Game": "Game",
    "games": "Game",
    "game": "Game",
    "Refrigerator": "Refrigerator",
    "refrigarators": "Refrigerator",
    "refrigarator": "Refrigerator",
    'Toy': 'Toys',
    'Toys': 'Toys',
    'toys': 'Toys',
    'toy': 'Toys',
    'smartphone': 'SmartPhones',
    'smartphones': 'SmartPhones',
    'mobilephones': 'SmartPhones',
    'MobilePhones': 'SmartPhones',
    'phone': 'SmartPhones',
    'mobile': 'SmartPhones',
    'television': 'Television',
    'Television': 'Television',
    'tv': 'Television',
    'TV': 'Television'
}

object_property_keywords = {
    "Price": "hasPrice",
    "price": "hasPrice",
    "Discount": "appliesDiscount",
    "discount": "appliesDiscount",
    "Rating": "hasRatings",
    "rating": "hasRatings",
    "Review": "hasRatings",
    "review": "hasRatings",
    "Rated": "hasRatings",
    "rated": "hasRatings",
    "Color": "hasColor",
    "color": "hasColor",
    "Size": "hasSize",
    "size": "hasSize",
    "Brand": "hasBrand",
    "brand": "hasBrand",
    "Warranty": "hasWarranty",
    "warranty": "hasWarranty",
}

data_property_keywords = {
    "Price": "cost",
    "price": "cost",
    "Discount": "discountVal",
    "discount": "discountVal",
    "Rating": "Ratings_Value",
    "rating": "Ratings_Value",
    "Review": "Ratings_Value",
    "review": "Ratings_Value",
    "Rated": "Ratings",
    "ated": "Ratings",
    "Color": "colorType",
    "color": "colorType",
    "Size": "sizechart",
    "size": "sizechart",
    "Brand": "brandName",
    "brand": "brandName",
    "Warranty": "WarrantyTime",
    "warranty": "WarrantyTime",
}

# individual_keywords = {
#     "comefohome": "comefohome",
#     "30": "30",
#     "40": "40",
#     "50": "50",
#     "One": "One",
#     "one": "One",
#     "ONE": "One",
#     "Black": "Black",
# }
individual_keywords = {
    'comefohome': 'comefohome',
    'HOOD CREW' : 'HOOD CREW',
    'HOOD CREW' : 'hood crew',
    '10': '10',
    '20': '20',
    '30': '30',
    '40': '40',
    '50': '50',
    '80': '80',
    '60': '60',
    '70': '70',
    '100': '100',
    '200': '200',
    '300': '300',
    '150': '150',
    '140': '140',
    '500': '500',
    '600': '600',
    '700': '700',
    '450': '450',
    '400': '400',
    '800': '800',
    '1000': '1000',
    'One': 'One',
    'one': 'One',
    'ONE': 'One',
    'TW0': 'Two',
    'Two': 'Two',
    'two': 'Two',
    'three': 'Three',
    'Three': 'Three',
    'four': 'Four',
    'Four': 'four',
    'Black': 'black',
    'BLACK': 'black',
    'White': 'white',
    'WHITE': 'white',
    'Blue': 'blue',
    'blue': 'blue',
    'BLUE': 'blue',
    'Grey': 'grey',
    'grey': 'grey',
    'GREY': 'grey',
    'Lightgrey': 'lightgrey',
    'lightgrey': 'lightgrey'
}


def normalize_and_tokenize(question):
    # Normalize and tokenize the text
    text = question.lower()
    custom_punctuation = punctuation + "“”’‘" + "(){}[]<>"
    text = re.sub(f"[{re.escape(custom_punctuation)}]", "", text)
    return word_tokenize(text)


def pos_tagging(tokens):
    tagged_tokens = pos_tag(tokens)
    return tagged_tokens


def map_to_ontology(
    tagged_tokens, class_keywords, object_property_keywords, data_property_keywords
):
    lemmatizer = WordNetLemmatizer()
    classes = []
    object_properties = []
    data_properties = []
    for word, tag in tagged_tokens:
        word_lemmatized = lemmatizer.lemmatize(word)

        if word_lemmatized in class_keywords:
            classes.append(class_keywords[word_lemmatized])

        if word_lemmatized in object_property_keywords:
            object_properties.append(object_property_keywords[word_lemmatized])
        else:
            # Check if the word is a partial match for an object property keyword
            for keyword, mapping in object_property_keywords.items():
                if keyword in word_lemmatized:
                    object_properties.append(mapping)
                    break

        if word_lemmatized in data_property_keywords:
            data_properties.append(data_property_keywords[word_lemmatized])
        else:
            # Check if the word is a partial match for a data property keyword
            for keyword, mapping in data_property_keywords.items():
                if keyword in word_lemmatized:
                    data_properties.append(mapping)
                    break

    return classes, object_properties, data_properties


# def individuals_using_spacy(question, individual_keywords):
#     doc = nlp_spacy(question)
#     individuals = {}

#     for token in doc:
#         # Check for specific keywords like "comefohome", "30", and "One"
#         if token.text.lower() in individual_keywords:
#             mapped_key = individual_keywords[token.text.lower()]
#             individuals[mapped_key] = token.ent_type_

#         # Additional checks for special cases
#         if token.text.lower() == "black":
#             individuals["Black"] = "COLOR"
#         elif token.text.lower() == "comefohome":
#             individuals["comefohome"] = "BRAND"
#         elif token.text.lower() == "m":
#             individuals["M"] = "SIZE"

#     return individuals
def individuals_using_spacy(question, individual_keywords):
    doc = nlp_spacy(question)
    individuals = {}
    color_mappings = {
        'black': 'Black',
        'grey': 'Grey',
        'white': 'White',
        'lightgray': 'Lightgray',
        'blue':'Blue'
    }
    size_mappings = {
        'M': 'M',
        'm': 'M',
        'L': 'L',
        'l': 'L',
        'xs': 'xs',
        'xl': 'XL',
        '2xl': '2XL',
        '3xl': '3XL'
    }
    hoodie_mappings = {
        'comefohome': 'comefohome',
        'Comefohome': 'comefohome',
        'puma': 'PUMA',
        'Puma': 'PUMA',
        'hood crew': 'HOOD CREW'
    }
    mobile_mappings = {
        'Samsung': 'Samsung',
        'samsung': 'Samsung',
        'SAMSUNG': 'Samsung',
        'Honor': 'Honor',
        'HONOR': 'Honor',
        'honor': 'Honor',
        'Xiomi': 'Xiomi',
        'Xiaomi': 'Xiomi',
        'XIOMI': 'Xiomi',
        'XIAOMI': 'Xiomi',
        'UMIDIGI': 'UMIDIGI',
        'Umidigi': 'UMIDIGI',
        'umidigi': 'UMIDIGI'
    }
    television_mappings = {
        'Samsung': 'Samsung',
        'samsung': 'Samsung',
        'SAMSUNG': 'Samsung',
        'rca': 'RCA',
        'RCA': 'RCA',
        'Rca': 'RCA',
        'tcl': 'TCL',
        'TCL': 'TCL',
        'Tcl': 'TCL',
        'lg': 'LG',
        'LG': 'LG'
    }
    gender_mappings = {
        'male': 'male',
        'MALE': 'male',
        'Male': 'male',
        'female': 'female',
        'FEMALE': 'female',
        'Female': 'female'
    }
    game_version_mappings = {
        'Microsoft': 'Microsoft',
        'MICROSOFT': 'Microsoft',
        'microsoft': 'Microsoft',
        'EA': 'EA',
        'ea': 'EA',
        'SEGA': 'SEGA',
        'sega': 'SEGA',
        'Sega': 'SEGA',
        'PLAYSTATION': 'PlayStation',
        'playstation': 'PlayStation'
    }
    for token in doc:
        key = token.text.lower()
        # Check for specific keywords like "comefohome", "30", and "One"
        if token.text.lower() in individual_keywords:
            mapped_key = individual_keywords[token.text.lower()]
            individuals[token.ent_type_] = mapped_key
        
        # Additional checks for special cases
        if key in color_mappings:
            individuals["COLOR"] = color_mappings[key]
        elif key in size_mappings:
            individuals["SIZE"] = size_mappings[key]
        elif key in hoodie_mappings:
            individuals["BRAND"] = hoodie_mappings[key]
        elif key in mobile_mappings:
            individuals["BRAND"] = mobile_mappings[key]
        elif key in television_mappings:
            individuals["BRAND"] = television_mappings[key]
        elif key in gender_mappings:
            individuals["GENDER"] = gender_mappings[key]
        elif key in game_version_mappings:
            individuals["GAMEVERSION"] = game_version_mappings[key]
    return individuals

for question in questions:
    tokens = normalize_and_tokenize(question)
    tagged_tokens = pos_tagging(tokens)
    classes, object_properties, data_properties = map_to_ontology(
        tagged_tokens, class_keywords, object_property_keywords, data_property_keywords
    )
    individuals = individuals_using_spacy(question, individual_keywords)
    # print(f"Question: {question}")
    # print(f"Generated tokens: {tokens}\n")
    # print(f"POS Tagging: {tagged_tokens}\n")
    # print(f"Extracted Classes: {classes}")
    # print(f"Extracted object Properties: {object_properties}\n")
    # print(f"Extracted data Properties: {data_properties}\n")
    # print(f"Extracted Individuals: {individuals}\n")





for question in questions:
    tokens = normalize_and_tokenize(question)
    tagged_tokens = pos_tagging(tokens)
    classes, object_properties, data_properties = map_to_ontology(
        tagged_tokens, class_keywords, object_property_keywords, data_property_keywords
    )
    individuals = individuals_using_spacy(question, individual_keywords)
    # print(f"Question: {question}")
    # print(f"Generated tokens: {tokens}\n")
    # print(f"POS Tagging: {tagged_tokens}\n")
    # print(f"Extracted Classes: {classes}")
    # print(f"Extracted object Properties: {object_properties}\n")
    # print(f"Extracted data Properties: {data_properties}\n")
    # print(f"Extracted Individuals: {individuals}\n")

def construct_query(question):
    query_prefix = "PREFIX Product: <http://www.semanticweb.org/changan/ontologies/2024/2/Ecommerce#>\n\n"
    # Assuming these are defined elsewhere
    individuals = individuals_using_spacy(question, individual_keywords)
    tokens = normalize_and_tokenize(question)
    tagged_tokens = pos_tagging(tokens)
    classes, object_properties, data_properties = map_to_ontology(tagged_tokens, class_keywords, object_property_keywords, data_property_keywords)
    
    # Default query clauses
    select_clause = ""
    where_clause = "WHERE {\n"
    filter_clause = ""
    order_by_clause = ""
    limit_clause = ""

    for cls in classes:
        if cls == 'Hoodie':
            select_clause = "SELECT ?hoodie ?imageURL ?name ?Brand ?price ?ratings"
            where_clause += (
                "  ?hoodie a Product:Hoodies .\n"
                "  ?hoodie Product:imageURL ?imageURL .\n"
                "  ?hoodie Product:hoodietype ?name .\n"
                "  ?hoodie Product:hasBrand ?BrandNode.\n"
                "  ?BrandNode Product:brandName ?Brand .\n"
                "  ?hoodie Product:hasPrice ?priceNode .\n"
                "  ?priceNode Product:cost ?price .\n"
            )
        elif cls == 'Game':
            select_clause += "SELECT ?game ?imageURL ?name ?price ?ratings ?gameversion"
            where_clause += (
                "  ?game a Product:Games .\n"
                "  ?game Product:imageURL ?imageURL .\n"
                "  ?game Product:GameTitle ?name .\n"
                 "  ?game Product:GameVersion ?gameversion .\n"
                "  ?game Product:hasPrice ?priceNode .\n"
                "  ?priceNode Product:cost ?price .\n"
            )
        elif cls == 'Refrigerator':
            select_clause += "SELECT ?refrigerator ?imageURL ?name ?Brand ?price ?warranty ?discount ?ratings"
            where_clause += (
                "?refrigerator a Product:Refrigarator . \n"
                "?refrigerator Product:imageURL ?imageURL . \n"
                "?refrigerator Product:refrigarator_name ?name . \n"
                "?refrigerator Product:hasBrand ?BrandNode. \n"
                "?BrandNode Product:brandName ?Brand . \n"
                "  ?refrigarator Product:hasPrice ?priceNode .\n"
                "  ?priceNode Product:cost ?price .\n"
            )
        elif cls == 'Toys':
            select_clause += "SELECT ?toy ?imageURL ?name ?price ?discount ?ratings"
            where_clause += (
                "?toy a Product:Toys . \n"
                "?toy Product:imageURL ?imageURL . \n"
                "?toy Product:toys_name ?name . \n"
                "  ?toy Product:hasPrice ?priceNode .\n"
                "  ?priceNode Product:cost ?price .\n"
            )
        elif cls == 'SmartPhones':
            select_clause += "SELECT ?phone ?imageURL ?name ?Brand ?price ?warranty ?discount ?ratings"
            where_clause += (
                "?phone a Product:SmartPhones . \n"
                "?phone Product:imageURL ?imageURL . \n"
                "?phone Product:mobile_phone_name ?name . \n"
                "?phone Product:hasBrand ?BrandNode. \n"
                "?BrandNode Product:brandName ?Brand . \n"
                "  ?phone Product:hasPrice ?priceNode .\n"
                "  ?priceNode Product:cost ?price .\n"
            )
        elif cls == 'Television':
            select_clause += "SELECT ?television ?imageURL ?name ?Brand ?price ?warranty ?discount ?ratings"
            where_clause += (
                "?television a Product:Television . \n"
                "?television Product:imageURL ?imageURL . \n"
                "?television Product:television_name ?name . \n"
                "?television Product:hasBrand ?BrandNode. \n"
                "?BrandNode Product:brandName ?Brand . \n"
                "  ?television Product:hasPrice ?priceNode .\n"
                "  ?priceNode Product:cost ?price .\n"
            )
    if 'Game' in classes:
        price_limit = individuals.get('MONEY', None)  
        game_version = individuals.get('GAMEVERSION', None)  
        filter_clauses = []
        if 'top rated' in question:
            if game_version:
                where_clause += (
                "  ?game Product:hasRatings ?ratingsNode .\n"
                "  ?ratingsNode Product:Ratings_Value ?ratings .\n"
                )
                order_by_clause = "ORDER BY DESC(?ratings)\n"
                limit_clause = "LIMIT 1\n"
            else:
                where_clause += (
                "  ?game Product:hasRatings ?ratingsNode .\n"
                "  ?ratingsNode Product:Ratings_Value ?ratings .\n}"
                )
                order_by_clause = "ORDER BY DESC(?ratings)\n"
                limit_clause = "LIMIT 1\n"
        if 'cheap' in question:
            if game_version:
                order_by_clause = "ORDER BY ASC(?price)\n"
                limit_clause = "LIMIT 1\n"
            else:
                order_by_clause = "}ORDER BY ASC(?price)\n"
                limit_clause = "LIMIT 1\n"
        if 'expensive' in question:
            if game_version:
                order_by_clause = "ORDER BY DESC(?price)\n"
                limit_clause = "LIMIT 1\n"
            else:
                order_by_clause = "}ORDER BY DESC(?price)\n"
                limit_clause = "LIMIT 1\n"
        if 'review' in question:
            if game_version:
                where_clause += (
                "  ?game Product:hasRatings ?ratingsNode .\n"
                "  ?ratingsNode Product:Ratings_Value ?ratings .\n"
                )
                order_by_clause = "ORDER BY DESC(?ratings)\n"
                limit_clause = "LIMIT 20\n"
            else:
                where_clause += (
                "  ?game Product:hasRatings ?ratingsNode .\n"
                "  ?ratingsNode Product:Ratings_Value ?ratings .\n}"
                )
                order_by_clause = "ORDER BY DESC(?ratings)\n"
                limit_clause = "LIMIT 20\n"
        if price_limit:
            where_clause += "  ?game Product:hasPrice ?priceNode .\n  ?priceNode Product:cost ?price .\n"
        if price_limit:
            filter_clauses.append(f"?price < \"{price_limit}\"")
        if game_version:
            filter_clauses.append(f"?gameversion = \"{game_version}\"")
        if filter_clauses:
            filter_clause = "FILTER(" + " && ".join(filter_clauses) + ")}\n"  
    elif 'Hoodie' in classes:
        
        color = individuals.get('COLOR', '').lower() if 'COLOR' in individuals else None
        size = individuals.get('SIZE', '').upper() if 'SIZE' in individuals else None
        price_limit = individuals.get('MONEY', None)  
        percent = individuals.get('PERCENT', None)  
        brand = individuals.get('BRAND', '').upper() if 'BRAND' in individuals else None
        gender = individuals.get('GENDER', '').lower() if 'GENDER' in individuals else None
        if 'top rated' in question:
            where_clause += (
            "  ?hoodie Product:hasRatings ?ratingsNode .\n"
            "  ?ratingsNode Product:Ratings_Value ?ratings .\n"
            )
            if percent:
                filter_clause= []
                filter_clause.append(f"?discount > {percent} && ?discount != 0")
                order_by_clause = "ORDER BY DESC(?ratings)\n"
                limit_clause = "LIMIT 1\n"
                
            elif gender:
                filter_clause= []
                filter_clause.append(f"?gender = \"{gender}\"")
                order_by_clause = "ORDER BY DESC(?ratings)\n"
                limit_clause = "LIMIT 1\n"
            else:
                order_by_clause = "}ORDER BY DESC(?ratings)\n"
                limit_clause = "LIMIT 1\n"
        if 'review' in question:
            where_clause += (
            "  ?hoodie Product:hasRatings ?ratingsNode .\n"
            "  ?ratingsNode Product:Ratings_Value ?ratings .\n"
            )
            if gender:
                filter_clause= []
                filter_clause.append(f"?gender = \"{gender}\"")
                order_by_clause = "ORDER BY DESC(?ratings)\n"
                limit_clause = "LIMIT 20\n"
            else:
                order_by_clause = "}ORDER BY DESC(?ratings)\n"
                limit_clause = "LIMIT 20\n"
        if 'expensive' in question:
            if percent:
                filter_clause= []
                filter_clause.append(f"?discount > {percent} && ?discount != 0")
                order_by_clause = "ORDER BY DESC(?price)\n"
                limit_clause = "LIMIT 1\n"
                
            elif gender:
                filter_clause= []
                filter_clause.append(f"?gender = \"{gender}\"")
                order_by_clause = "ORDER BY DESC(?price)\n"
                limit_clause = "LIMIT 1\n"
            else:
                order_by_clause = "}ORDER BY DESC(?price)\n"
                limit_clause = "LIMIT 1\n"
        if 'cheap' in question:
            if percent:
                filter_clause= []
                filter_clause.append(f"?discount > {percent} && ?discount != 0")
                order_by_clause = "ORDER BY ASC(?price)\n"
                limit_clause = "LIMIT 1\n"
                
            if gender:
                filter_clause= []
                filter_clause.append(f"?gender = \"{gender}\"")
                order_by_clause = "ORDER BY ASC(?price)\n"
                limit_clause = "LIMIT 1\n"
            else:
                order_by_clause = "}ORDER BY ASC(?price)\n"
                limit_clause = "LIMIT 1\n"
        if gender:
            where_clause += "  ?hoodie Product:isDesignedFor ?genderNode .\n  ?genderNode Product:GenderType ?gender .\n"
        if color:
            where_clause += "  ?hoodie Product:hasColor ?colorNode .\n  ?colorNode Product:colorType ?color .\n"
        if size:
            where_clause += "  ?hoodie Product:requiresSize ?sizeNode .\n  ?sizeNode Product:sizechart ?size .\n"
        if price_limit:
            where_clause += "  ?hoodie Product:hasPrice ?priceNode .\n  ?priceNode Product:cost ?price .\n"
        if percent:
            where_clause += "  ?hoodie Product:appliesDiscount ?discountNode .\n  ?discountNode Product:discountVal ?discount .\n"
        filter_clauses = []
        if color:
            filter_clauses.append(f"?color = \"{color}\"")
        if size:
            filter_clauses.append(f"?size = \"{size}\"")
        if price_limit:
            filter_clauses.append(f"?price < \"{price_limit}\"")
        if percent:
            filter_clauses.append(f"?discount > {percent} && ?discount != 0")
        if brand:
            filter_clauses.append(f"?Brand = \"{brand}\"")
        if gender:
            filter_clauses.append(f"?gender = \"{gender}\"")
        if filter_clauses:
            filter_clause = "FILTER(" + " && ".join(filter_clauses) + ")}\n"
    elif 'Refrigerator' in classes:
        price_limit = individuals.get('MONEY', None)  
        percent = individuals.get('PERCENT', None)  
        date = individuals.get('DATE', None)  
        brand = brand = individuals.get('BRAND', '') if 'BRAND' in individuals else None
        filter_clauses = []
        
        if 'top rated' in question:
            
                
                
            if brand:
                
                order_by_clause = "ORDER BY DESC(?price)\n"
                limit_clause = "LIMIT 1\n"
            else:
                
                
                where_clause += (
                "  ?refrigerator Product:hasRatings ?ratingsNode .\n"
                "  ?ratingsNode Product:Ratings_Value ?ratings .\n"
                )
                order_by_clause = "}ORDER BY DESC(?ratings)\n"
                limit_clause = "LIMIT 1\n"
        if 'review' in question:
            if brand:
                order_by_clause = "ORDER BY DESC(?review)\n"
                limit_clause = "LIMIT 20\n"
            else:
                where_clause += (
                "  ?refrigerator Product:hasRatings ?ratingsNode .\n"
                "  ?ratingsNode Product:Ratings_Value ?ratings .\n"
                )
                order_by_clause = "}ORDER BY DESC(?ratings)\n"
                limit_clause = "LIMIT 20\n"
        if 'expensive' in question:
            if brand:
                if percent:
                
                    
                    filter_clause= []
                    if filter_clauses:
                        filter_clause = "FILTER(" + " && ".join(filter_clauses) + ")\n"
                    order_by_clause = "ORDER BY DESC(?price)\n"
                    limit_clause = "LIMIT 1\n"
                else:
                    order_by_clause = "ORDER BY DESC(?price)\n"
                    limit_clause = "LIMIT 1\n"
            elif percent:
                where_clause += (
                "?refrigerator Product:hasPrice ?priceNode . \n"
                "?priceNode Product:cost ?price . \n"
                "?refrigerator Product:appliesDiscount ?discountNode .\n"
                "?discountNode Product:discountVal ?discount . \n"
                )
                filter_clause= []
                filter_clause.append(f"?discount > {percent} && ?discount != 0")
                order_by_clause = "ORDER BY DESC(?price)\n"
                limit_clause = "LIMIT 1\n"
            else:
                where_clause += (
                "?refrigerator Product:hasPrice ?priceNode . \n"
                "?priceNode Product:cost ?price . \n"
                
                )
                order_by_clause = "}ORDER BY DESC(?price)\n"
                limit_clause = "LIMIT 1\n"
        if 'cheap' in question:
            if brand:
                if percent:
                
                    
                    filter_clause= []
                    if filter_clauses:
                        filter_clause = "FILTER(" + " && ".join(filter_clauses) + ")\n"
                    order_by_clause = "ORDER BY ASC(?price)\n"
                    limit_clause = "LIMIT 1\n"
                else:
                    order_by_clause = "ORDER BY ASC(?price)\n"
                    limit_clause = "LIMIT 1\n"
            elif percent:
                where_clause += (
                "?refrigerator Product:hasPrice ?priceNode . \n"
                "?priceNode Product:cost ?price . \n"
                "?refrigerator Product:appliesDiscount ?discountNode .\n"
                "?discountNode Product:discountVal ?discount . \n"
                )
                filter_clause= []
                filter_clause.append(f"?discount > {percent} && ?discount != 0")
                order_by_clause = "ORDER BY ASC(?price)\n"
                limit_clause = "LIMIT 1\n"
            else:
                where_clause += (
                "?refrigerator Product:hasPrice ?priceNode . \n"
                "?priceNode Product:cost ?price . \n"
                
                )
                order_by_clause = "}ORDER BY ASC(?price)\n"
                limit_clause = "LIMIT 1\n"
            
               
        if price_limit:
            where_clause += " ?refrigerator Product:hasPrice ?priceNode . \n ?priceNode Product:cost ?price . \n"
        if percent:
            where_clause += " ?refrigerator Product:appliesDiscount ?discountNode .\n ?discountNode Product:discountVal ?discount . \n"
        if date:
            where_clause += " ?refrigerator Product:hasWarranty ?warrantyNode .\n ?warrantyNode Product:WarrantyTime ?warranty .\n"
        if price_limit:
            filter_clauses.append(f"?price < {price_limit}")
        if percent:
            filter_clauses.append(f"?discount > {percent} && ?discount != 0")
        if date:
            filter_clauses.append(f"?warranty = \"{date}\"")
        if filter_clauses:
            filter_clause = "FILTER(" + " && ".join(filter_clauses) + ")}\n"
    elif 'SmartPhones' in classes:
        price_limit = individuals.get('MONEY', None)  
        percent = individuals.get('PERCENT', None)  
        date = individuals.get('DATE', None)  
        brand = individuals.get('BRAND', '') if 'BRAND' in individuals else None
        filter_clauses = []
        if 'top rated' in question:
            if brand:
                order_by_clause = "ORDER BY DESC(?price)\n"
                limit_clause = "LIMIT 1\n"
            else:
                
                where_clause += (
                "  ?phone Product:hasRatings ?ratingsNode .\n"
                "  ?ratingsNode Product:Ratings_Value ?ratings .\n"
                )
                order_by_clause = "}ORDER BY DESC(?ratings)\n"
                limit_clause = "LIMIT 1\n"
        if 'review' in question:
            if brand:
                order_by_clause = "ORDER BY DESC(?review)\n"
                limit_clause = "LIMIT 20\n"
            else:
                where_clause += (
                "  ?phone Product:hasRatings ?ratingsNode .\n"
                "  ?ratingsNode Product:Ratings_Value ?ratings .\n"
                )
                order_by_clause = "}ORDER BY DESC(?ratings)\n"
                limit_clause = "LIMIT 20\n"
        if 'expensive' in question:
            if brand:
                if percent:
                
                    
                    filter_clause= []
                    if filter_clauses:
                        filter_clause = "FILTER(" + " && ".join(filter_clauses) + ")\n"
                    order_by_clause = "ORDER BY DESC(?price)\n"
                    limit_clause = "LIMIT 1\n"
                else:
                    order_by_clause = "ORDER BY DESC(?price)\n"
                    limit_clause = "LIMIT 1\n"
            elif percent:
                where_clause += (
                "?phone Product:hasPrice ?priceNode . \n"
                "?priceNode Product:cost ?price . \n"
                "?phone Product:appliesDiscount ?discountNode .\n"
                "?discountNode Product:discountVal ?discount . \n"
                )
                filter_clause= []
                filter_clause.append(f"?discount > {percent} && ?discount != 0")
                order_by_clause = "ORDER BY DESC(?price)\n"
                limit_clause = "LIMIT 1\n"
            else:
                where_clause += (
                "?phone Product:hasPrice ?priceNode . \n"
                "?priceNode Product:cost ?price . \n"
                
                )
                order_by_clause = "}ORDER BY DESC(?price)\n"
                limit_clause = "LIMIT 1\n"
        if 'cheap' in question:
            if brand:
                if percent:
                
                    
                    filter_clause= []
                    if filter_clauses:
                        filter_clause = "FILTER(" + " && ".join(filter_clauses) + ")\n"
                    order_by_clause = "ORDER BY ASC(?price)\n"
                    limit_clause = "LIMIT 1\n"
                else:
                    order_by_clause = "ORDER BY ASC(?price)\n"
                    limit_clause = "LIMIT 1\n"
            elif percent:
                where_clause += (
                "?phone Product:hasPrice ?priceNode . \n"
                "?priceNode Product:cost ?price . \n"
                "?phone Product:appliesDiscount ?discountNode .\n"
                "?discountNode Product:discountVal ?discount . \n"
                )
                filter_clause= []
                filter_clause.append(f"?discount > {percent} && ?discount != 0")
                order_by_clause = "ORDER BY ASC(?price)\n"
                limit_clause = "LIMIT 1\n"
            else:
                where_clause += (
                "?phone Product:hasPrice ?priceNode . \n"
                "?priceNode Product:cost ?price . \n"
                
                )
                order_by_clause = "}ORDER BY ASC(?price)\n"
                limit_clause = "LIMIT 1\n"
            
               
        if price_limit:
            where_clause += " ?phone Product:hasPrice ?priceNode . \n ?priceNode Product:cost ?price . \n"
        if percent:
            where_clause += " ?phone Product:appliesDiscount ?discountNode .\n ?discountNode Product:discountVal ?discount . \n"
        if date:
            where_clause += " ?phone Product:hasWarranty ?warrantyNode .\n ?warrantyNode Product:WarrantyTime ?warranty .\n"
        if price_limit:
            filter_clauses.append(f"?price < {price_limit} ")
        if percent:
            filter_clauses.append(f"?discount > {percent} && ?discount != 0")
        if brand:
            filter_clauses.append(f"?Brand = \"{brand}\"")
        if date:
            filter_clauses.append(f"?warranty = \"{date}\"")
        if filter_clauses:
            filter_clause = "FILTER(" + " && ".join(filter_clauses) + ")}\n"
    elif 'Television' in classes:
        price_limit = individuals.get('MONEY', None)  
        percent = individuals.get('PERCENT', None)  
        date = individuals.get('DATE', None)  
        brand = individuals.get('BRAND', '') if 'BRAND' in individuals else None
        filter_clauses = []
        if 'top rated' in question:
            if brand:
                order_by_clause = "ORDER BY DESC(?price)\n"
                limit_clause = "LIMIT 1\n"
            else:
                
                where_clause += (
                "  ?phone Product:hasRatings ?ratingsNode .\n"
                "  ?ratingsNode Product:Ratings_Value ?ratings .\n"
                )
                order_by_clause = "}ORDER BY DESC(?ratings)\n"
                limit_clause = "LIMIT 1\n"
        if 'review' in question:
            if brand:
                order_by_clause = "ORDER BY DESC(?review)\n"
                limit_clause = "LIMIT 20\n"
            else:
                where_clause += (
                "  ?phone Product:hasRatings ?ratingsNode .\n"
                "  ?ratingsNode Product:Ratings_Value ?ratings .\n"
                )
                order_by_clause = "}ORDER BY DESC(?ratings)\n"
                limit_clause = "LIMIT 20\n"
        if 'expensive' in question:
            if brand:
                if percent:
                
                    
                    filter_clause= []
                    if filter_clauses:
                        filter_clause = "FILTER(" + " && ".join(filter_clauses) + ")\n"
                    order_by_clause = "ORDER BY DESC(?price)\n"
                    limit_clause = "LIMIT 1\n"
                else:
                    order_by_clause = "ORDER BY DESC(?price)\n"
                    limit_clause = "LIMIT 1\n"
            elif percent:
                where_clause += (
                "?television Product:hasPrice ?priceNode . \n"
                "?priceNode Product:cost ?price . \n"
                "?television Product:appliesDiscount ?discountNode .\n"
                "?discountNode Product:discountVal ?discount . \n"
                )
                filter_clause= []
                filter_clause.append(f"?discount > {percent} && ?discount != 0")
                order_by_clause = "ORDER BY DESC(?price)\n"
                limit_clause = "LIMIT 1\n"
            else:
                where_clause += (
                "?television Product:hasPrice ?priceNode . \n"
                "?priceNode Product:cost ?price . \n"
                
                )
                order_by_clause = "}ORDER BY DESC(?price)\n"
                limit_clause = "LIMIT 1\n"
        if 'cheap' in question:
            if brand:
                if percent:
                
                    
                    filter_clause= []
                    if filter_clauses:
                        filter_clause = "FILTER(" + " && ".join(filter_clauses) + ")\n"
                    order_by_clause = "ORDER BY ASC(?price)\n"
                    limit_clause = "LIMIT 1\n"
                else:
                    order_by_clause = "ORDER BY ASC(?price)\n"
                    limit_clause = "LIMIT 1\n"
            elif percent:
                where_clause += (
                "?television Product:hasPrice ?priceNode . \n"
                "?priceNode Product:cost ?price . \n"
                "?television Product:appliesDiscount ?discountNode .\n"
                "?discountNode Product:discountVal ?discount . \n"
                )
                filter_clause= []
                filter_clause.append(f"?discount > {percent} && ?discount != 0")
                order_by_clause = "ORDER BY ASC(?price)\n"
                limit_clause = "LIMIT 1\n"
            else:
                where_clause += (
                "?television Product:hasPrice ?priceNode . \n"
                "?priceNode Product:cost ?price . \n"
                
                )
                order_by_clause = "}ORDER BY ASC(?price)\n"
                limit_clause = "LIMIT 1\n"
            
               
        if price_limit:
            where_clause += " ?television Product:hasPrice ?priceNode . \n ?priceNode Product:cost ?price . \n"
        if percent:
            where_clause += " ?television Product:appliesDiscount ?discountNode .\n ?discountNode Product:discountVal ?discount . \n"
        if date:
            where_clause += " ?television Product:hasWarranty ?warrantyNode .\n ?warrantyNode Product:WarrantyTime ?warranty .\n"
        if price_limit:
            filter_clauses.append(f"?price < {price_limit} ")
        if percent:
            filter_clauses.append(f"?discount > {percent} && ?discount != 0")
        if brand:
            filter_clauses.append(f"?Brand = \"{brand}\"")
        if date:
            filter_clauses.append(f"?warranty = \"{date}\"")
        if filter_clauses:
            filter_clause = "FILTER(" + " && ".join(filter_clauses) + ")}\n"
    elif 'Toys' in classes:
        price_limit = individuals.get('MONEY', None)  
        percent = individuals.get('PERCENT', None)  
        filter_clauses = []
        if 'top rated' in question:
            
            where_clause += (
            "  ?toy Product:hasRatings ?ratingsNode .\n"
            "  ?ratingsNode Product:Ratings_Value ?ratings .\n"
            )
            order_by_clause = "}ORDER BY DESC(?ratings)\n"
            limit_clause = "LIMIT 1\n"
        if 'review' in question:
            where_clause += (
            "  ?toy Product:hasRatings ?ratingsNode .\n"
            "  ?ratingsNode Product:Ratings_Value ?ratings .\n"
            )
            order_by_clause = "}ORDER BY DESC(?ratings)\n"
            limit_clause = "LIMIT 20\n"
        if 'expensive' in question:
            
            if percent:
                
                where_clause += (
                "?toy Product:hasPrice ?priceNode . \n"
                "?priceNode Product:cost ?price . \n"
                
                )
                filter_clause= []
                filter_clause.append(f"?discount > {percent} && ?discount != 0")
                order_by_clause = "ORDER BY DESC(?price)\n"
                limit_clause = "LIMIT 1\n"
            else:
                
                where_clause += (
                "?toy Product:hasPrice ?priceNode . \n"
                "?priceNode Product:cost ?price . \n"
                
                )
                order_by_clause = "}ORDER BY DESC(?price)\n"
                limit_clause = "LIMIT 1\n"
        if 'cheap' in question:
            if percent:
                where_clause += (
                "?toy Product:hasPrice ?priceNode . \n"
                "?priceNode Product:cost ?price . \n"
                
                )
                filter_clause= []
                filter_clause.append(f"?discount > {percent} && ?discount != 0")
                order_by_clause = "ORDER BY ASC(?price)\n"
                limit_clause = "LIMIT 1\n"
            else:
                where_clause += (
                "?toy Product:hasPrice ?priceNode . \n"
                "?priceNode Product:cost ?price . \n"
                
                )
                order_by_clause = "}ORDER BY ASC(?price)\n"
                limit_clause = "LIMIT 1\n" 
        if price_limit:
            where_clause += " ?toy Product:hasPrice ?priceNode . \n ?priceNode Product:cost ?price . \n"
        if percent:
            where_clause += " ?toy Product:appliesDiscount ?discountNode .\n ?discountNode Product:discountVal ?discount . \n"
        if price_limit:
            filter_clauses.append(f"?price < {price_limit}")
        if percent:
            filter_clauses.append(f"?discount > {percent} && ?discount != 0")
        if filter_clauses:
            filter_clause = "FILTER(" + " && ".join(filter_clauses) + ")}\n"
    query = f"{query_prefix}{select_clause}\n{where_clause}{filter_clause}{order_by_clause}{limit_clause}"
    return query.strip()
for question in questions:
    sparql_query = construct_query(question)
    print(f"Question: {question}\nGenerated SPARQL Query:\n{sparql_query}\n")


def exec_query(query):
    sparql = SPARQLWrapper2("http://localhost:3030/Ecommerce/query")
    sparql.setReturnFormat(JSON)
    sparql.setQuery(query)

    try:
        response = sparql.query().bindings
        data = [
            {str(key): str(value.value) for key, value in result.items()}
            for result in response
        ]
        return data
    except Exception as e:
        return f"An error occurred: {str(e)}"


def run_query(question):
    sparql_query = construct_query(question)
    result = exec_query(sparql_query)
    return result



@api_view(["POST"])
def search(request):
    print(request.data)
    searchInput = request.data["searchKeyword"]
    user_id = request.data["userId"]
    results = run_query(searchInput)
    print(results)
    print(type(results))
    products = []
    if isinstance(results, list):
        for item in results:
            print("======")
            print(item)
            print(type(item))
            print("======")
            tmp = Product.objects.filter(image_url=item["imageURL"])
            products.extend(tmp)

    if len(products) == 0:
        products = Product.objects.filter(name__icontains=searchInput)

    if len(products) == 0:
        products = Product.objects.filter(brand__icontains=searchInput)

    if len(products) == 0:
        products = Product.objects.filter(category__icontains=searchInput)

    if len(products) == 0:
        products = Product.objects.filter(tags__icontains=searchInput)

    if user_id == "undefined":
        serializer = ProductSerializer(products, many=True)
    else:
        serializer = ProductFavSerializer(
            products, context={"user_id": int(user_id)}, many=True
        )
    return Response(serializer.data)


@api_view(["POST"])
def toggle_favorite(request):
    print(request.data)
    product_id = request.data["productId"]
    user_id = request.data["userId"]
    user = User.objects.get(pk=user_id)

    try:
        product = Product.objects.get(pk=product_id)
    except Product.DoesNotExist:
        return Response(
            {"error": "Product not found"}, status=status.HTTP_404_NOT_FOUND
        )

    # if favorite already exists
    exists = Favorite.objects.filter(user=user, product=product).exists()

    if exists:
        # Favorite exists, delete
        favorite = Favorite.objects.get(user=user, product=product)
        favorite.delete()
        return Response(
            {"message": "Product removed from favorites"}, status=status.HTTP_200_OK
        )
    else:
        # Favorite doesn't exist, create
        favorite = Favorite.objects.create(user=user, product=product)
        serializer = FavoriteSerializer(favorite)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(["POST"])
def favorites(request):
    user_id = request.data["userId"]
    print(user_id)
    if user_id != "undefined":
        user = User.objects.get(pk=user_id)
        favorites = Favorite.objects.filter(user=user)
        product_ids = [favorite.product.id for favorite in favorites]
        products = Product.objects.filter(pk__in=product_ids)
        serializer = ProductFavSerializer(
            products, context={"user_id": user_id}, many=True
        )
    else:
        user = None
        serializer = ProductFavSerializer(None, many=True)

    return Response(serializer.data)


@api_view(["POST"])
def cart(request):
    user_id = request.data["userId"]
    if user_id != "undefined":
        user = User.objects.get(pk=user_id)
        cart_items = CartItem.objects.filter(user=user)
        serializer = CartItemSerializer(cart_items, many=True)
    else:
        user = None
        serializer = CartItemSerializer(None, many=True)

    return Response(serializer.data)


@api_view(["POST"])
def cart_add(request):
    user_id = request.data["userId"]
    product_id = request.data["productId"]
    quantity = 1
    user = User.objects.get(pk=user_id)

    try:
        product = Product.objects.get(pk=product_id)
    except Product.DoesNotExist:
        return Response({"error": "Product not found"}, status=HTTP_404_NOT_FOUND)
    # Check if item already exists in cart
    existing_item = CartItem.objects.filter(user=user, product=product).first()
    if existing_item:
        existing_item.quantity += quantity
        existing_item.save()
        serializer = CartItemSerializer(existing_item)
        return Response(serializer.data)
    new_item = CartItem.objects.create(user=user, product=product, quantity=quantity)
    serializer = CartItemSerializer(new_item)
    return Response(serializer.data)


@api_view(["POST"])
def cart_reduce(request):
    user_id = request.data["userId"]
    product_id = request.data["productId"]
    quantity = 1
    user = User.objects.get(pk=user_id)

    try:
        product = Product.objects.get(pk=product_id)
    except Product.DoesNotExist:
        return Response({"error": "Product not found"}, status=HTTP_404_NOT_FOUND)

    # Check if item already exists in cart
    existing_item = CartItem.objects.filter(user=user, product=product).first()
    if existing_item:
        # Reduce quantity by 1 (considering negative values)
        existing_item.quantity = max(existing_item.quantity - quantity, 0)
        existing_item.save()

        # Remove item if quantity becomes zero
        if existing_item.quantity == 0:
            existing_item.delete()

        serializer = CartItemSerializer(existing_item)
        return Response(serializer.data)


@api_view(["POST"])
def cart_delete(request):
    cart_id = request.data["cartId"]
    try:
        cart_item = CartItem.objects.get(pk=cart_id)
    except CartItem.DoesNotExist:
        return Response({"error": "Cart item not found"}, status=HTTP_404_NOT_FOUND)
    cart_item.delete()
    return Response(status=204)


@api_view(["POST"])
def review_add(request):
    product_id = request.data["productId"]
    user_id = request.data["userId"]
    user = User.objects.get(pk=user_id)
    review_text = request.data["reviewText"]
    rating = request.data["rating"]

    try:
        product = Product.objects.get(pk=product_id)
    except Product.DoesNotExist:
        return Response({"error": "Product not found"}, status=404)

    if not review_text or not rating:
        return Response({"error": "Review text and rating are required"}, status=400)

    review = Review.objects.create(
        user=user, product=product, review_text=review_text, rating=rating
    )
    serializer = ReviewSerializer(review)
    return Response(serializer.data, status=201)


@api_view(["POST"])
def reviews(request):
    product_id = request.data["productId"]
    try:
        product = Product.objects.get(pk=product_id)
    except Product.DoesNotExist:
        return Response({"error": "Product not found"}, status=404)
    reviews = Review.objects.filter(product=product)
    serializer = ReviewSerializer(reviews, many=True)
    return Response(serializer.data)


@api_view(["POST"])
def review_delete(request):
    user_id = request.data["userId"]
    user = User.objects.get(pk=user_id)
    review_id = request.data["reviewId"]
    try:
        review = Review.objects.get(pk=review_id)
    except Review.DoesNotExist:
        return Response({"error": "Review not found"}, status=HTTP_404_NOT_FOUND)
    # Check permission
    if not review.user == user:
        return Response({"error": "You cannot delete this review"}, status=403)
    review.delete()
    return Response(status=204)
