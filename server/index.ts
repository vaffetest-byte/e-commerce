import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { initDb } from './db.js';
import inventoryRoutes from './routes/inventory.js';
import { authenticateToken, requireAdmin } from './middleware/auth.js';
import adminRoutes from './routes/admin.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Load Routes
app.use('/api/admin', adminRoutes);

// Protect Inventory Write Routes (GET is public for store, but we might want admin view)
app.use('/api/products', (req, res, next) => {
    if (req.method === 'GET') return next(); // Public read
    authenticateToken(req, res as any, () => requireAdmin(req as any, res as any, next));
}, inventoryRoutes);

// Database Check & Start
initDb().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
        console.log(`Inventory API available at http://localhost:${PORT}/api/products`);
    });
});

export default app;
