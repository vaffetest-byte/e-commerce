import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { supabase } from '../db.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'seoul-muse-secret-key-change-in-prod';

// POST /api/admin/auth/login
router.post('/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Fetch user from DB
        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();

        if (error || !user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Verify password
        // Note: For now we compare plain text as per seed, OR hashed if you updated it.
        // Let's support both for transition: try compare, if fail try bcrypt.
        let isValid = false;
        if (user.password_hash === password) {
            isValid = true;
        } else {
            // Try bcrypt for future proofing
            isValid = await bcrypt.compare(password, user.password_hash).catch(() => false);
        }

        if (!isValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate Token
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Don't send password hash back
        const { password_hash, ...userProfile } = user;

        res.json({ token, user: userProfile });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Authentication failed' });
    }
});

// GET /api/admin/users
router.get('/users', async (req, res) => {
    // Should be protected in index.ts
    const { data, error } = await supabase.from('users').select('id, name, email, role, avatar');
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
});

export default router;
