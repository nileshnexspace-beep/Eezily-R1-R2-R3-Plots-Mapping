import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { APIProvider, Map, Marker, InfoWindow } from '@vis.gl/react-google-maps';
import { Plot } from '../types';
import { MapPin, FileText, Info } from 'lucide-react';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyDp7t8pm5AiaY5HdnegA9_csUIqlD3HXao';

export default function SharedPlotView() {
  const { id } = useParams<{ id: string }>();
  const [plot, setPlot] = useState<Partial<Plot> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showInfo, setShowInfo] = useState(true);

  useEffect(() => {
    const fetchPlot = async () => {
      try {
        if (!id) return;
        const docRef = doc(db, 'plots', id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          // Fetch owner data too
          const ownerRef = doc(db, 'plot_owners', id);
          const ownerSnap = await getDoc(ownerRef);
          const ownerData = ownerSnap.exists() ? ownerSnap.data() : {};
          
          // Handle renamed fields
          const contactName = ownerData.contactName || ownerData.ownerName || '';
          const contactNumber = ownerData.contactNumber || ownerData.ownerNumber || '';
          
          setPlot({ ...data, ...ownerData, contactName, contactNumber } as Partial<Plot>);
        } else {
          setError('Plot not found or link is invalid.');
        }
      } catch (err) {
        setError('Failed to load plot details.');
      } finally {
        setLoading(false);
      }
    };

    fetchPlot();
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-neutral-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !plot) {
    return (
      <div className="flex h-screen items-center justify-center bg-neutral-50">
        <div className="text-center">
          <MapPin className="mx-auto h-12 w-12 text-neutral-400 mb-4" />
          <h2 className="text-xl font-semibold text-neutral-900 mb-2">Plot Not Found</h2>
          <p className="text-neutral-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-screen bg-neutral-50">
      {/* Details Panel */}
      <div className="w-full md:w-96 bg-white border-r border-neutral-200 flex flex-col shadow-sm z-10 order-2 md:order-1">
        <div className="p-6 border-b border-neutral-200 bg-blue-600 text-white">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <MapPin className="text-white opacity-80" />
            {plot.societyName ? `${plot.societyName} - ${plot.unitNumber || ''}` : (plot.locality || 'Land Details')}
          </h1>
          <div className="flex flex-wrap gap-2 mt-2">
            {plot.locality && (
              <span className="text-xs bg-white/20 text-white px-2 py-0.5 rounded-full backdrop-blur-sm">
                {plot.locality}
              </span>
            )}
            {plot.propertyTag && (
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                plot.propertyTag === 'Owner' ? 'bg-green-400/30 text-green-50' : 'bg-orange-400/30 text-orange-50'
              }`}>
                {plot.propertyTag}
              </span>
            )}
            {plot.size && (
              <span className="text-xs bg-blue-400/30 text-white px-2 py-0.5 rounded-full font-bold">
                {plot.size} Sqyd
              </span>
            )}
            {plot.pricePerSqyd && (
              <span className="text-xs bg-white/20 text-white px-2 py-0.5 rounded-full backdrop-blur-sm">
                ₹{plot.pricePerSqyd}/Sqyd
              </span>
            )}
            {plot.totalPrice && (
              <span className="text-xs bg-green-400/30 text-green-50 px-2 py-0.5 rounded-full font-bold">
                Total: ₹{plot.totalPrice}
              </span>
            )}
          </div>
        </div>

        <div className="p-6 flex-1 overflow-y-auto">
          <div className="space-y-6">
            <div>
              <h2 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Info size={16} />
                Property Description
              </h2>
              <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-100">
                <p className="text-neutral-700 whitespace-pre-wrap leading-relaxed">
                  {plot.details}
                </p>
              </div>
            </div>

            {plot.documents && plot.documents.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <FileText size={16} />
                  Available Documents
                </h2>
                <ul className="space-y-2">
                  {plot.documents.map((doc, i) => (
                    <li key={i}>
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-3 p-3 rounded-lg border border-neutral-200 hover:border-blue-300 hover:bg-blue-50 transition-colors group"
                      >
                        <div className="bg-blue-100 p-2 rounded-md group-hover:bg-blue-200 transition-colors">
                          <FileText size={20} className="text-blue-700" />
                        </div>
                        <span className="font-medium text-neutral-700 group-hover:text-blue-700 transition-colors truncate">
                          {doc.name}
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Map Area */}
      <div className="flex-1 relative z-0 order-1 md:order-2 h-[50vh] md:h-auto">
        {plot.lat && plot.lng && (
          <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
            <Map
              defaultCenter={{ lat: plot.lat, lng: plot.lng }}
              defaultZoom={15}
              disableDefaultUI={false}
              className="w-full h-full"
            >
              <Marker 
                position={{ lat: plot.lat, lng: plot.lng }} 
                onClick={() => setShowInfo(true)}
              />
              {showInfo && (
                <InfoWindow
                  position={{ lat: plot.lat, lng: plot.lng }}
                  onCloseClick={() => setShowInfo(false)}
                >
                  <div className="font-medium p-1 min-w-[150px]">
                    {plot.societyName ? (
                      <div className="flex flex-col mb-2">
                        <span className="text-blue-600 font-bold">{plot.societyName}</span>
                        <span className="text-xs text-neutral-500">{plot.unitNumber}</span>
                      </div>
                    ) : (
                      <div className="font-bold text-blue-600 mb-2">{plot.locality || 'Property Location'}</div>
                    )}
                    
                    <div className="flex flex-wrap gap-1 mb-2">
                      {plot.propertyTag && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                          plot.propertyTag === 'Owner' ? 'bg-green-50 text-green-700' : 'bg-orange-50 text-orange-700'
                        }`}>
                          {plot.propertyTag}
                        </span>
                      )}
                      {plot.size && (
                        <span className="text-[10px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded font-bold">
                          {plot.size} Sqyd
                        </span>
                      )}
                      {plot.pricePerSqyd && (
                        <span className="text-[10px] bg-neutral-100 text-neutral-600 px-1.5 py-0.5 rounded">
                          ₹{plot.pricePerSqyd}/Sqyd
                        </span>
                      )}
                    </div>
                    
                    <div className="text-xs text-neutral-700">
                      <p className="font-bold">{plot.contactName}</p>
                      <p>{plot.contactNumber}</p>
                    </div>
                  </div>
                </InfoWindow>
              )}
            </Map>
          </APIProvider>
        )}
      </div>
    </div>
  );
}
