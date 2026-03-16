import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User from '../models/User.js';

// User must be authenticated
const protect = asyncHandler(async (req, res, next) => {
  let token;
  // Read JWT from the 'jwt' cookie or Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    const headerToken = req.headers.authorization.split(' ')[1];
    if (headerToken && headerToken !== 'null' && headerToken !== 'undefined') {
      token = headerToken;
    }
  }
  
  if (!token && req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.userId).select('-password');
      next();
    } catch (error) {
      console.error(error);
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  } else {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
});

// Admin validation
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(401);
    throw new Error('Not authorized as an admin');
  }
};

// Rider validation
const rider = (req, res, next) => {
  if (req.user && (req.user.role === 'rider' || req.user.role === 'admin')) {
    next();
  } else {
    res.status(401);
    throw new Error('Not authorized as a delivery rider');
  }
};

export { protect, admin, rider };
