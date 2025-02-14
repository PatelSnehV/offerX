const express = require("express");
const { hashSync } = require("bcrypt");
const UserModel = require("./database");
const session = require("express-session");
const mongostore = require("connect-mongo");
const passport = require("passport");
const flash = require("connect-flash");
const app = express();

require("./passport"); // Import passport file

// Middleware for parsing JSON and urlencoded form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// EJS template engine setup
app.set("view-engine", "ejs");

// Session middleware
app.use(
  session({
    secret: "keyboard cat",
    saveUninitialized: true,
    resave: false,
    store: mongostore.create({
      mongoUrl: "mongodb://localhost:27017/passport",
      collectionName: "sessions",
    }),
    cookie: { maxAge: 1000 * 60 * 60 * 24 * 7 }, // 1 week
  })
);

app.use(flash());
// Middleware for passport and flash messages
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

// Home Route
// app.get("/", (req, res) => {
//   res.render("index.ejs");
// });

// Register Page
app.get("/", (req, res) => {
  res.render("heroPage.ejs", {
    errorMessage: req.flash("error"),
    successMessage: req.flash("success"),
  });
});
app.get('/logout', async (req, res, next) => {
  try {
    if (!req.isAuthenticated()) {
      return res.redirect('/'); // Redirect if no user is logged in
    }

    // Delete the logged-in user's record from the database
    await UserModel.findOneAndDelete({ _id: req.user._id });

    // Log out the user and destroy the session
    req.logout((err) => {
      if (err) {
        return next(err);
      }
      req.session.destroy(() => {
        res.redirect('/');
      });
    });
  } catch (error) {
    console.error("Error during logout and delete:", error);
    req.flash("error", "An error occurred while logging out.");
    res.redirect('/');
  }
});

app.post('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect('/');
  });
});

app.get("/FAQs", (req, res) => {
  res.render("FAQs.ejs", {
    errorMessage: req.flash("error"),
    successMessage: req.flash("success"),
  });
});
app.get("/about", (req, res) => {
  res.render("about.ejs", {
    errorMessage: req.flash("error"),
    successMessage: req.flash("success"),
  });
});
app.get("/blog", (req, res) => {
  res.render("blog.ejs", {
    errorMessage: req.flash("error"),
    successMessage: req.flash("success"),
  });
});

// Login Page (Now Displays Flash Messages)

app.get("/login", (req, res) => {
  res.render("login.ejs", {
    errorMessage: req.flash("error"),
    successMessage: req.flash("success"),
  });
});
app.get("/FAQs", (req, res) => {
  res.render("FAQs.ejs", {
    errorMessage: req.flash("error"),
    successMessage: req.flash("success"),
  });
});
// ✅ Fixed Login Route with Error Handling
app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/dashboard",
    failureRedirect: "/login", // Redirect back to login if failed
    failureFlash: true, // Enable flash messages
  })
);

//  Page (Only for Authenticated Users)
app.get("/dashboard", (req, res) => {
  if (req.isAuthenticated()) {
    res.render("dashboard.ejs", { username: req.user.username });
  } else {
    res.status(401).send("Unauthorized. Please log in.");
  }
});

// Register Route

app.post("/", async (req, res, next) => {
  console.log("Received Data:", req.body);

  // Check if the user already exists
  const existingUser = await UserModel.findOne({ username: req.body.username });

  if (existingUser) {
    req.flash("error", "You are already registered. Please log in.");
    return res.redirect("/login"); // Redirect to login page if user exists
  }

  // Create a new user
  const user = new UserModel({
    username: req.body.username,
    password: hashSync(req.body.password, 10),
  });

  user
    .save()
    .then((user) => {
      console.log("User saved:", user);

      // Automatically log in the user after successful registration
      req.login(user, (err) => {
        if (err) {
          console.log("Login error:", err);
          req.flash("error", "There was an error logging you in.");
          return res.redirect("/");
        }
        return res.redirect("/dashboard"); // Redirect after login
      });
    })
    .catch((err) => {
      console.log("Error saving user:", err);
      req.flash("error", "There was an error during registration.");
      res.redirect("/");
    });
});

app.listen(3000, () => console.log("Server running on http://localhost:3000"));
