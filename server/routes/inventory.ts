import express from 'express';
import { supabase } from '../db.js';

const router = express.Router();

// GET /api/products - List products with filters
router.get('/', async (req, res) => {
    try {
        const {
            page = 1,
            limit = 100,
            search,
            category,
            status,
            stockLevel,
            sortBy = 'created_at',
            sortOrder = 'desc'
        } = req.query;

        let query = supabase.from('products').select('*');

        // 1. Filter: Status
        if (status && status !== 'All') {
            query = query.eq('status', status);
        } else {
            query = query.neq('status', 'Archived');
        }

        // 2. Filter: Search
        if (search) {
            // ilike for case-insensitive search. OR syntax is: column.ilike.val,column2.ilike.val
            const term = `%${search}%`;
            query = query.or(`name.ilike.${term},sku.ilike.${term}`);
        }

        // 3. Filter: Category
        if (category && category !== 'All') {
            query = query.eq('category', category);
        }

        // 4. Filter: Stock Level
        if (stockLevel === 'Low') {
            query = query.gte('stock', 1).lt('stock', 10);
        } else if (stockLevel === 'Out') {
            query = query.eq('stock', 0);
        }

        // 5. Sorting
        let dbSortBy = sortBy as string;
        if (sortBy === 'createdAt') dbSortBy = 'created_at';

        // Supabase order: .order(column, { ascending: boolean })
        query = query.order(dbSortBy, { ascending: sortOrder === 'asc' });

        // 6. Pagination (optional, sticking to limit for now)
        // .range(start, end)

        const { data, error } = await query;

        if (error) throw error;

        res.json(data);
    } catch (error: any) {
        console.error('Error fetching products:', error);
        res.status(500).json({ error: error.message || 'Failed to fetch products' });
    }
});

// POST /api/products - Create Product
router.post('/', async (req, res) => {
    try {
        const { name, sku, price, stock, category, image, status } = req.body;

        // Existing SKU Check
        const { data: existing } = await supabase.from('products').select('id').eq('sku', sku).single();
        if (existing) {
            return res.status(400).json({ error: 'SKU already exists' });
        }

        const { data: product, error } = await supabase.from('products').insert({
            name,
            sku,
            price,
            stock,
            category,
            image_url: image,
            status: status || 'Draft',
            social_heat: Math.floor(Math.random() * 100)
        }).select().single();

        if (error) throw error;

        // Log Action
        await supabase.from('audit_logs').insert({
            product_id: product.id,
            action: 'CREATE',
            message: `Product Created: ${name} (${sku})`,
            admin_user: 'admin@seoulmuse.com'
        });

        res.status(201).json(product);
    } catch (error: any) {
        console.error('Error creating product:', error);
        res.status(500).json({ error: error.message || 'Failed to create product' });
    }
});

// PUT /api/products/:id - Update Product
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, sku, price, stock, category, image, status } = req.body;

        // Check if product exists (optional, update returns count)

        const { data: updated, error } = await supabase
            .from('products')
            .update({
                name,
                sku,
                price,
                stock,
                category,
                image_url: image,
                status,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        if (!updated) return res.status(404).json({ error: 'Product not found' });

        await supabase.from('audit_logs').insert({
            product_id: id,
            action: 'UPDATE',
            message: 'Product details updated',
            admin_user: 'admin@seoulmuse.com'
        });

        res.json(updated);
    } catch (error: any) {
        console.error('Error updating product:', error);
        res.status(500).json({ error: error.message || 'Failed to update product' });
    }
});

// PATCH /api/products/:id/stock - Stock Adjustment
router.patch('/:id/stock', async (req, res) => {
    const { id } = req.params;
    const { delta } = req.body;

    if (typeof delta !== 'number') {
        return res.status(400).json({ error: 'Invalid delta value' });
    }

    try {
        // Fetch current stock
        const { data: product, error: fetchError } = await supabase.from('products').select('stock').eq('id', id).single();
        if (fetchError || !product) throw new Error('Product not found');

        const newStock = Math.max(0, product.stock + delta);

        const { data: updated, error: updateError } = await supabase
            .from('products')
            .update({
                stock: newStock,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single();

        if (updateError) throw updateError;

        await supabase.from('audit_logs').insert({
            product_id: id,
            action: 'STOCK_ADJUST',
            message: `Stock adjusted by ${delta} (From ${product.stock} to ${newStock})`,
            admin_user: 'admin@seoulmuse.com'
        });

        res.json(updated);
    } catch (error: any) {
        console.error('Stock adjustment error:', error);
        res.status(500).json({ error: error.message || 'Stock update failed' });
    }
});

// DELETE /api/products/:id - Soft Delete (Archive)
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const { error } = await supabase
            .from('products')
            .update({ status: 'Archived' })
            .eq('id', id);

        if (error) throw error;

        await supabase.from('audit_logs').insert({
            product_id: id,
            action: 'ARCHIVE',
            message: 'Product archived (Soft Delete)',
            admin_user: 'admin@seoulmuse.com'
        });

        res.json({ success: true, message: 'Product archived' });
    } catch (error: any) {
        res.status(500).json({ error: error.message || 'Failed to archive product' });
    }
});

// GET /api/export/csv
router.get('/export/csv', async (req, res) => {
    try {
        const {
            search,
            category,
            status,
            stockLevel,
            sortBy = 'created_at',
            sortOrder = 'desc'
        } = req.query;

        let query = supabase.from('products').select('*');

        // Apply same filters as GET /
        if (status && status !== 'All') {
            query = query.eq('status', status);
        } else {
            query = query.neq('status', 'Archived');
        }

        if (search) {
            const term = `%${search}%`;
            query = query.or(`name.ilike.${term},sku.ilike.${term}`);
        }

        if (category && category !== 'All') {
            query = query.eq('category', category);
        }

        if (stockLevel === 'Low') {
            query = query.gte('stock', 1).lt('stock', 10);
        } else if (stockLevel === 'Out') {
            query = query.eq('stock', 0);
        }

        let dbSortBy = sortBy as string;
        if (sortBy === 'createdAt') dbSortBy = 'created_at';
        query = query.order(dbSortBy, { ascending: sortOrder === 'asc' });

        const { data: products, error } = await query;

        if (error) throw error;

        const headers = ['SKU', 'Name', 'Category', 'Stock', 'Price', 'Status'];
        const rows = products.map((p: any) =>
            [p.sku, `"${p.name}"`, p.category, p.stock, p.price, p.status].join(',')
        );

        const csv = [headers.join(','), ...rows].join('\n');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=inventory.csv');
        res.send(csv);
    } catch (error: any) {
        console.error('CSV Export Error:', error);
        res.status(500).send('Error generating CSV');
    }
});

export default router;
