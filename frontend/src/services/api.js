import axios from "axios";

const api = axios.create({ baseURL: "http://localhost:5000/api", timeout: 12000 });
const get = (path) => api.get(path).then(({ data }) => data);

export const getProducts = () => get("/products");
export const getProduct = (id) => get(`/products/${encodeURIComponent(id)}`);
export const getCategories = () => get("/categories");
export const getUsers = () => get("/users");
export const getUser = (id) => get(`/users/${encodeURIComponent(id)}`);
export const getOrders = () => get("/orders");
export const getOrder = (id) => get(`/orders/${encodeURIComponent(id)}`);
export const getReviews = () => get("/reviews");
export const getAnalyticsSummary = () => get("/analytics/summary");
export const getBestSelling = () => get("/analytics/best-selling");
export const getSalesByCategory = () => get("/analytics/sales-by-category");
export const getTopCustomers = () => get("/analytics/top-customers");
export const getSalesByCity = () => get("/analytics/sales-by-city");
export const getMonthlySales = () => get("/analytics/monthly-sales");
export const getProductRatings = () => get("/analytics/product-ratings");
export const getLowStock = () => get("/analytics/low-stock");
export const getOrderStatus = () => get("/analytics/order-status");
export const getUserRecommendations = (id) => get(`/neo4j/recommendations/${encodeURIComponent(id)}`);
export const getSimilarProducts = (id) => get(`/neo4j/similar-products/${encodeURIComponent(id)}`);
export const getTopRatedRecommendations = (id) => get(`/neo4j/top-rated-recommendations/${encodeURIComponent(id)}`);
export const getXMLProducts = () => api.get("/xml/products", { responseType: "text" }).then(({ data }) => data);
