const QRCode = require('qrcode');
const { MongoClient } = require('mongodb');

// MongoDB connection setup
const uri = 'mongodb://localhost:27017'; // Replace with your MongoDB URI
const client = new MongoClient(uri);
const dbName = 'cafeteria';
const collectionName = 'tables';

// Base URL (fixed for all QR codes)
const baseURL = 'https://smart-food-ordering.onrender.com/';
const tableNumbers = [1, 2, 3, 4, 5, 6, 7];

// Function to connect to MongoDB and log table data
async function logToDatabase(tableNumber, tableURL) {
    try {
        // Connect to MongoDB
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection(collectionName);

        // Create an entry for the table
        const entry = {
            tableNumber,
            tableURL,
            createdAt: new Date(),
        };

        // Insert the entry into the database
        await collection.insertOne(entry);
        console.log(`Logged Table ${tableNumber} to MongoDB.`);
    } catch (err) {
        console.error(`Error logging Table ${tableNumber}:`, err);
    } finally {
        await client.close();
    }
}

// Generate QR codes and log to database
async function generateQRCodes() {
    for (const tableNumber of tableNumbers) {
        // Add query parameter for table identification
        const tableURL = `${baseURL}?table=${tableNumber}`;
        const fileName = `table${tableNumber}.png`; // Image file name for QR code

        try {
            // Generate QR code and save as image
            await QRCode.toFile(fileName, tableURL);
            console.log(`QR Code for Table ${tableNumber} generated.`);

            // Log the table details to MongoDB
            await logToDatabase(tableNumber, tableURL);
        } catch (err) {
            console.error(`Error with Table ${tableNumber}:`, err);
        }
    }

    console.log('QR codes generated and logged to MongoDB.');
}

// Run the QR code generator
generateQRCodes().catch((err) => console.error('Error generating QR codes:', err));
