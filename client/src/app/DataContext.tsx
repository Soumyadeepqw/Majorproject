import { createContext, ReactNode, useState, useEffect } from "react";
import { toast } from "react-toastify";

interface CartItem extends ProductType {
  quantity: number;
  cartId?: number;
}

type UserContextType =
  | {
      user: User | undefined;
      setUser: Function;
      cart: CartItem[];
      addToCart: (p: ProductType) => void;
      removeFromCart: (p: ProductType) => void;
      reduceQuantity: (p: ProductType) => void;
      loading: boolean;
    }
  | undefined;
const UserContext = createContext<UserContextType>(undefined);

const baseURL = process.env.NEXT_PUBLIC_SERVER_URL;

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User>();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  const addToCartServer = async (userId: number, productId: number) => {
    const res = await fetch(`${baseURL}api/cart-add`, {
      body: JSON.stringify({ userId, productId }),
      method: "POST",
      headers: { "Content-type": "application/json" },
    });
    const resData = await res.json();
    return resData.id;
    // console.log(resData.map((e:any)=>({...e.product,cartId:e.id, quantity:e.quantity})))
  };

  const reduceCartServer = async (userId: number, productId: number) => {
    const res = await fetch(`${baseURL}api/cart-reduce`, {
      body: JSON.stringify({ userId, productId }),
      method: "POST",
      headers: { "Content-type": "application/json" },
    });
    const resData = await res.json();
    return resData.id;
    // console.log(resData.map((e:any)=>({...e.product,cartId:e.id, quantity:e.quantity})))
  };

  const removeCartServer = async (cartId: number) => {
    const res = await fetch(`${baseURL}api/cart-delete`, {
      body: JSON.stringify({ cartId }),
      method: "POST",
      headers: { "Content-type": "application/json" },
    });
    // const resData = await res.json();
    // console.log(resData.map((e:any)=>({...e.product,cartId:e.id, quantity:e.quantity})))
  };

  useEffect(() => {
    const fetchData = async (userId: number) => {
      const res = await fetch(`${baseURL}api/cart`, {
        body: JSON.stringify({ userId }),
        method: "POST",
        headers: { "Content-type": "application/json" },
      });
      setTimeout(()=>{
        setLoading(false);
      },700)
      const resData = await res.json();

      setCart(
        resData.map((e: any) => ({
          ...e.product,
          cartId: e.id,
          quantity: e.quantity,
        }))
      );
      //   console.log(resData);
    };
    if (user?.id) {
      fetchData(user.id);
    }
  }, [user]);

  const addToCart = async (p: ProductType) => {
    let cartId: number;
    if (user?.id) {
      cartId = await addToCartServer(user.id, p.id);
    }
    setCart((c) => {
      const tmp = c.filter((e) => e.id === p.id);
      if (tmp.length > 0) {
        return c.map((i) => {
          if (i.id === p.id) {
            return { ...i, quantity: i.quantity + 1, cartId };
          } else return i;
        });
      } else return [...c, { ...p, quantity: 1, cartId }];
    });
  };
  const removeFromCart = (p: ProductType) => {
    setCart((c) => {
      const tmp = c.filter((e) => e.id !== p.id);
      const tmpDel = c.filter((e) => e.id === p.id);
      if (tmpDel[0]?.cartId) {
        removeCartServer(tmpDel[0].cartId);
      }
      // if (tmp.length === 0) toast.error("Product doesn't exist in cart");
      return tmp;
    });
  };

  const reduceQuantity = (p: ProductType) => {
    if (user?.id) {
      reduceCartServer(user.id, p.id);
    }
    setCart((c) => {
      const tmp = c.filter((e) => e.id === p.id);
      let delTmp: number | undefined = undefined;
      if (tmp.length > 0) {
        const reducedItems = c.map((i) => {
          if (i.id === p.id) {
            if (i.quantity === 1) {
              delTmp = i.id;
            }
            return { ...i, quantity: i.quantity - 1 };
          } else return i;
        });
        if (delTmp) {
          return c.filter((e) => e.id !== delTmp);
        } else return reducedItems;
      } else return c;
    });
  };

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        cart,
        addToCart,
        removeFromCart,
        reduceQuantity,
        loading,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export default UserContext;
