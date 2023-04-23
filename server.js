const express = require('express');
const bodyparser = require('body-parser');
const mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var saltRouds = 10;
const app = express();
const port = 3000;
var User = require('./models/User');
const db = require('./setup/urls').url;

require("./strategies/jwtStrat")(passport);

app.use(passport.initialize());
app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());

mongoose
  .connect(db)
  .then(() => {
    console.log("Database is connected");
  })
  .catch(err => {
    console.log("Error is ", err.message);
  });

app.get('/', (req,res) => {
    res.status(200).send('works fine');
});

app.get(
    "/profile",
    passport.authenticate("jwt", { session: false }),
    (req, res) => {
      console.log(req);
      res.json({
        id: req.user.id,
        name: req.user.name
      });
    }
  );

app.post("/signup", async (req, res) => {
    var newUser = new User({
      name: req.body.name,
      password: req.body.password
    });
  
    await User.findOne({ name: newUser.name })
      .then(async profile => {
        if (!profile) {
          bcrypt.hash(newUser.password, saltRounds, async (err, hash) => {
            if (err) {
              console.log("Error is", err.message);
            } else {
              newUser.password = hash;
              await newUser
                .save()
                .then(() => {
                  res.status(200).send(newUser);
                })
                .catch(err => {
                  console.log("Error is ", err.message);
                });
            }
          });
        } else {
          res.send("User already exists...");
        }
      })
      .catch(err => {
        console.log("Error is", err.message);
      });
  });
app.post("/login", async (req, res) => {
    var newUser = {};
    newUser.name = req.body.name;
    newUser.password = req.body.password;
  
    await User.findOne({ name: newUser.name })
      .then(profile => {
        if (!profile) {
          res.send("User not exist");
        } else {
          bcrypt.compare(
            newUser.password,
            profile.password,
            async (err, result) => {
              if (err) {
                console.log("Error is", err.message);
              } else if (result == true) {
                //   res.send("User authenticated");
                const payload = {
                  id: profile.id,
                  name: profile.name
                };
                jsonwt.sign(
                  payload,
                  key.secret,
                  { expiresIn: 3600 },
                  (err, token) => {
                    res.json({
                      success: true,
                      token: "Bearer " + token
                    });
                  }
                );
              } else {
                res.send("User Unauthorized Access");
              }
            }
          );
        }
      })
      .catch(err => {
        console.log("Error is ", err.message);
      });
  });

app.listen(port, () => {
    console.log('server is listening to port 3000');
});