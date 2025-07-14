import express from "express";
import { ProductCategory } from "../models/product-category";

const router = express.Router();

router.get("/", async (req, res) => {
  const cats = await ProductCategory.find();
  if (!cats) {
    res.status(500).json({ success: false });
  }
  res.status(200).send(cats);
});
router.get("/:id", async (req, res) => {
  const cat = await ProductCategory.findById(req.params.id);
  if (!cat) {
    res.status(404).json({ success: false });
  }
  res.status(200).send(cat);
});

router.post("/", async (req, res): Promise<void> => {
  const newCat = req.body;
  console.log(newCat);
  const cat = new ProductCategory({
    title: req.body.title,
    icon: req.body.icon,
    color: req.body.color,
  });
  try {
    const createdCat = await cat.save();

    if (!createdCat) {
      res.status(404).send("The product category cannot be created");
      return;
    }

    res.status(201).json(createdCat);
  } catch (error) {
    res.status(500).json({ error, success: false });
  }
});

router.put("/:id", async (req, res): Promise<void> => {
  const cat = await ProductCategory.findByIdAndUpdate(
    req.params.id,
    { title: req.body.title, icon: req.body.icon, color: req.body.color },
    { new: true },
  );
  if (!cat) {
    res.status(400).send("Product category cannot be updated");
    return;
  }
  res.send(cat);
});

router.delete("/:id", (req, res) => {
  ProductCategory.findByIdAndDelete(req.params.id)
    .then((deletedCat) => {
      if (deletedCat) {
        return res.status(200).json({ success: true, message: "Product category is deleted" });
      } else {
        res.status(404).json({ success: false, message: "Product category not found" });
      }
    })
    .catch((error) => {
      console.log(error);
      return res.status(400).json({ success: false, error });
    });
});

export default router;
