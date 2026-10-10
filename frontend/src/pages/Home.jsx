import { useEffect, useState } from "react";
import { ArrowRight, BarChart3, Package, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { getProducts } from "../services/api";
import { ProductCard, Loading, ErrorMessage, SectionHeading } from "../components/UI";

export default function Home() {
  const [products, setProducts] = useState([]); const [error, setError] = useState(null);
  useEffect(() => { getProducts().then(setProducts).catch(setError); }, []);
  return <section className="home-page">
    <div className="home-heading">
      <div><span className="eyebrow">Store overview</span><h1>Good morning, Priya</h1><p>Review your catalogue, orders and customer activity from one place.</p></div>
      <div className="home-actions"><Link className="button primary" to="/products">Browse products <ArrowRight size={16} /></Link><Link className="button secondary" to="/analytics">Open analytics</Link></div>
    </div>
    <div className="home-summary">
      <div className="summary-card"><span className="summary-icon"><Package size={18} /></span><div><strong>{products.length || "—"}</strong><span>Products in catalogue</span></div></div>
      <div className="summary-card"><span className="summary-icon"><Users size={18} /></span><div><strong>Customers</strong><span>View customer directory</span></div><Link className="text-link" to="/users">View</Link></div>
      <div className="summary-card"><span className="summary-icon"><BarChart3 size={18} /></span><div><strong>Reports</strong><span>Sales and order activity</span></div><Link className="text-link" to="/analytics">View</Link></div>
    </div>
    <section className="section home-products"><SectionHeading eyebrow="Catalogue" title="Recently available products" action={<Link className="text-link" to="/products">View all <ArrowRight size={15} /></Link>} />{error ? <ErrorMessage error={error} /> : products.length ? <div className="product-grid">{products.slice(0, 6).map(p => <ProductCard product={p} key={p.product_id} />)}</div> : <Loading text="Loading products..." />}</section>
    <div className="home-note"><div><strong>Need a recommendation?</strong><span>Enter a customer name or ID to see related products.</span></div><Link className="button secondary" to="/recommendations">Open recommendations</Link></div>
  </section>;
}
