import { useEffect, useState } from "react";
import { ArrowLeft, Heart, ShoppingBag } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getProduct, getSimilarProducts } from "../services/api";
import { ErrorMessage, Loading, ProductCard, RatingStars, SectionHeading } from "../components/UI";

export default function ProductDetails() {
  const { product_id } = useParams(); const [product, setProduct] = useState(null); const [similar, setSimilar] = useState([]); const [error, setError] = useState(null); const navigate = useNavigate();
  useEffect(() => { getProduct(product_id).then(setProduct).catch(setError); getSimilarProducts(product_id).then(data => setSimilar(Array.isArray(data) ? data : data.recommendations || [])).catch(() => {}); }, [product_id]);
  if (error) return <section className="section page-section"><ErrorMessage error={error} /></section>; if (!product) return <Loading text="Loading product..." />;
  return <section className="section page-section"><Link className="back-link" to="/products"><ArrowLeft size={16} /> Back to products</Link><div className="detail-layout"><div className="detail-art">{product.name?.slice(0,1)}</div><div className="detail-copy"><span className="eyebrow">{product.category} · {product.brand}</span><h1>{product.name}</h1><div className="detail-rating"><RatingStars value={product.rating} /> <span>{product.num_reviews || 0} reviews</span></div><p>{product.description || "A carefully selected product from our growing catalog."}</p><div className="detail-price">₹{Number(product.price || 0).toLocaleString()}</div><div className="detail-meta"><span>Product ID <b>{product.product_id}</b></span><span>Stock <b className={product.stock <= 10 ? "low-stock" : "in-stock"}>{product.stock}</b></span></div><div className="hero-actions"><button className="button primary" onClick={() => navigate("/orders")}><ShoppingBag size={17} /> Add to cart</button><button className="button secondary"><Heart size={17} /> Wishlist</button></div></div></div><div className="section-heading subheading"><h2>Similar products</h2></div>{similar.length ? <div className="product-grid">{similar.slice(0,4).map((p, i) => <ProductCard product={p.product || p} key={p.product_id || p.product?.product_id || i} />)}</div> : <p className="muted">No similar products are available yet.</p>}</section>;
}
