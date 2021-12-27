import { useCallback, useEffect, useState } from 'react';
import { FLIGHTS_API_URL } from '../constants';
import { Flight } from '../types';

export const useFlightsApi = () => {
  const [flights, setFlights] = useState<Flight[]>();

  useEffect(() => {
    fetch(FLIGHTS_API_URL)
      .then((r) => r.json())
      .then((result) => {
        setFlights(result.flights);
      });
  }, []);

  const getFlightByNumber = useCallback(
    (flightNumber: string) =>
      flights?.find((f) => f.flightNumber === flightNumber),
    [flights]
  );

  return { flights, getFlightByNumber };
};
