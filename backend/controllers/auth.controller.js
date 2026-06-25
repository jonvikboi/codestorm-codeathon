const bcrypt = require('bcryptjs');
const supabase = require('../services/supabase');
const { generateToken } = require('../utils/jwt');

// A pre-computed dummy hash to prevent timing attacks during login
const DUMMY_HASH = '$2a$10$wB.HqS2F3K6M6Rk7m8H.4eY3M5c6r9y0T1J2K3L4M5N6O7P8Q9R0S';

const register = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Save to DB (relies on PostgreSQL UNIQUE constraint for email)
    const { data: newUser, error } = await supabase
      .from('students')
      .insert([
        { name, email, password: hashedPassword, phone }
      ])
      .select()
      .single();

    if (error) {
      // 23505 is the PostgreSQL error code for unique_violation
      if (error.code === '23505') {
        return res.status(400).json({ success: false, message: 'Email already registered', data: {} });
      }
      throw error;
    }

    res.status(201).json({
      success: true,
      message: 'Student registered successfully',
      data: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user
    const { data: user, error } = await supabase
      .from('students')
      .select('*')
      .eq('email', email)
      .single();

    // If it's a real database error (not just 'user not found'), throw it
    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    // To prevent timing attacks (user enumeration), we always run bcrypt.compare.
    // If the user doesn't exist, we compare against a dummy hash so the response time is similar.
    const hashToCompare = user ? user.password : DUMMY_HASH;

    // Verify password
    const isMatch = await bcrypt.compare(password, hashToCompare);

    if (!user || !isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid credentials', data: {} });
    }

    // Generate JWT
    const token = generateToken({
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone
    });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        }
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
};
