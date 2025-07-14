import express from "express";
import { User } from "../models/user";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import speakeasy from "speakeasy";
import qrcode from 'qrcode'

const router = express.Router();

router.get("/", async (req, res) => {
  const users = await User.find().select("-passwordHash");
  if (!users) {
    res.status(500).json({ success: false });
  }
  res.status(200).send(users);
});

router.post("/login", async (req, res) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    res.status(400).send("The user not found");
    return;
  }

  const passwordCompareRes = bcrypt.compareSync(
    req.body.password,
    user.passwordHash
  );
  if (passwordCompareRes) {
    const token = jwt.sign(
      {
        userId: user.id,
        isAdmin: user.isAdmin,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1w" }
    );
    res.status(200).send({ user: user.email, token });
  } else {
    res.status(400).send("Wrong password");
  }

  router.get("/:id", async (req, res) => {
    const user = await User.findById(req.params.id).select("-passwordHash");
    if (!user) {
      res.status(404).json({ success: false });
    }
    res.status(200).send(user);
  });
});

router.get("/count", async (req, res) => {
  const usersCount = await User.countDocuments();
  if (usersCount === undefined) {
    res.status(500).json({ success: false });
  }
  res.status(200).send({ usersCount });
});
router.get("/generate-secret", async (req, res) => {
   const { userId } = req.body;
const secret = speakeasy.generateSecret({ length: 20 });

const user = await User.findByIdAndUpdate(
    userId,
    {
      secret2fa: secret.base32, enabled2fa: true
    },
    { new: true },
  ); 
console.log('updated user', user)
    
    const qr = await qrcode.toDataURL(secret.otpauth_url);

    res.status(201).json({ secret: secret.base32, qrCodeUrl: qr });
    
});
router.get("/verify", async (req, res) => {
   const { token, userId } = req.body;

    const user = await User.findById(userId).select("-passwordHash");
    if (!user) {
      res.status(404).json({ success: false });
    }
    const verified = speakeasy.totp.verify({
        secret: user.secret2fa,
        encoding: "base32",
        token,
        window: 1,
    });
    res.status(200).json({ success: verified });
});

router.put("/:id", async (req, res): Promise<void> => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    res.status(400).send("Invalid user ID");
  }
  

  const enabled2fa = !!req.body.enabled2fa;
  const name = req.body.name;
  let secret: speakeasy.GeneratedSecret | undefined = undefined;

  if (enabled2fa) {
    secret = speakeasy.generateSecret({ length: 20 });
    
  }

  // save the secret key to the user's document
    const user = await User.findByIdAndUpdate(
    req.params.id,
    {
      enabled2fa, secret2fa: secret.base32, name
    },
    { new: true },
  );
  if (!user) {
    res.status(400).send("User cannot be updated");
    return;
  }
  
  const qr = enabled2fa ? await qrcode.toDataURL(secret.otpauth_url ) : undefined;
  res.status(201).json({user, qr});
});

router.delete("/:id", (req, res) => {
  User.findByIdAndDelete(req.params.id)
    .then((deletedUser) => {
      if (deletedUser) {
        return res
          .status(200)
          .json({ success: true, message: "User is deleted" });
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
    passwordHash: bcrypt.hashSync(req.body.password, 10),
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
    passwordHash: bcrypt.hashSync(req.body.password, 10),
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
