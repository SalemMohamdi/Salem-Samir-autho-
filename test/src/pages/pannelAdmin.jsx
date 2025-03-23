import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AdminPage = () => {
  const [requests, setRequests] = useState([]);
  const [selectedPdf, setSelectedPdf] = useState(null);

  useEffect(() => {
    // Fetch requests backend
    axios.get('/api/requests')
      .then(response => {
        setRequests(response.data);
      })
      .catch(error => {
        console.error('Error fetching requests:', error);
      });
  }, []);

  const handleViewPdf = (pdfBase64) => {
    setSelectedPdf(pdfBase64);
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Manage Requests</h1>
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full leading-normal">
          <thead>
            <tr>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Request ID
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                User
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {requests.map(request => (
              <tr key={request.id} className="hover:bg-gray-50">
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  <p className="text-gray-900 whitespace-no-wrap">{request.id}</p>
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  <p className="text-gray-900 whitespace-no-wrap">{request.user}</p>
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  <button
                    onClick={() => handleViewPdf(request.pdfBase64)}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  >
                    View PDF
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedPdf && (
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">PDF Viewer</h2>
          <div className="bg-white p-4 shadow-md rounded-lg">
            <iframe
              src={`data:application/pdf;base64,${selectedPdf}`}
              width="100%"
              height="600px"
              title="PDF Viewer"
            ></iframe>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;