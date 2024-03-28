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