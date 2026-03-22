const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
const Product = require('./model/productModel');
const app = require('./app');
const fs = require('fs');

const DB = process.env.DATABASE.replace(
	'<db_password>',
	process.env.DATABASE_PASSWORD,
);
console.log(DB);
mongoose.connect(DB).then(() => {
	console.log('DB connected succesfully!');
});
// READ JSON FILE
const products = JSON.parse(
	fs.readFileSync(`${__dirname}/data/products.json`, 'utf-8'),
);
// IMPORT DATA INTO DB
const importData = async () => {
	try {
		await Product.create(products);
		console.log('Data successfully loaded!');
	} catch (err) {
		console.log(err);
	}
	process.exit();
};
// DELETE ALL DATA FROM DB
const deleteData = async () => {
	try {
		await Product.deleteMany();
		console.log('Data successfully deleted!');
	} catch (err) {
		console.log(err);
	}
	process.exit();
};

// EXPORT DATA FROM DB TO JSON FILE
const exportData = async () => {
    try {
        // Fetch all products from database
        const products = await Product.find();
        
        // Convert to JSON with pretty formatting
        const jsonData = JSON.stringify(products, null, 2);
        
        // Write to file
        const filePath = `${__dirname}/data/products_export.json`;
        fs.writeFileSync(filePath, jsonData, 'utf-8');
        
        console.log(`✅ Successfully exported ${products.length} products to: ${filePath}`);
        console.log(`📁 File saved at: ${filePath}`);        
    } catch (err) {
        console.log('❌ Error exporting data:', err);
    }
    process.exit();
};

// UPDATE COMMAND HANDLER
if (process.argv[2] === '--import') {
    importData();
} else if (process.argv[2] === '--delete') {
    deleteData();
} else if (process.argv[2] === '--export') {
    exportData();
} else {
    console.log(`
┌─────────────────────────────────────────────────┐
│  Product Database CLI Tool                      │
├─────────────────────────────────────────────────┤
│  Commands:                                      │
│  --import          Import data from JSON file   │
│  --delete          Delete all data from DB      │
│  --export          Export DB data to JSON file  │
└─────────────────────────────────────────────────┘
    `);
}
