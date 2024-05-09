interface ProductType {
  brand: string;
  category: string;
  color: string;
  discount: null | string;
  gender: string;
  sizes?: string;
  id: number;
  image_url: string;
  name: string;
  price: string;
  rating: string;
  warranty: string;
  is_favorited: boolean;
}

interface User {
  id: number;
  username: string;
  email: string;
}

interface Review {
  id: number;
  user_name: string;
  user_id: string;
  review_text: string;
  rating: string;
  created_at: string;
}
