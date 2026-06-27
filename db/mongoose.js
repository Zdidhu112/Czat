const mongoose = require('mongoose')
require('dotenv').config()
const url = process.env.DB_ACCESS;
const dbname = process.env.DB_NAME;

mongoose.connect(url)
