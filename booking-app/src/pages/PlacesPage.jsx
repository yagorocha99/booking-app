import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import Perks from "../Perks";
import axios from "axios";

export default function PlacesPage(){
    const {action} = useParams();
    const [title, setTitle] = useState('');
    const [address, setAddress] = useState('');
    const [addedPhotos, setAddedPhotos] = useState([]);
    const [photoLink, setPhotoLink] = useState('');
    const [description, setDescription] = useState('');
    const [perks, setPerks] = useState([]);
    const [extraInfo, setExtraInfo] = useState('');
    const [checkIn, setCheckIn] = useState('');
    const [checkOut, setCheckOut] = useState('');
    const [maxGuests, setMaxGuests] = useState(1);

    function inputHeader(text){
        return(
            <h2 className="text-2xl mt-4">{text}</h2>
        )
    }

    function inputDescription(text) {
        return (
            <p className="text-gray-500 text-sm">{text}</p>
        );
    }

    function preInput(header, description) {
        return (
            <>
                {inputHeader(header)}
                {inputDescription(description)}            
            </>
        );
    }

    async function addPhotoByLink(ev) {
        ev.preventDefault();
        const {data:filename} = await axios.post('/upload-by-link' , {link: photoLink});
        setAddedPhotos(prev => {
            return [...prev, filename];
        });
        setPhotoLink('');
    }

    function uploadPhoto(ev) {
        const files = ev.target.files;
        console.log({files});
    }

    return (
        <div>
            {action !== 'new' && (
                <div className="text center">
                    <Link className="inline-flex gap-1 bg-primary text-white py-2 px-6 rounded-full" to={'/account/places/new'}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                            <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 9a.75.75 0 0 0-1.5 0v2.25H9a.75.75 0 0 0 0 1.5h2.25V15a.75.75 0 0 0 1.5 0v-2.25H15a.75.75 0 0 0 0-1.5h-2.25V9Z" clipRule="evenodd" />
                        </svg>
                        Add new place
                    </Link>
                </div>
            )}
            {action === 'new' && (
                <div>
                    <form>
                        {preInput('Title', 'Title for your place, should be short and catchy as in advertisement')}
                        <input value={title} 
                               onChange={ev => setTitle(ev.target.value)} 
                               type="text" placeholder="title, for example: My lovely apt" />
                        {preInput('Address', 'Address to this place')}
                        <input value={address} 
                               onChange={ev => setAddress(ev.target.value)} 
                               type="text" placeholder="address" />
                        {preInput('Photos', 'more = better')}
                        <div className="flex gap-2">
                            <input value={photoLink} 
                                   onChange={ev => setPhotoLink(ev.target.value)} 
                                   type="text" placeholder={'Add using a link ....jpg'} />
                            <button onClick={addPhotoByLink} className="bg-gray-200 px-4 rounded-2xl">Add&nbsp;photo</button>
                        </div>
                        <div className="mt-2 grid gap-2 grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                            {addedPhotos.length > 0 && addedPhotos.map((link, index) => (
                                <div key={index}>
                                    <img className="rounded-2xl" src={`http://localhost:4000/uploads/${link}`} alt="" />
                                </div>
                            ))}
                            <label className="cursor-pointer flex items-center gap-1 justify-center border bg-transparent rounded-2xl p-2 text-2xl text-gray-600">
                                <input type="file" className="hidden" onChange={uploadPhoto}/>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18 19.5H6.75Z" />
                                </svg>
                                Upload
                            </label>
                        </div>
                        {preInput('Description', 'description of the place')}
                        <textarea value={description} 
                                  onChange={ev => setDescription(ev.target.value)} />
                        {preInput('Perks', 'select all the perks of your place')}
                        <div className="grid mt-2 gap-2 grid-cols-2 md:grid-cols-4 lg:grid-cols-6">
                            <Perks selected={perks} onChange={setPerks} />
                        </div>
                        {preInput('Extra info', 'house rules, etc')}
                        <textarea value={extraInfo} 
                                  onChange={ev => setExtraInfo(ev.target.value)}/>
                        {preInput('Check in & out times', 'add check in and out times, remember to have some time window fow cleaning the room between guests')}
                        <div className="grid gap-2 grid-cols-2 md:grid-cols-4">
                            <div>
                                <h3 className="mt-2 -mb1">Check in time</h3>
                                <input value={checkIn} 
                                       onChange={ev => setCheckIn(ev.target.value)} 
                                       type="text" placeholder="14"/>
                            </div>
                            <div>
                                <h3 className="mt-2 -mb1">Check out time</h3>
                                <input value={checkOut} 
                                       onChange={ev => setCheckOut(ev.target.value)} 
                                       type="text" placeholder="11"/>
                            </div>
                            <div>
                                <h3 className="mt-2 -mb1">Max number of guests</h3>
                                <input value={maxGuests} 
                                       onChange={ev => setMaxGuests(ev.target.value)} 
                                       type="number" placeholder="4"/>
                            </div>
                        </div>
                        <button className="primary my-4">Save</button>
                    </form>
                </div>
            )}
        </div>
    )
}