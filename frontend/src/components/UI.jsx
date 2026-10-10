import { Link } from "react-router-dom";
import { AlertCircle, ArrowRight, Package, Star } from "lucide-react";

export function Loading({ text = "Loading data..." }) { return <div className="state"><div className="spinner" /><p>{text}</p></div>; }
export function ErrorMessage({ error }) {
  const message = error?.response?.data?.message || error?.message || "Unable to connect to the backend. Make sure the Node.js server is running on port 5000.";
  const neo4jHint = /neo4j|recommendation/i.test(message) || error?.response?.status === 500 ? " Make sure Neo4j is running and the product graph has been synced before using recommendation features." : "";
  return <div className="state error"><AlertCircle size={28} /><h3>We couldn't load this data</h3><p>{message}{neo4jHint}</p></div>;
}
export function Empty({ text = "No records found." }) { return <div className="empty"><Package size={30} /><p>{text}</p></div>; }
export function RatingStars({ value = 0 }) { return <span className="stars" aria-label={`${value} out of 5 stars`}>{[1,2,3,4,5].map((n) => <Star key={n} size={14} fill={n <= Math.round(value) ? "currentColor" : "none"} />)} <small>{Number(value || 0).toFixed(1)}</small></span>; }
export function StatusBadge({ status }) { return <span className={`status status-${String(status || "").toLowerCase()}`}>{status || "Unknown"}</span>; }
export function ProductCard({ product }) { return <article className="product-card"><div className="product-art"><span>{(product.name || "P").slice(0,1).toUpperCase()}</span></div><div className="product-body"><span className="eyebrow">{product.category || "Product"}</span><h3>{product.name}</h3><p className="muted">{product.brand}</p><div className="card-row"><RatingStars value={product.rating} /><span className="muted">{product.num_reviews || 0} reviews</span></div><div className="card-row price-row"><strong>₹{Number(product.price || 0).toLocaleString()}</strong><span className={product.stock <= 10 ? "low-stock" : "in-stock"}>{product.stock <= 10 ? "Low stock" : "In stock"}</span></div><Link className="text-link" to={`/products/${product.product_id}`}>View details <ArrowRight size={15} /></Link></div></article>; }
export function SectionHeading({ eyebrow, title, action }) { return <div className="section-heading"><div>{eyebrow && <span className="eyebrow">{eyebrow}</span>}<h2>{title}</h2></div>{action}</div>; }
