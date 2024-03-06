import axios from "axios";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import BookingWidget from "../BookingWidget";

export default function PlacesPage() {
    const {id} = useParams();
    const [place, setPlace] = useState(null);
    const [showAllPhotos, setShowAllPhotos] = useState(false);
    useEffect(() => {
        if (!id) {
            return;
        }
        axios.get(`/places/${id}`).then(response => {
            setPlace(response.data);
        });
    }, [id]);

    if (!place) return '';

    if (showAllPhotos) {
        return (
            <div className="absolute inset-0 bg-black text-white min-h-screen">
                <div className="bg-black p-8 grid gap-4">
                    <div>
                        <h2 className="text-3xl mr-48">Photos of {place.title}</h2>
                        <button onClick={() => setShowAllPhotos(false)} className="fixed right-12 top-8 flex gap-1 py-2 px-4 rounded-2xl shadow shadow-black bg-white text-black">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                            </svg>
                            Close photos
                        </button>
                    </div>
                    {place?.photos?.length > 0 && place.photos.map(photo => {
                        <div>
                            <img src={'http//localhost:4000/uploads'+photo} alt="" />
                        </div>
                    })}
                </div>
            </div>
        );
    }

    return (
        <div className="mt-4 bg-gray-100 -mx-8 px-8 pt-4">
            <h1 className="text-3xl">{place.title}</h1>
            <a className="flex gap-1 my-3 font-semibold underline" target="_blank" href={'https://maps.google.com/?q='+place.address}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0Z" />
                </svg>
                {place.address}
            </a>
            <div className="relative">
                <div className="grid gap-2 grid-cols-[2fr_1fr rounded-3xl overflow-hidden"> 
                    <div>
                        {place.photos?.[0] && (
                            <div>
                                <img onClick={() => setShowAllPhotos(true)} className="aspect-square object-cover" src={'http://localhost:4000/uploads/'+place.photos[0]} />
                            </div>
                        )}
                    </div>
                    <div className="grid gap-2">
                        {place.photos?.[1] && (
                            <img onClick={() => setShowAllPhotos(true)} className="aspect-square object-cover" src={'http://localhost:4000/uploads/'+place.photos[1]} />
                        )}
                        <div className="overflow-hidden">
                            {place.photos?.[2] && (
                                <img onClick={() => setShowAllPhotos(true)} className="aspect-square object-cover relative top-2" src={'http://localhost:4000/uploads/'+place.photos[2]} />
                            )}
                        </div>
                    </div>
                </div>
                <button onClick={() => setShowAllPhotos(true)} className="flex gap-1 absolute bottom-2 right-2 py-2 px-4 bg-white rounded-2xl shadow-md shadow-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                    </svg>
                    Show more photos
                </button>
            </div>
            <div className="mt-8 mb-8 grid gap-8 grid-cols-1 md:grid-col-[2fr_1fr]">
                <div>
                    <div className="my-4">
                        <h2 className="font-semibold text-2xl">Description</h2>
                        {place.description}
                    </div>
                    Check-in: {place.checkIn}<br />
                    Check-out: {place.checkOut}<br />
                    Max number of guests: {place.maxGuests}<br />
                </div>
                <div>
                    <BookingWidget place= {place} />
                </div>
                <div className="bg-white -mx-8 px-8 py-8 border-t">
                    <div>
                        <h2 className="font-semibold text-2xl">Extra info</h2>
                    </div>
                </div>
                <div className="mb-4 mt-2 text-sm text-gray-700 leading-5">{place.extraInfo}</div>
            </div>
        </div>
    )
}