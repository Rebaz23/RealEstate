import { listOffices } from "@/lib/api";
import { Nav } from "@/components/Nav";
import { TrustBadge } from "@/components/TrustBadge";

export default async function OfficesPage() {
  const offices = await listOffices();

  return (
    <>
      <Nav />
      <main className="page">
        <div className="page-header">
          <h1>Offices</h1>
        </div>
        {offices.length === 0 ? (
          <p className="empty-state">No offices yet.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Contact</th>
                <th>Tier</th>
                <th>Lead credits</th>
                <th>Listings</th>
                <th>Leads</th>
                <th>Trust score</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {offices.map((o) => (
                <tr key={o.id}>
                  <td>{o.name}</td>
                  <td>
                    {o.phone}
                    <br />
                    {o.email}
                  </td>
                  <td>{o.subscriptionTier}</td>
                  <td>{o.leadCredits}</td>
                  <td>{o.listingCount}</td>
                  <td>{o.leadCount}</td>
                  <td>
                    <TrustBadge score={o.trustScore} compact />
                  </td>
                  <td>{new Date(o.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </main>
    </>
  );
}
