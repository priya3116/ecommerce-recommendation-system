import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { BarChart3, Menu, Search, X } from "lucide-react";

const links = [["Home", "/"], ["Products", "/products"], ["Recommendations", "/recommendations"], ["Orders", "/orders"], ["Users", "/users"], ["Analytics", "/analytics"]];
export default function Navbar() {
  const [open, setOpen] = useState(false);
  return <header className="navbar"><div className="nav-inner">
    <Link to="/" className="brand"><span className="brand-mark"><BarChart3 size={18} /></span><span>E-Commerce <b>Analytics</b></span></Link>
    <button className="menu-btn" onClick={() => setOpen(!open)} aria-label="Toggle menu">{open ? <X /> : <Menu />}</button>
    <nav className={open ? "nav-links open" : "nav-links"}>{links.map(([label, path]) => <NavLink key={path} to={path} onClick={() => setOpen(false)}>{label}</NavLink>)}</nav>
    <div className="nav-tools"><Link to="/products" className="icon-link" aria-label="Search"><Search size={19} /></Link><span className="avatar">PA</span></div>
  </div></header>;
}
