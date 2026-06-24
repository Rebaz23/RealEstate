"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { ListingWithTrust } from "@realestate/shared";
import { ListingRow } from "@/components/ListingRow";
import { ApiError, listOfficeListings, updateListing } from "@/lib/api";
import { useOfficeAuth } from "@/lib/auth";

export default function ListingsPage() {
  const { officeId, refresh } = useOfficeAuth();
  const [listings, setListings] = useState<ListingWithTrust[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function load(id: string) {
    setLoading(true);
    try {
      setListings(await listOfficeListings(id));
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not load listings.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (officeId) load(officeId);
  }, [officeId]);

  async function toggleSuspend(listing: ListingWithTrust) {
    if (!officeId) return;
    setBusyId(listing.id);
    try {
      const nextStatus = listing.status === "SUSPENDED" ? "ACTIVE" : "SUSPENDED";
      await updateListing(listing.id, { status: nextStatus });
      await load(officeId);
      await refresh();
    } catch {
      setError("Could not update listing status.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1>Listings</h1>
        <Link href="/listings/new" className="btn btn-primary">
          + New listing
        </Link>
      </div>
      {error && <p className="error-banner">{error}</p>}
      {loading ? (
        <p>Loading…</p>
      ) : listings.length === 0 ? (
        <p className="empty-state">No listings yet. Create your first one.</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Type</th>
              <th>Status</th>
              <th>Price</th>
              <th>Neighborhood</th>
              <th>Beds/Baths</th>
              <th>Trust</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {listings.map((listing) => (
              <ListingRow
                key={listing.id}
                listing={listing}
                editing={editingId === listing.id}
                busy={busyId === listing.id}
                onEdit={() => setEditingId(listing.id)}
                onCancelEdit={() => setEditingId(null)}
                onSaved={async () => {
                  setEditingId(null);
                  if (officeId) await load(officeId);
                }}
                onToggleSuspend={() => toggleSuspend(listing)}
              />
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
