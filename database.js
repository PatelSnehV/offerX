const mongoose=require('mongoose')

    // mongoose.connect('mongodb://localhost:27017/passport')
    mongoose.connect('mongodb+srv://snehpatel1233:kC5RNSSx2rr82FR7@cluster0.ozbno.mongodb.net/passport?retryWrites=true&w=majority&appName=Cluster0')
  

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

// kC5RNSSx2rr82FR7