"use client";

import { useState } from "react";
import type { ListingWithTrust } from "@realestate/shared";
import { ApiError, updateListing } from "@/lib/api";
import { TrustBadge } from "./TrustBadge";

interface Props {
  listing: ListingWithTrust;
  editing: boolean;
  busy: boolean;
  onEdit: () => void;
  onCancelEdit: () => void;
  onSaved: () => void;
  onToggleSuspend: () => void;
}

export function ListingRow({ listing, editing, busy, onEdit, onCancelEdit, onSaved, onToggleSuspend }: Props) {
  const [title, setTitle] = useState(listing.title);
  const [price, setPrice] = useState(String(listing.price));
  const [condition, setCondition] = useState(listing.officeStatedCondition);
  const [bedrooms, setBedrooms] = useState(String(listing.bedrooms));
  const [bathrooms, setBathrooms] = useState(String(listing.bathrooms));
  const [areaSqm, setAreaSqm] = useState(String(listing.areaSqm));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      await updateListing(listing.id, {
        title,
        price: Number(price),
        officeStatedCondition: condition,
        bedrooms: Number(bedrooms),
        bathrooms: Number(bathrooms),
        areaSqm: Number(areaSqm),
      });
      onSaved();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Save failed.");
      setSaving(false);
    }
  }

  if (editing) {
    return (
      <tr className="row-editing">
        <td colSpan={8}>
          <div className="edit-form">
            <label>
              Title
              <input value={title} onChange={(e) => setTitle(e.target.value)} />
            </label>
            <label>
              Price
              <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} />
            </label>
            <label>
              Condition
              <input value={condition} onChange={(e) => setCondition(e.target.value)} />
            </label>
            <label>
              Beds
              <input type="number" value={bedrooms} onChange={(e) => setBedrooms(e.target.value)} />
            </label>
            <label>
              Baths
              <input type="number" value={bathrooms} onChange={(e) => setBathrooms(e.target.value)} />
            </label>
            <label>
              Area (sqm)
              <input type="number" value={areaSqm} onChange={(e) => setAreaSqm(e.target.value)} />
            </label>
            {error && <p className="error-banner">{error}</p>}
            <div className="edit-actions">
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? "Saving…" : "Save"}
              </button>
              <button className="btn btn-secondary" onClick={onCancelEdit} disabled={saving}>
                Cancel
              </button>
            </div>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr>
      <td>{listing.title}</td>
      <td>{listing.type === "RENT" ? "Rent" : "Sale"}</td>
      <td>
        <span className={`badge badge-${listing.status.toLowerCase()}`}>{listing.status}</span>
      </td>
      <td>
        ${listing.price.toLocaleString()}
        {listing.type === "RENT" ? "/mo" : ""}
      </td>
      <td>{listing.neighborhood}</td>
      <td>
        {listing.bedrooms} / {listing.bathrooms}
      </td>
      <td>
        <TrustBadge score={listing.trustScore} signalCount={listing.trustSignalCount} compact />
      </td>
      <td className="row-actions">
        <button className="btn-link" onClick={onEdit} disabled={busy}>
          Edit
        </button>
        <button className="btn-link" onClick={onToggleSuspend} disabled={busy}>
          {busy ? "…" : listing.status === "SUSPENDED" ? "Restore" : "Remove"}
        </button>
      </td>
    </tr>
  );
}
