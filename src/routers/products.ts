import express from "express";
import { Product } from "../models/product";
import mongoose from "mongoose";
import stripeInstance from "../helpers/stripe";
import { ProductCategory } from "../models/product-category";

const router = express.Router();

router.get("/", async (req, res) => {
  const categories =
    req.query.categories && typeof req.query.categories === "string"
      ? req.query.categories?.split(",")
      : undefined;
  const productsList = await Product.find(
    categories ? { category: categories } : {}
  ).populate("category");
  res.send(productsList);
});

router.post("/", async (req, res): Promise<void> => {
  const category = await ProductCategory.findById(req.body.category);
  if (!category) {
    res.status(404).send("Category not found");
    return;
  }
  const productName = req.body.name;
  const productPrice = +req.body.price;

  try {
    const stripeProduct = await stripeInstance.products.create({
      name: productName,
    });

    const stripeProductId = stripeProduct.id;

    const price = await stripeInstance.prices.create({
      product: stripeProductId,
      unit_amount: productPrice,
      currency: "usd",
    });

    const product = new Product({
      name: productName,
      category: req.body.category,
      price: productPrice,
      stripeProductId,
      stripePriceId: price.id,
    });

    const createdProduct = await product.save();
    if (!createdProduct) res.status(500).json("The product cannot be created");

    res.status(201).json(createdProduct);
  } catch (error) {
    res.status(500).json({ error, success: false });
  }
});

router.put("/:id", async (req, res): Promise<void> => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      res.status(400).send("Invalid product ID");
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
      },
      { new: true }
    );
    if (!product) {
      res.status(400).send("Product cannot be updated");
      return;
    }
    await stripeInstance.products.update(product.stripeProductId, {
      name: req.body.name,
    });
    if (req.body.price) {
      await stripeInstance.prices.update(product.stripePriceId, {
        currency_options: { unit_amount_decimal: req.body.price },
      });
    }

    res.send(product);
  } catch (error) {
    res.status(500).json({ error, success: false });
  }
});

router.get("/count", async (req, res) => {
  const productsCount = await Product.countDocuments();
  if (productsCount === undefined) {
    res.status(500).json({ success: false });
  }
  res.status(200).send({ productsCount });
});

router.get("/:id", async (req, res) => {
  const product = await Product.findById(req.params.id).populate("category");
  if (!product) {
    res.status(404).json({ success: false });
  }
  res.status(200).send(product);
});

router.delete("/:id", (req, res) => {
  Product.findByIdAndDelete(req.params.id)
    .then((deletedProduct) => {
      if (deletedProduct) {
        stripeInstance.products.del(deletedProduct.stripeProductId);
        return res
          .status(200)
          .json({ success: true, message: "Product is deleted" });
      } else {
        res.status(404).json({ success: false, message: "Product not found" });
      }
    })
    .catch((error) => {
      console.log(error);
      return res.status(400).json({ success: false, error });
    });
});

export default router;
