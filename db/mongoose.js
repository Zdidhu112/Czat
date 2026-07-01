const mongoose = require('mongoose')
require('dotenv').config()
const url = process.env.DB_ACCESS;

mongoose.connect(url)
