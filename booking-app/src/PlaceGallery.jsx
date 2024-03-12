import { useState } from "react";
import PropTypes from 'prop-types';

export default function PlaceGallery({place}) {
    const [showAllPhotos, setShowAllPhotos] = useState(false);

    if (showAllPhotos) {
        return (
            <div className="bg-white z-50 min-h-screen overflow-auto">
                <div className="p-8 grid gap-4 justify-center">
                    <div>
                        <h2 className="text-3xl mr-48">Photos of {place.title}</h2>
                        <button onClick={() => setShowAllPhotos(false)} className="fixed right-12 top-8 flex gap-1 py-2 px-4 rounded-2xl shadow shadow-black bg-white text-black">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                            </svg>
                            Close photos
                        </button>
                    </div>
                    {place?.photos?.length > 0 && place.photos.map((photo, index) => {
                        return(
                            <>
                                <div key={`photo-${index}`} className="h-96">
                                    <img src={`http://localhost:4000/${photo}`} alt="" className="rounded object-cover w-full h-full" />
                                </div>
                            </>
                        )
                    })}
                </div>
            </div>
        );
    }

    return(
        <div className="flex justify-center items-center ">
            <div className="relative max-w-4xl">
                <div className="grid gap-2 grid-cols-[3fr_1fr] rounded-3xl overflow-hidden">  
                    <div>
                        {place.photos?.[0] && (
                            <div className="">
                                <img onClick={() => setShowAllPhotos(true)} className="h-full w-full object-cover" src={'http://localhost:4000/'+place.photos[0]} />
                            </div>
                        )}
                    </div>
                    <div className="grid gap-2 ">
                        {place.photos?.[1] && (
                            <img onClick={() => setShowAllPhotos(true)} className="h-full w-full object-cover" src={'http://localhost:4000/'+place.photos[1]} />
                        )}
                        <div className="overflow-hidden">
                            {place.photos?.[2] && (
                                <img onClick={() => setShowAllPhotos(true)} className="h-full w-full object-cover" src={'http://localhost:4000/'+place.photos[2]} />
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
        </div>
    )
}

PlaceGallery.propTypes = {
    place: PropTypes.shape({
        title: PropTypes.string.isRequired,
        photos: PropTypes.arrayOf(PropTypes.string),
    }).isRequired,
};
