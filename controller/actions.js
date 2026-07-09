const User = require('./../db/models/users');

const createUser = async (data)=>{
  try {
  const user = new User(data);
  await user.save();
  console.log(user);
  } catch (error) {
    console.log(error);
     }
}

const findUsersAll = async()=>{
  try {
    const users = await User.find({});
    console.log(users);
  } catch (error) {
    console.log(error);
  }

}

const findUserByEmail= async(email)=>{
  try {
    const user = await User.findOne({ email: email }).exec();
    if(!user) return null;
    return user;
  } catch (error) {
    console.log(error);
  }
}

const findUserById= async(id)=>{
  try {
    const user = await User.findById(id).exec();
    return user;
  } catch (error) {
    console.log(error);
  }
}

module.exports = {createUser, findUsersAll, findUserByEmail, findUserById};