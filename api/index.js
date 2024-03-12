const express = require('express');
const cors = require('cors');
const app = express();
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('./models/User.js');
const Place = require('./models/Place.js');
const Booking = require('./models/Booking.js');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const imageDownloader = require('image-downloader');
const multer = require('multer');
const fs = require('fs');
const { resolve } = require('path');
require('dotenv').config();

const bcryptSalt = bcrypt.genSaltSync(10);
const jwtSecret = process.env.JWT_SECRET || 'fasefrasd5465as4d654as65d4asdas';
//commit test
function getUserDataFromReq(req) {
    return new Promise((resolve, reject) => {
        jwt.verify(req.cookies.token, jwtSecret, (err, userData) => {
            if (err) {
                reject(err);
            } else {
                resolve(userData);
            }
        });
    });
}

app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(__dirname + '/uploads'));
app.use(cors({
    credentials: true,
    origin: 'https://booking-app-chi-amber.vercel.app',
}));

mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true });


app.get('/test', (req,res) => {
    res.json('test ok');
});

app.post('/register', async (req,res) =>{
    const {name,email,password} = req.body;

    if (!name.trim() || !email.trim() || !password.trim()) {
        return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    try{
        const userDoc = await User.create({
            name,
            email,
            password: bcrypt.hashSync(password, bcryptSalt),
        });
        res.json(userDoc);
    } catch (e) {
        res.status(422).json(e);
    }
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email.trim() || !password.trim()) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    try {
        const userDoc = await User.findOne({ email });
        if (userDoc) {
            const passOk = bcrypt.compareSync(password, userDoc.password);
            if (passOk) {
                jwt.sign({
                    email: userDoc.email,
                    id: userDoc._id,
                }, jwtSecret, {}, (err, token) => {
                    if (err) throw err;
                    res.cookie('token', token).json(userDoc);
                });
            } else {
                return res.status(401).json({ error: 'Incorrect password.' });
            }
        } else {
            return res.status(404).json({ error: 'User not found.' });
        }
    } catch (e) {
        return res.status(500).json({ error: 'Internal server error.' });
    }
});



app.get('/profile', (req,res) => {
    const {token} = req.cookies;
    if (token){
        jwt.verify(token, jwtSecret, {}, async (err, userData) => {
            if (err) throw err;
            const {name, email, _id} = await User.findById(userData.id);
            res.json({name, email,_id});
        });
    } else{
        res.json(null);
    }
})

app.post('/logout', (req, res) =>{
    res.cookie('token', '').json(true);
})

app.post('/upload-by-link', async (req,res) => {
    console.log(req.body);
    const {link} = req.body;
    if(!link){
        return res.status(400).json({ error: 'URL is required'});
    }
    const newName = Date.now() + '.jpg';
    try {
        await imageDownloader.image({
            url: link,
            dest: __dirname + '/uploads/' + newName,
        })
        res.json(newName);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to download image' });
    }
})

const photosMiddleware = multer({dest: 'uploads/'});
app.post('/upload', photosMiddleware.array('photos', 100), (req, res) => {
    const uploadedFiles = [];
    for (let i = 0; i <req.files.length; i++) {
        const {path, originalname} = req.files[i];
        const parts = originalname.split('.');
        const ext = parts[parts.length - 1];
        const newPath = path + '.' + ext;
        fs.renameSync(path, newPath);
        uploadedFiles.push(newPath.replace('upload/', ''));
    }
    res.json(uploadedFiles);
});

app.post('/places', (req, res) => {
    const {token} = req.cookies;
    const {
        title, address, addedPhotos, description,
        perks, extraInfo, checkIn, checkOut, maxGuests, price,
    } = req.body;
    jwt.verify(token, jwtSecret, {}, async (err, userData) => {
        if (err) throw err;
        const placeDoc = await Place.create({
            owner: userData.id, price,
            title, address, photos:addedPhotos, description,
            perks, extraInfo, checkIn, checkOut, maxGuests,
        });
        res.json(placeDoc);
    });
});

app.get('/places', async (req, res) => {
    const places = await Place.find();
    res.json(places);
});

app.get('/user-places', async (req, res) => {
    const { token } = req.cookies;
    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }
    try {
        jwt.verify(token, jwtSecret, {}, async (err, userData) => {
            if (err) throw err;
            const { id } = userData;
            const places = await Place.find({ owner: id });
            res.json(places);
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.get('/places/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const place = await Place.findById(id);
        if (!place) {
            return res.status(404).json({ message: 'Place not found.' });
        }
        res.json(place);
    } catch (error) {
        console.error('Error retrieving place:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});

app.get('/test-remove/:id', async (req, res) => {
    const placeId = req.params.id;
    try {
        const removedPlace = await Place.removeById(placeId);
        res.json({ message: 'Place removed successfully', place: removedPlace });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.delete('/places/:id', async (req, res) => {
    const placeId = req.params.id;
    try {
        const removedPlace = await Place.deleteOne({ _id: placeId });
        if (removedPlace.deletedCount === 0) {
            return res.status(404).json({ message: 'Place not found' });
        }

        const removedBookings = await Booking.deleteMany({ place: placeId });

        res.status(200).json({ 
            message: 'Place and associated bookings removed successfully', 
            place: removedPlace,
            bookings: removedBookings
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.delete('/bookings/:id', async (req, res) => {
    try {
        const result = await Booking.deleteOne({ _id: req.params.id });
        res.json(result);
    } catch (err) {
        res.status(500).send(err);
    }
});

app.get('/places', async (req, res) => {
    try {
        const places = await Place.find();
        res.json(places);
    } catch (error) {
        console.error('Error retrieving places:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});

app.put('/places', async (req, res) => {
    const { token } = req.cookies;
    if (!token) {
        return res.status(401).json({ message: 'Token not provided' });
    }

    jwt.verify(token, jwtSecret, {}, async (err, userData) => {
        if (err) {
            return res.status(401).json({ message: 'Invalid token' });
        }

        const {
            id, title, address, addedPhotos, description,
            perks, extraInfo, checkIn, checkOut, maxGuests, price,
        } = req.body;

        const placeDoc = await Place.findById(id);
        if (!placeDoc) {
            return res.status(404).json({ message: 'Place not found' });
        }

        if (userData.id !== placeDoc.owner.toString()) {
            return res.status(403).json({ message: 'Forbidden' });
        }

        placeDoc.set({
            title, address, photos: addedPhotos, description,
            perks, extraInfo, checkIn, checkOut, maxGuests, price,
        });

        await placeDoc.save();
        res.json('ok');
    });
});



app.post('/bookings', async (req, res) => {
   const userData = await getUserDataFromReq(req);
    const {
        place, checkIn, checkOut, numberOfGuests, name, phone, price,
    } = req.body;

    Booking.create({
        place, checkIn, checkOut, numberOfGuests, name, phone, price,
        user:userData.id,
    }).then((doc) => {
        res.json(doc);
    }).catch((err) => {
        console.error(err);
        res.status(500).json({ error: 'Failed to create booking' });
    });
    
});

app.get('/bookings', async (req, res) => {
    const userData = await getUserDataFromReq(req);
    res.json( await Booking.find({user:userData.id}).populate('place') );
});

app.listen(process.env.PORT || 4000, () => {
    console.log(`Server running on port ${process.env.PORT || 4000}`);
});