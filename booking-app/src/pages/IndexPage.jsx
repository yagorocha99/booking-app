import axios from "axios";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Image from "../Image.jsx";


export default function IndexPage() {
  const [places, setPlaces] = useState([]);

  useEffect(() => {
    axios.get('/places', { withCredentials: true })
       .then(response => {
         setPlaces(response.data);
       })
       .catch(error => {
         console.error('Error fetching places:', error);
       });
 }, []);
  
  return (
      <div className="mt-8 grid gap-x-6 gap-y-8 grid-cols-2 md:grid-cols-3 lg:grid-cols-3">
        {places.length > 0 && places.map(place => (
          <div key={place._id}>
            <Link to={'/place/'+place._id}>
              <div className="mb-2 rounded-2xl flex">
                {place.photos?.[0] && (
                  <Image className="rounded-2xl object-cover aspect-square" src={place.photos?.[0]} alt=""/>
                )}
              </div>
              <h2 className="font-bold">{place.address}</h2>
              <h3 className="text-sm text-gray-500">{place.title}</h3>
              <div className="mt-1">
                <span className="font-bold">${place.price} per night</span>
              </div>
            </Link>
          </div>
        ))}
      </div>
    );
  }
  
