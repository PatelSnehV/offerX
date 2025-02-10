// const passport = require("passport");
// const LocalStrategy = require("passport-local").Strategy;

// const UserModel = require("./database");
// const { compareSync } = require("bcrypt");
// passport.use(
//   new LocalStrategy(function (username, password, done) {
//     UserModel.findOne({ username: username }, function (err, user) {
//       if (err) {
//         return done(err);
//       }
//       if (!user) {
//         return done(null, false);
//       }
//       if (!compareSync(password ,user.password)) {
//         return done(null, false);
//       }

//       return done(null, user);
//     });
//   })
// );
// passport.serializeUser((user,done) => {
//     done(null,user.id)
// })
// passport.deserializeUser((id,done) => {
//     UserModel.findById(id).then(user => {
//         done(null,user)
//     })
// })

// in newer version of mongoose we have to use async await instead of callback
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const UserModel = require("./database");
const { compareSync } = require("bcrypt");

passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const user = await UserModel.findOne({ username }); // ✅ Use async/await instead of callback

      if (!user) {
        return done(null, false, { message: "User not found" });
      }

      if (!compareSync(password, user.password)) {
        return done(null, false, { message: "Incorrect password" });
      }

      return done(null, user);
    } catch (err) {
      return done(err);
    }
  })
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await UserModel.findById(id); // ✅ Use async/await
    done(null, user);
  } catch (err) {
    done(err);
  }
});
