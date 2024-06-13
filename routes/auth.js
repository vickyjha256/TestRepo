const express = require('express');
const User = require('../models/User');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const otpgenerator = require('otp-generator');


const JWT_SECRET_KEY = "App_Authorization"; // This is for testing on local host.

// ROUTE 1:--> Create a user using: POST "/api/users/register".
router.post('/register', [
    body('fname', 'Please enter a valid first name !!').isLength({ min: 3 }),
    body('lname', 'Please Enter a valid last name !!').isLength({ min: 3 }),
    body('email', 'Please Enter a valid Email !!').isEmail().normalizeEmail().toLowerCase(),
    body('password', 'Password must contain atleast one uppercase, one lowercase, one number and one special character.')
        .isLength({ min: 5 }).isStrongPassword()
], async (req, res) => {
    let success = false;

    // Finds the validation errors and store it in errors.
    const errors = validationResult(req);
    if (!errors.isEmpty()) { // It returns error 400 bad request if error occured.
        return res.status(400).json({ success, errors: errors.array() });
    }

    try {
        // Check whether the user with this email exists already.
        let user = await User.findOne({ email: req.body.email });
        if (user) { // if already exist it will return response as a bad request.
            return res.status(400).json({ success, error: 'Sorry, user already exists with this email !!' });
        }


        const salt = await bcrypt.genSalt(10); // This is for generating hash value of 10.
        const secPassWord = await bcrypt.hash(req.body.password, salt); // It will generate the encrypted password.


        user = await User.create({ // It creates new user in the database.
            firstname: req.body.fname,
            lastname: req.body.lname,
            email: req.body.email,
            password: secPassWord,
        });


        success = true;
        res.json({ success });
    } catch (error) {
        console.error(err.message);
        res.status(500).send("Some error occurred.");
    }
});


// ROUTE 2:--> Authenticate a user using: POST "/api/users/login". No login required.
router.post('/login', [
    body('email', 'Please Enter a valid Email !!').isEmail().normalizeEmail().toLowerCase(),
    body('password', 'Password field cannot be empty.').exists(),
], async (req, res) => {
    let success = false;

    // Finds the validation errors and store it in errors.
    const errors = validationResult(req);
    if (!errors.isEmpty()) { // It returns error 400 bad request if error occured.
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body; // Get the values from request body using destructuring.
    try {
        // Below code check whether the user with this email exists or not.
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: 'Please enter correct email and password.' });
        }

        const passwordCompare = await bcrypt.compare(password, user.password) // It compares the entered password with database's password.
        if (!passwordCompare) {
            return res.status(400).json({ error: 'Please enter correct email and password.' });
        }

        const data = {
            id: user.id
        }
        const authtoken = jwt.sign(data, JWT_SECRET_KEY); // It will generate the token using user.id and secret key.

        success = true;
        res.json({ success, authtoken });
    } catch (error) {
        console.error(err.message);
        res.status(500).send("Internal Server Error.");
    }
});

// ROUTE 3:--> Get Logged in user details using: POST "/api/users/"
router.get('/', async (req, res) => {
    try {
        // let userId = req.user.id;
        const user = await User.findById(req.user.id).select("-password"); // It will get user details except password.
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Internal Server Error.");
    }
});


module.exports = router;