// controllers/productController.js
const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../data/products.json');

const Product = require('../model/productModel');
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
				message: 'All fields are required',
			});
		}
	} else {
		// For PATCH: at least one field present
		if (
			name === undefined &&
			price === undefined &&
			category === undefined &&
			description === undefined &&
			seller === undefined
		) {
			return res.status(400).json({
				status: 'fail',
				message: 'At least one field must be provided',
			});
		}
	}

	// Additional validation for price if present
	if (price !== undefined) {
		const parsedPrice = parseFloat(price);
		if (isNaN(parsedPrice) || parsedPrice < 0) {
			return res.status(400).json({
				status: 'fail',
				message: 'Price must be a valid positive number',
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
			message: 'Invalid ID format',
		});
	}

	const productIndex = products.findIndex((p) => p.id === id);

	if (productIndex === -1) {
		return res.status(404).json({
			status: 'fail',
			message: `No product found with ID ${id}`,
		});
	}

	req.products = products; // store full array
	req.productIndex = productIndex; // store index
	req.product = products[productIndex]; // store product

	next();
};

// GET /api/v1/products
exports.getAllProducts = async (req, res) => {
	try {
    const products = await Product.find();
		res.status(200).json({
			status: 'success',
			requestedAt: req.requestTime,
			results: products.length,
			data: { products },
		});
	} catch (err) {
		res.status(404).JSON({
			status: 'fail',
			message: err,
		});
	}
};

// GET /api/v1/products/:id
exports.getProduct = async (req, res) => {
	try {
		const product = await Product.findById(req.params.id);

		res.status(200).json({
			status: 'success',
			data: { product },
		});
	} catch (err) {
		res.status(400).json({
			status: 'fail',
			message: 'Invalid data sent!',
		});
	}
};

// POST /api/v1/products
exports.createProduct = async(req, res) => {
	try {
    const newProduct = await Product.create(req.body);
    res.status(201).json({
      status: 'success',
      data: { product: newProduct },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

// PATCH /api/v1/products/:id
exports.updateProduct = async (req, res) => {
	try{
    const tour  = await Product.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
    });
    res.status(200).json({
        status: 'success',
        data: { tour },
    });
  }catch(err){
    res.status(400).json({
        status: 'fail',
        message: err,
    });
  }
};

// DELETE /api/v1/products/:id
exports.deleteProduct = async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.status(200).json({
      status: 'success',
      message: `Product with ID ${req.params.id} deleted successfully`,
      data: null,
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};
