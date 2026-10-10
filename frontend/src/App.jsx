import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import Recommendations from "./pages/Recommendations";
import Users from "./pages/Users";
import UserDetails from "./pages/UserDetails";
import Orders from "./pages/Orders";
import OrderDetails from "./pages/OrderDetails";
import Reviews from "./pages/Reviews";
import Analytics from "./pages/Analytics";
import XMLData from "./pages/XMLData";
import NotFound from "./pages/NotFound";

export default function App() {
  return <><Navbar /><main className="app-main"><Routes>
    <Route path="/" element={<Home />} /><Route path="/products" element={<Products />} />
    <Route path="/products/:product_id" element={<ProductDetails />} /><Route path="/recommendations" element={<Recommendations />} />
    <Route path="/users" element={<Users />} /><Route path="/users/:user_id" element={<UserDetails />} />
    <Route path="/orders" element={<Orders />} /><Route path="/orders/:order_id" element={<OrderDetails />} />
    <Route path="/reviews" element={<Reviews />} /><Route path="/analytics" element={<Analytics />} />
    <Route path="/xml" element={<XMLData />} /><Route path="*" element={<NotFound />} />
  </Routes></main><Footer /></>;
}
