import express from "express";
import { User } from "../models/user.js";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const router = express.Router();

router.get("/", async (req, res) => {
  const users = await User.find().select("-passwordHash");
  if (!users) {
    res.status(500).json({ success: false });
  }
  res.status(200).send(users);
});

router.post('/login', async (req, res) => {
  const user = await User.findOne({email: req.body.email})

  if (!user) {
    res.status(400).send('The user not found');
    return;
  }
   
   const passwordCompareRes = bcrypt.compareSync(req.body.password, user.passwordHash);
if (passwordCompareRes) {
  const token = jwt.sign({
    userId: user.id, 
    isAdmin: user.isAdmin,
  }, process.env.JWT_SECRET, {expiresIn: '1w'})
  res.status(200).send({user: user.email, token});
} else{
  res.status(400).send('Wrong password')
}

router.get("/:id", async (req, res) => {
  const user = await User.findById(req.params.id).select("-passwordHash");
  if (!user) {
    res.status(404).json({ success: false });
  }
  res.status(200).send(user);
});
})

router.get("/count", async (req, res) => {
  const usersCount = await User.countDocuments();
  if (usersCount === undefined) {
    res.status(500).json({ success: false });
  }
  res.status(200).send({ usersCount });
});

router.delete("/:id", (req, res) => {
  User.findByIdAndDelete(req.params.id)
    .then((deletedUser) => {
      if (deletedUser) {
        return res.status(200).json({ success: true, message: "User is deleted" });
      } else {
        res.status(404).json({ success: false, message: "User not found" });
      }
    })
    .catch((error) => {
      console.log(error);
      return res.status(400).json({ success: false, error });
    });
});

router.post("/", async (req, res): Promise<void> => {
  const newUser = req.body;
  console.log(newUser);
  const user = new User({
    name: req.body.name,
    email: req.body.email,
    passwordHash: bcrypt.hashSync(req.body.password, 10) ,
    isAdmin: req.body.isAdmin,
  });
  try {
    const createdUser = await user.save();

    if (!createdUser) {
      res.status(404).send("The user cannot be created");
      return;
    }

    res.status(201).json(createdUser);
  } catch (error) {
    res.status(500).json({ error, success: false });
  }
});
router.post("/register", async (req, res): Promise<void> => {
  const newUser = req.body;
  console.log(newUser);
  const user = new User({
    name: req.body.name,
    email: req.body.email,
    passwordHash: bcrypt.hashSync(req.body.password, 10) ,
    isAdmin: req.body.isAdmin,
  });
  try {
    const createdUser = await user.save();

    if (!createdUser) {
      res.status(404).send("The user cannot be created");
      return;
    }

    res.status(201).json(createdUser);
  } catch (error) {
    res.status(500).json({ error, success: false });
  }
});

export default router;
