import { listAllListings } from "@/lib/api";
import { Nav } from "@/components/Nav";
import { TrustBadge } from "@/components/TrustBadge";

function statusBadgeClass(status: string): string {
  return `badge badge-${status.toLowerCase()}`;
}

export default async function ListingsPage() {
  const listings = await listAllListings();

  return (
    <>
      <Nav />
      <main className="page">
        <div className="page-header">
          <h1>Listings</h1>
        </div>
        {listings.length === 0 ? (
          <p className="empty-state">No listings yet.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Office</th>
                <th>Type</th>
                <th>Price</th>
                <th>Neighborhood</th>
                <th>Status</th>
                <th>Trust score</th>
              </tr>
            </thead>
            <tbody>
              {listings.map((l) => (
                <tr key={l.id}>
                  <td>{l.title}</td>
                  <td>{l.office.name}</td>
                  <td>{l.type}</td>
                  <td>
                    {l.price.toLocaleString()} {l.currency}
                  </td>
                  <td>
                    {l.neighborhood}, {l.city}
                  </td>
                  <td>
                    <span className={statusBadgeClass(l.status)}>{l.status}</span>
                  </td>
                  <td>
                    <TrustBadge score={l.trustScore} signalCount={l.trustSignalCount} compact />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </main>
    </>
  );
}
