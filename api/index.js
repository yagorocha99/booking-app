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
require('dotenv').config();

const bcryptSalt = bcrypt.genSaltSync(10);
const jwtSecret = 'fasefrasd5465as4d654as65d4asdas';

app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(__dirname + '/uploads'));
app.use(cors({
    credentials: true,
    origin: 'http://localhost:5173'
}));

mongoose.connect(process.env.MONGO_URL)


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
        uploadedFiles.push(newPath.replace('uploads/', ''));
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

app.get('/places', (req,res) => {
    const { token } = req.cookies;
    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }
    jwt.verify(token, jwtSecret, {}, async (err, userData) => {
        const {id} = userData;
        res.json( await Place.find({owner:id}) );
    });
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
    const {id} = req.params;
    res.json(await Place.findById(id));
})

app.put('/places', async (req,res) => {
    const {token} = req.cookies;
    const {
        id, title, address, addedPhotos, description,
        perks, extraInfo, checkIn, checkOut, maxGuests, price,
    } = req.body;
    jwt.verify(token, jwtSecret, {}, async (err, userData) => {
        if (err) throw err;
        const placeDoc = await Place.findById(id);    
        if (userData.id === placeDoc.owner.toString()) {
            placeDoc.set({
                title, address, photos:addedPhotos, description,
                perks, extraInfo, checkIn, checkOut, maxGuests, price,
            })
            await placeDoc.save();
            res.json('ok');
        }
    });
});

app.get('/places', async (req, res) => {
    res.json( await Place.find() );
});

app.post('/bookings', (req, res) => {
    const {
        place, checkIn, checkOut, numberOfGuests, name, phone, price,
    } = req.body;
    Booking.create({
        place, checkIn, checkOut, numberOfGuests, name, phone, price,
    }).then((err, doc) => {
        res.json('doc');
    }).catch((err) => {
        throw err;
    });
});

app.listen(4000); 