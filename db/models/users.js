
const mongoose = require("mongoose")


const userSchema = new mongoose.Schema({
        name:{
            type: String,
            required: true,
            lowercase: true
          },
          email: {
            type: String,
            required: true,
            lowercase: true,
            unique: true
          },
          password: {
            type: String
          },
          googleId:{
            type: String
          },
          githubId:{
            type: String
          },
          picture:{
            type: String,
            required: true,
            default: '/img/fotka.png'
          },
          age: {
            type: Number,
            default: 18
          }
})

// userSchema.pre('save', function(next) {
//     this.name += " Brzuszysko";
//     next();
// })
const User = mongoose.model('User', userSchema)
module.exports = User;