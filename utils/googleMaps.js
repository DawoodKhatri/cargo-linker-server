export const getPlacesFromAddress = async (address) => {
  const places = (
    await (
      await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?key=${process.env.GOOGLE_MAPS_API_KEY}&address=${address}`
      )
    ).json()
  ).results;

  return places;
};

export const getEncodedPolylines = async (origin, destination) => {
  const polylinePoints = (
    await (
      await fetch(`https://routes.googleapis.com/directions/v2:computeRoutes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": process.env.GOOGLE_MAPS_API_KEY,
          "X-Goog-FieldMask": "routes.polyline.encodedPolyline",
        },
        body: JSON.stringify({
          origin: {
            location: {
              latLng: { latitude: origin.lat, longitude: origin.long },
            },
          },
          destination: {
            location: {
              latLng: {
                latitude: destination.lat,
                longitude: destination.long,
              },
            },
          },
        }),
      })
    ).json()
  ).routes;

  if (!polylinePoints || !polylinePoints.length) return [];

  return polylinePoints[0].polyline.encodedPolyline;
};
