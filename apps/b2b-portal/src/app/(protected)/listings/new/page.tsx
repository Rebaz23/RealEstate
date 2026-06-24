"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import type { ListingType } from "@realestate/shared";
import { ApiError, createListing } from "@/lib/api";
import { useOfficeAuth } from "@/lib/auth";

export default function NewListingPage() {
  const router = useRouter();
  const { officeId, refresh } = useOfficeAuth();
  const [type, setType] = useState<ListingType>("RENT");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [city, setCity] = useState("Baghdad");
  const [bedrooms, setBedrooms] = useState("2");
  const [bathrooms, setBathrooms] = useState("1");
  const [areaSqm, setAreaSqm] = useState("100");
  const [condition, setCondition] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!officeId) return;
    setSubmitting(true);
    setError(null);
    try {
      await createListing({
        officeId,
        type,
        title,
        description,
        price: Number(price),
        currency: "USD",
        neighborhood,
        city,
        bedrooms: Number(bedrooms),
        bathrooms: Number(bathrooms),
        areaSqm: Number(areaSqm),
        officeStatedCondition: condition,
      });
      await refresh();
      router.push("/listings");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not create listing.");
      setSubmitting(false);
    }
  }

  return (
    <div>
      <h1>New listing</h1>
      <form className="form-card" onSubmit={handleSubmit}>
        <label>
          Looking to
          <select value={type} onChange={(e) => setType(e.target.value as ListingType)}>
            <option value="RENT">Rent out</option>
            <option value="SALE">Sell</option>
          </select>
        </label>
        <label>
          Title
          <input required value={title} onChange={(e) => setTitle(e.target.value)} />
        </label>
        <label>
          Description
          <textarea required value={description} onChange={(e) => setDescription(e.target.value)} />
        </label>
        <div className="form-row">
          <label>
            Price (USD)
            <input required type="number" min="0" value={price} onChange={(e) => setPrice(e.target.value)} />
          </label>
          <label>
            Neighborhood
            <input required value={neighborhood} onChange={(e) => setNeighborhood(e.target.value)} />
          </label>
          <label>
            City
            <input required value={city} onChange={(e) => setCity(e.target.value)} />
          </label>
        </div>
        <div className="form-row">
          <label>
            Bedrooms
            <input required type="number" min="0" value={bedrooms} onChange={(e) => setBedrooms(e.target.value)} />
          </label>
          <label>
            Bathrooms
            <input required type="number" min="0" value={bathrooms} onChange={(e) => setBathrooms(e.target.value)} />
          </label>
          <label>
            Area (sqm)
            <input required type="number" min="0" value={areaSqm} onChange={(e) => setAreaSqm(e.target.value)} />
          </label>
        </div>
        <label>
          Stated condition
          <input
            required
            placeholder="e.g. Excellent, recently renovated"
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
          />
        </label>
        {error && <p className="error-banner">{error}</p>}
        <div className="edit-actions">
          <button className="btn btn-primary" type="submit" disabled={submitting}>
            {submitting ? "Creating…" : "Create listing"}
          </button>
        </div>
      </form>
    </div>
  );
}
