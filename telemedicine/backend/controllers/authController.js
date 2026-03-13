import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Patient from '../models/Patient.js';
import Doctor from '../models/Doctor.js';

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET environment variable is not set');
  return secret;
};

const signToken = (id) =>
  jwt.sign({ id }, getJwtSecret(), { expiresIn: '7d' });

export const register = async (req, res) => {
  try {
    const { name, email, password, role, age, gender, specialization, experience } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'name, email, password and role are required' });
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ message: 'Email already registered' });

    const user = await User.create({ name, email, password, role });

    if (role === 'patient') {
      await Patient.create({ userId: user._id, age, gender });
    } else if (role === 'doctor') {
      if (!specialization) {
        await user.deleteOne();
        return res.status(400).json({ message: 'specialization is required for doctors' });
      }
      await Doctor.create({ userId: user._id, specialization, experience: experience || 0 });
    }

    const token = signToken(user._id);
    res.status(201).json({ token, user: user.toSafeObject() });
  } catch (err) {
    res.status(500).json({ message: 'Registration failed', error: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: 'email and password are required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const valid = await user.comparePassword(password);
    if (!valid) return res.status(401).json({ message: 'Invalid credentials' });

    const token = signToken(user._id);
    res.json({ token, user: user.toSafeObject() });
  } catch (err) {
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = req.user.toSafeObject ? req.user.toSafeObject() : req.user.toObject();
    delete user.password;

    let profile = null;
    if (user.role === 'patient') {
      profile = await Patient.findOne({ userId: user._id });
    } else if (user.role === 'doctor') {
      profile = await Doctor.findOne({ userId: user._id });
    }

    res.json({ user, profile });
  } catch (err) {
    res.status(500).json({ message: 'Failed to get profile', error: err.message });
  }
};
