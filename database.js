const mongoose=require('mongoose')

    mongoose.connect('mongodb://localhost:27017/passport')
  

const userschema = mongoose.Schema({
    username:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    }
});
const UserModel = mongoose.model('User' , userschema)   

module.exports =  UserModel
