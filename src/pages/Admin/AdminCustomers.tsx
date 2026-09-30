import React, { useState, useEffect } from "react";
import { Search, Users, ShoppingBag, IndianRupee, Mail, Phone, Calendar } from "lucide-react";
import { adminService } from "../../services/adminService";
import "./AdminCustomers.css";

interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  ordersCount: number;
  totalSpent: number;
  createdAt: string;
}

export const AdminCustomers: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    adminService.getCustomers()
      .then(res => setCustomers(res))
      .catch(err => console.warn("Failed to load customers", err))
      .finally(() => setLoading(false));
  }, []);

  const filteredCustomers = customers.filter(c => {
    const q = search.toLowerCase();
    return (
      (c.name && c.name.toLowerCase().includes(q)) ||
      (c.email && c.email.toLowerCase().includes(q)) ||
      (c.phone && c.phone.toLowerCase().includes(q))
    );
  });

  const totalRegistered = customers.length;
  const activeBuyers = customers.filter(c => c.ordersCount > 0).length;
  const grossCustomerValue = customers.reduce((sum, c) => sum + (c.totalSpent || 0), 0);

  return (
    <div className="gf-ad-cust-page">
      <div className="gf-ad-page-head">
        <div>
          <h1 className="gf-ad-title">Customer Directory</h1>
          <p className="gf-ad-sub">Inspect registered client profiles, purchase frequencies, and lifetime value.</p>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="gf-ad-cust-stats">
        <div className="gf-ad-cust-card">
          <div className="gf-ad-cust-card-icon blue">
            <Users size={20} />
          </div>
          <div>
            <span className="gf-ad-cust-card-label">Total Registered</span>
            <strong className="gf-ad-cust-card-val">{totalRegistered}</strong>
          </div>
        </div>

        <div className="gf-ad-cust-card">
          <div className="gf-ad-cust-card-icon green">
            <ShoppingBag size={20} />
          </div>
          <div>
            <span className="gf-ad-cust-card-label">Active Buyers</span>
            <strong className="gf-ad-cust-card-val">{activeBuyers}</strong>
          </div>
        </div>

        <div className="gf-ad-cust-card">
          <div className="gf-ad-cust-card-icon gold">
            <IndianRupee size={20} />
          </div>
          <div>
            <span className="gf-ad-cust-card-label">Gross Customer Spend</span>
            <strong className="gf-ad-cust-card-val">₹{grossCustomerValue.toLocaleString("en-IN")}</strong>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="gf-ad-cust-filter-bar">
        <div className="gf-ad-cust-search-wrap">
          <Search size={16} className="gf-ad-cust-search-icon" />
          <input
            type="text"
            className="gf-ad-cust-search-input"
            placeholder="Search customer by name, email, or phone..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Customers Table */}
      <div className="gf-ad-cust-table-card">
        {loading ? (
          <div className="gf-ad-cust-loading">
            <div className="gf-spinner" />
            <p>Loading customer accounts...</p>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="gf-ad-cust-empty">
            <Users size={40} />
            <h3>No customers found</h3>
            <p>Try adjusting your search criteria or register a test account.</p>
          </div>
        ) : (
          <div className="gf-ad-cust-table-resp">
            <table className="gf-ad-cust-table">
              <thead>
                <tr>
                  <th>Customer Profile</th>
                  <th>Contact Info</th>
                  <th>Orders Placed</th>
                  <th>Lifetime Spend</th>
                  <th>Registration Date</th>
                  <th>Customer Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map(c => (
                  <tr key={c.id}>
                    <td>
                      <div className="gf-ad-cust-name-cell">
                        <div className="gf-ad-cust-avatar">
                          {(c.name || "C").charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <strong className="gf-ad-cust-name">{c.name || "Unnamed Customer"}</strong>
                          <span className="gf-ad-cust-id">ID: {c.id.slice(0, 8)}...</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="gf-ad-cust-contact">
                        <span className="gf-ad-cust-email">
                          <Mail size={12} /> {c.email}
                        </span>
                        {c.phone && (
                          <span className="gf-ad-cust-phone">
                            <Phone size={12} /> {c.phone}
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className="gf-ad-cust-badge-orders">
                        {c.ordersCount} {c.ordersCount === 1 ? "order" : "orders"}
                      </span>
                    </td>
                    <td>
                      <strong className="gf-ad-cust-spent">₹{c.totalSpent.toLocaleString("en-IN")}</strong>
                    </td>
                    <td>
                      <span className="gf-ad-cust-date">
                        <Calendar size={12} /> {new Date(c.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                    </td>
                    <td>
                      <span className={`gf-ad-cust-status ${c.ordersCount > 0 ? "active" : "lead"}`}>
                        {c.ordersCount > 0 ? "Active Buyer" : "Registered"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
