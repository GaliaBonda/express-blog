import express from "express";
import stripeInstance from "../helpers/stripe";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const priceId = req.query.price;
    const quantity = req.query.quantity;
    if (!priceId || typeof priceId !== "string") {
      res.status(400).send("Price ID is invalid");
      return;
    }
    if (!quantity || typeof quantity !== "string") {
      res.status(400).send("Quantity is invalid");
      return;
    }
    const session = await stripeInstance.checkout.sessions.create({
      line_items: [
        {
          price: priceId,
          quantity: +quantity,
        },
      ],
      mode: "payment",
      success_url: `${process.env.WEB_URL}?success=true`,
      cancel_url: `${process.env.WEB_URL}?canceled=true`,
    });
    res.send(session.url);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error, success: false });
  }
});

export default router;
