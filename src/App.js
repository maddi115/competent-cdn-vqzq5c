import React, { useState, useEffect, useRef } from "react";

export default function App() {
  const [marker, setMarker] = useState(null);
  const [comment, setComment] = useState("");
  const [showInput, setShowInput] = useState(false);
  const [gifSearch, setGifSearch] = useState("");
  const [gifs, setGifs] = useState([]);
  const [selectedGif, setSelectedGif] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  const GIPHY_API_KEY = "0b4Ls0Z42RdTVnUdJC8vKKfK6Imt9wsg";

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(link);

    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.onload = initMap;
    document.body.appendChild(script);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }
    };
  }, []);

  const initMap = () => {
    if (mapInstanceRef.current || !window.L) return;

    const map = window.L.map(mapRef.current).setView([34.0522, -118.2437], 13);

    window.L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
      {
        attribution: "© OpenStreetMap contributors © CARTO",
        subdomains: "abcd",
        maxZoom: 20,
      }
    ).addTo(map);

    mapInstanceRef.current = map;

    map.on("click", (e) => {
      const { lat, lng } = e.latlng;
      setMarker({ lat, lng });
      setShowInput(true);
      setSelectedGif(null);
      setGifs([]);
      setGifSearch("");

      if (markerRef.current) {
        map.removeLayer(markerRef.current);
      }

      const redSquareIcon = window.L.divIcon({
        className: "custom-marker",
        html: '<div style="background-color: red; width: 20px; height: 20px; border: 2px solid darkred;"></div>',
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });

      const newMarker = window.L.marker([lat, lng], {
        icon: redSquareIcon,
      }).addTo(map);
      markerRef.current = newMarker;
    });
  };

  const searchGifs = async () => {
    if (!gifSearch.trim()) {
      alert("Please enter a search term!");
      return;
    }

    setIsSearching(true);
    console.log("Searching GIPHY for:", gifSearch);

    try {
      const url = `https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_API_KEY}&q=${encodeURIComponent(
        gifSearch
      )}&limit=12`;
      console.log("Fetching:", url);

      const response = await fetch(url);
      const data = await response.json();

      console.log("GIPHY response:", data);

      if (data.data && data.data.length > 0) {
        setGifs(data.data);
        console.log("Found", data.data.length, "GIFs");
      } else {
        setGifs([]);
        alert("No GIFs found. Try a different search!");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error loading GIFs: " + error.message);
      setGifs([]);
    }
    setIsSearching(false);
  };

  const handleGifSelect = (gif) => {
    setSelectedGif(gif);
    console.log("Selected:", gif);
  };

  const handleCommentSubmit = () => {
    if (!markerRef.current) return;

    let popupContent = "";

    if (selectedGif) {
      const gifUrl =
        selectedGif.images?.fixed_height?.url ||
        selectedGif.images?.original?.url;
      if (gifUrl) {
        popupContent += `<img src="${gifUrl}" style="max-width: 200px; max-height: 200px; display: block; margin-bottom: 8px;" />`;
      }
    }

    if (comment) {
      popupContent += `<div style="font-size: 14px;">${comment}</div>`;
    }

    if (popupContent) {
      markerRef.current.bindPopup(popupContent, { maxWidth: 250 }).openPopup();
      setShowInput(false);
      setSelectedGif(null);
      setGifs([]);
      setGifSearch("");
      setComment("");
    }
  };

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        fontFamily: "system-ui, -apple-system, sans-serif",
        margin: 0,
        padding: 0,
      }}
    >
      <div
        style={{
          padding: "16px",
          backgroundColor: "#2563eb",
          color: "white",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        }}
      >
        <h1 style={{ margin: 0, fontSize: "24px", fontWeight: "bold" }}>
          🎬 GIF Drop Map - LA
        </h1>
        <p style={{ margin: "4px 0 0 0", fontSize: "14px", opacity: 0.9 }}>
          Click anywhere to drop GIFs and comments • Powered by GIPHY
        </p>
      </div>

      <div ref={mapRef} style={{ flex: 1, position: "relative" }}></div>

      {showInput && (
        <div
          style={{
            position: "absolute",
            bottom: "20px",
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: "white",
            padding: "20px",
            borderRadius: "12px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            minWidth: "400px",
            maxWidth: "90vw",
            maxHeight: "80vh",
            overflowY: "auto",
            zIndex: 1000,
          }}
        >
          {/* GIF Search */}
          <div style={{ marginBottom: "16px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "600",
                fontSize: "14px",
                color: "#374151",
              }}
            >
              🎬 Search GIFs:
            </label>
            <div style={{ display: "flex", gap: "8px" }}>
              <input
                type="text"
                value={gifSearch}
                onChange={(e) => setGifSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    searchGifs();
                  }
                }}
                placeholder="excited, funny, cat..."
                style={{
                  flex: 1,
                  padding: "10px",
                  borderRadius: "8px",
                  border: "2px solid #e5e7eb",
                  fontSize: "14px",
                  fontFamily: "inherit",
                  outline: "none",
                }}
              />
              <button
                onClick={searchGifs}
                disabled={isSearching || !gifSearch.trim()}
                style={{
                  padding: "10px 20px",
                  backgroundColor: isSearching ? "#9ca3af" : "#10b981",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  fontWeight: "600",
                  cursor: isSearching ? "not-allowed" : "pointer",
                  fontSize: "14px",
                }}
              >
                {isSearching ? "🔍..." : "🔍 Search"}
              </button>
            </div>
          </div>

          {/* Selected GIF Preview */}
          {selectedGif && (
            <div
              style={{
                marginBottom: "16px",
                padding: "12px",
                backgroundColor: "#f0fdf4",
                border: "2px solid #10b981",
                borderRadius: "8px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: "12px",
                  color: "#047857",
                  marginBottom: "8px",
                  fontWeight: "600",
                }}
              >
                ✓ Selected GIF:
              </div>
              <img
                src={
                  selectedGif.images?.fixed_height_small?.url ||
                  selectedGif.images?.fixed_height?.url
                }
                alt="Selected GIF"
                style={{
                  maxWidth: "150px",
                  maxHeight: "150px",
                  borderRadius: "4px",
                }}
              />
              <button
                onClick={() => setSelectedGif(null)}
                style={{
                  marginTop: "8px",
                  padding: "6px 12px",
                  backgroundColor: "#ef4444",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  fontSize: "12px",
                  cursor: "pointer",
                }}
              >
                ✕ Remove
              </button>
            </div>
          )}

          {/* GIF Results */}
          {gifs.length > 0 && (
            <div
              style={{
                marginBottom: "16px",
                maxHeight: "200px",
                overflowY: "auto",
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "8px",
                padding: "8px",
                backgroundColor: "#f9fafb",
                borderRadius: "8px",
              }}
            >
              {gifs.map((gif, index) => (
                <img
                  key={gif.id || index}
                  src={
                    gif.images?.fixed_height_small?.url ||
                    gif.images?.fixed_height?.url
                  }
                  alt={gif.title || `GIF ${index + 1}`}
                  onClick={() => handleGifSelect(gif)}
                  style={{
                    width: "100%",
                    height: "100px",
                    objectFit: "cover",
                    borderRadius: "6px",
                    cursor: "pointer",
                    border:
                      selectedGif?.id === gif.id
                        ? "3px solid #10b981"
                        : "2px solid #e5e7eb",
                    transition: "all 0.2s",
                  }}
                />
              ))}
            </div>
          )}

          {/* Comment */}
          <div style={{ marginBottom: "12px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "600",
                fontSize: "14px",
                color: "#374151",
              }}
            >
              💬 Add comment (optional):
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What's happening here?"
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "8px",
                border: "2px solid #e5e7eb",
                fontSize: "14px",
                resize: "vertical",
                minHeight: "60px",
                fontFamily: "inherit",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* Buttons */}
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={handleCommentSubmit}
              disabled={!selectedGif && !comment}
              style={{
                flex: 1,
                padding: "12px",
                backgroundColor:
                  !selectedGif && !comment ? "#9ca3af" : "#10b981",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontWeight: "700",
                cursor: !selectedGif && !comment ? "not-allowed" : "pointer",
                fontSize: "15px",
              }}
            >
              🎯 Drop It!
            </button>
            <button
              onClick={() => {
                setShowInput(false);
                setSelectedGif(null);
                setGifs([]);
                setGifSearch("");
                setComment("");
              }}
              style={{
                padding: "12px 20px",
                backgroundColor: "#f3f4f6",
                color: "#374151",
                border: "none",
                borderRadius: "8px",
                fontWeight: "600",
                cursor: "pointer",
                fontSize: "14px",
              }}
            >
              Close
            </button>
          </div>

          {marker && (
            <div
              style={{
                marginTop: "12px",
                fontSize: "12px",
                color: "#6b7280",
                textAlign: "center",
              }}
            >
              📍 {marker.lat.toFixed(4)}, {marker.lng.toFixed(4)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
