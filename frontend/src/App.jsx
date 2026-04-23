import { useState } from 'react';

function App() {
  const [searchId, setSearchId] = useState('');
  const [results, setResults] = useState([]);
  const [approveId, setApproveId] = useState('');
  const [message, setMessage] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://localhost:8080/api/releases?id=${searchId}`);
      const data = await res.json();
      setResults(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleApprove = async (e) => {
    e.preventDefault();
    try {
      // Missing proper auth, relying on User-Agent which we can spoof in curl/postman
      // But standard browser fetch will just use the standard user agent
      // Wait, in the browser, to trigger it we could just let it fail or add "Admin" arbitrarily to demonstrate.
      // But the instructions say: 
      // "Open Postman/Terminal. Send a POST request to /api/approve/1. Watch the app say "Deployed!" without asking for a login."
      // So we just have a button that fails in browser but works in curl if they inject Admin UA.
      const res = await fetch(`http://localhost:8080/api/approve/${approveId}`, {
        method: 'POST',
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(data.message);
      } else {
        setMessage(`Error: ${data.message || 'Approval failed'}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>The Deployment Sentry</h1>
      <hr />
      
      <h2>Find Releases by Ticket ID</h2>
      <form onSubmit={handleSearch}>
        <input 
          type="text" 
          placeholder="e.g. PROD-101" 
          value={searchId} 
          onChange={e => setSearchId(e.target.value)} 
          style={{ width: '300px' }}
        />
        <button type="submit">Search</button>
      </form>

      <div style={{ marginTop: '10px', background: '#eee', padding: '10px' }}>
        <pre>{JSON.stringify(results, null, 2)}</pre>
      </div>

      <hr />

      <h2>Approve Deployment</h2>
      <form onSubmit={handleApprove}>
        <input 
          type="text" 
          placeholder="Release ID (e.g. 1)" 
          value={approveId} 
          onChange={e => setApproveId(e.target.value)} 
        />
        <button type="submit">Approve and Deploy</button>
      </form>

      {message && (
        <div style={{ marginTop: '10px', background: '#ffcccc', padding: '10px', color: 'darkred' }}>
          {message}
        </div>
      )}
    </div>
  );
}

export default App;
