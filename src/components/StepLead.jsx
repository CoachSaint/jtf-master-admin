import { useState } from "react";
import { User, Phone, Mail, MapPin, ArrowRight, Home, Sparkles } from "lucide-react";

export default function StepLead({ deal, onUpdateDeal, onNext }) {
  const [name, setName] = useState(deal.customerName || "");
  const [phone, setPhone] = useState(deal.customerPhone || "");
  const [email, setEmail] = useState(deal.customerEmail || "");
  const [address, setAddress] = useState(deal.address || "");

  function handleContinue(e) {
    e.preventDefault();
    if (!address.trim()) {
      alert("Please enter the property address.");
      return;
    }
    onUpdateDeal({
      customerName: name || "Homeowner",
      customerPhone: phone,
      customerEmail: email,
      address: address.trim(),
      dealType: "retail",
    });
    onNext();
  }

  return (
    <div className="admin-card">
      <div className="card-title">
        <MapPin size={22} color="var(--red)" />
        1. Retail Customer &amp; Property Info
      </div>
      <div className="card-subtitle">
        Enter the property address and homeowner contact info.
      </div>

      <form onSubmit={handleContinue}>
        {/* Retail Header Badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "var(--navy-light, #1e293b)",
            color: "#fff",
            padding: "10px 14px",
            borderRadius: "12px",
            marginBottom: "16px",
            fontSize: "13px",
            fontWeight: 700,
          }}
        >
          <Home size={16} color="var(--gold)" />
          <span>JTF Direct Retail Replacement &amp; Exterior Installation</span>
        </div>

        {/* Address */}
        <div className="form-group">
          <label className="form-label">Property Address *</label>
          <input
            type="text"
            className="input-field"
            placeholder="e.g. 297 Pettit Rd, Jasper, GA 30143"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
            autoFocus
          />
        </div>

        {/* Customer Name */}
        <div className="form-group">
          <label className="form-label">Homeowner / Customer Name</label>
          <input
            type="text"
            className="input-field"
            placeholder="e.g. John &amp; Mary Smith"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        {/* Phone & Email */}
        <div className="grid-2">
          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input
              type="tel"
              className="input-field"
              placeholder="(404) 555-1234"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="input-field"
              placeholder="customer@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        <button type="submit" className="btn-primary" style={{ marginTop: 12 }}>
          Continue to Roof Measurements
          <ArrowRight size={18} />
        </button>
      </form>
    </div>
  );
}
