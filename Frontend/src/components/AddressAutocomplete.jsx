import React, { useRef, useEffect } from "react";

const AddressAutocomplete = ({ onSelect }) => {
  const inputRef = useRef(null);

  useEffect(() => {
    if (!window.google) return;

    const autocomplete = new window.google.maps.places.Autocomplete(
      inputRef.current,
      {
        types: ["geocode"],
        componentRestrictions: { country: "vn" },
      }
    );

    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      if (place.geometry) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        onSelect({
          address: place.formatted_address,
          lat,
          lng,
        });
      }
    });
  }, []);

  return (
    <input
      type="text"
      ref={inputRef}
      placeholder="Địa chỉ (Google gợi ý)"
      className="p-2 border rounded w-full mb-4"
    />
  );
};

export default AddressAutocomplete;
