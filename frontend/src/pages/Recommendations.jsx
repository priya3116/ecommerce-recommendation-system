import { useState } from "react";
import { BrainCircuit, Search } from "lucide-react";
import { getTopRatedRecommendations, getUserRecommendations } from "../services/api";
import { ErrorMessage, Loading, ProductCard, SectionHeading } from "../components/UI";

function recProduct(item) { return item.product || item; }
export default function Recommendations() {
  const [userId, setUserId] = useState(""); const [recommendations, setRecommendations] = useState([]); const [top, setTop] = useState([]); const [loading, setLoading] = useState(false); const [error, setError] = useState(null);
  const load = async (e) => {
    e.preventDefault();
    if (!userId.trim()) return;
    setLoading(true);
    setError(null);
    setRecommendations([]);
    setTop([]);

    const identifier = userId.trim();
    const [personalized, rated] = await Promise.allSettled([
      getUserRecommendations(identifier),
      getTopRatedRecommendations(identifier)
    ]);

    if (personalized.status === "fulfilled") {
      const data = personalized.value;
      setRecommendations(Array.isArray(data) ? data : data.recommendations || []);
    }

    if (rated.status === "fulfilled") {
      const data = rated.value;
      setTop(Array.isArray(data) ? data : data.recommendations || []);
    }

    const failedRequest = personalized.status === "rejected" ? personalized : rated;
    if (failedRequest.status === "rejected" && personalized.status === "rejected" && rated.status === "rejected") {
      setError(failedRequest.reason);
    }

    setLoading(false);
  };
  return <section className="section page-section"><div className="recommend-hero"><div><span className="eyebrow">Graph-powered discovery</span><h1>Recommendations that feel personal.</h1><p>Enter a username or user ID to explore products connected by real purchase relationships in Neo4j.</p></div><BrainCircuit size={72} /></div><form className="recommend-form" onSubmit={load}><label className="search-field"><Search size={17} /><input value={userId} onChange={e => setUserId(e.target.value)} placeholder="Enter username or user ID, e.g. Alice Johnson or U001" /></label><button className="button primary">Get recommendations</button></form>{loading ? <Loading text="Loading recommendations..." /> : error ? <ErrorMessage error={error} /> : <><SectionHeading eyebrow="Personalized for you" title="Recommended products" />{recommendations.length ? <div className="product-grid">{recommendations.map((r,i) => <div key={i}><ProductCard product={recProduct(r)} /><small className="score">Recommendation score: {r.score ?? r.recommendation_score ?? "—"}</small></div>)}</div> : <p className="muted">Enter a username or user ID to see personalized recommendations.</p>}<SectionHeading eyebrow="Rated by the community" title="Top rated recommendations" />{top.length ? <div className="product-grid">{top.map((r,i) => <div key={i}><ProductCard product={recProduct(r)} /><small className="score">Common buyers: {r.commonBuyers ?? r.common_buyers ?? "—"} · Score: {r.score ?? "—"}</small></div>)}</div> : <p className="muted">Top-rated suggestions will appear here.</p>}</>}</section>;
}
