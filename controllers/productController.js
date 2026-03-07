// controllers/productController.js

const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../data/products.json');

// Read products
const getProducts = () => {
  try {
    return JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
  } catch (err) {
    console.error('Error reading products:', err);
    return [];
  }
};

// Middleware to check request body for create/update
exports.checkBody = (req, res, next) => {
  const isPatch = req.method === 'PATCH';

  // Reuse the existing helper logic but integrated
  const { name, price, category, description, seller } = req.body;

  if (!isPatch) {
    // For POST: all fields required
    if (!name || !price || !category || !description || !seller) {
      return res.status(400).json({
        status: 'fail',
        message: 'All fields are required'
      });
    }
  } else {
    // For PATCH: at least one field present
    if (name === undefined && price === undefined && category === undefined && description === undefined && seller === undefined) {
      return res.status(400).json({
        status: 'fail',
        message: 'At least one field must be provided'
      });
    }
  }

  // Additional validation for price if present
  if (price !== undefined) {
    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      return res.status(400).json({
        status: 'fail',
        message: 'Price must be a valid positive number'
      });
    }
    // Optionally attach parsed price to body for later use?
    req.body.price = parsedPrice; // but careful, it might be string originally
  }

  next();
};

// Middleware to check ID
exports.checkID = (req, res, next, val) => {
  const products = getProducts();
  const id = parseInt(val);

  if (isNaN(id)) {
    return res.status(400).json({
      status: 'fail',
      message: 'Invalid ID format'
    });
  }

  const productIndex = products.findIndex(p => p.id === id);

  if (productIndex === -1) {
    return res.status(404).json({
      status: 'fail',
      message: `No product found with ID ${id}`
    });
  }

  req.products = products;           // store full array
  req.productIndex = productIndex;   // store index
  req.product = products[productIndex]; // store product

  next();
};

// GET /api/v1/products
exports.getAllProducts = (req, res) => {
  const products = getProducts();

  res.status(200).json({
    status: 'success',
    results: products.length,
    data: { products }
  });
};

// GET /api/v1/products/:id
exports.getProduct = (req, res) => {
  res.status(200).json({
    status: 'success',
    data: { product: req.product }
  });
};

// POST /api/v1/products
exports.createProduct = (req, res) => {
  const { name, price, category, description, seller } = req.body;
  const priceValue = String(price).trim();
  const parsedPrice = parseFloat(priceValue);
  if (isNaN(parsedPrice) || parsedPrice < 0) {
    return res.status(400).json({
      status: 'fail',
      message: 'Price must be a valid positive number'
    });
  }

  const products = getProducts();
  const maxId = products.length > 0 ? Math.max(...products.map(p => p.id)) : 0;

  const newProduct = {
    id: maxId + 1,
    name: name.trim(),
    price: parsedPrice,
    category: category.trim(), // Store as number, not string
    description: description.trim(),
    seller: seller.trim(),
  };

  try {
    products.push(newProduct);
    fs.writeFileSync(dataPath, JSON.stringify(products, null, 2));

    res.status(201).json({
      status: 'success',
      data: { product: newProduct }
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to save product'
    });
  }
};

// PATCH /api/v1/products/:id
exports.updateProduct = (req, res) => {
  const product = req.product;
  const products = req.products;

  const allowedFields = ['name', 'price', 'category', 'description', 'seller'];
  
  // Use a for loop instead of forEach to allow proper function exit
  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      
      // Handle price validation
      if (field === 'price') {
        const priceValue = String(req.body.price).trim();
        const parsedPrice = parseFloat(priceValue);
        if (isNaN(parsedPrice) || parsedPrice < 0) {
          return res.status(400).json({
            status: 'fail',
            message: 'Price must be a valid positive number'
          });
        }
        product.price = parsedPrice;
      } 
      
      // Handle other fields (name, description, seller)
      else {
        product[field] = req.body[field];
      }
    }
  }

  try {
    fs.writeFileSync(dataPath, JSON.stringify(products, null, 2));

    res.status(200).json({
      status: 'success',
      data: { product }
    });
  } catch (err) {
    console.error('Error updating product:', err);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update product'
    });
  }
};

// DELETE /api/v1/products/:id
exports.deleteProduct = (req, res) => {
  const products = req.products;
  const id = req.product.id;

  products.splice(req.productIndex, 1);

  try {
    fs.writeFileSync(dataPath, JSON.stringify(products, null, 2));

    // Use 200 instead of 204 to allow response body
    res.status(200).json({
      status: 'success',
      message: `Product with ID ${id} deleted successfully`,
      data: null
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete product'
    });
  }
};