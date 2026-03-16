import jwt from 'jsonwebtoken';

const generateToken = (res, userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });

  res.cookie('jwt', token, {
    httpOnly: true,
    secure: true, // Always secure for cross-site cookies
    sameSite: 'none', // Required for cross-site cookies between Vercel and Render
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });

  return token;
};

export default generateToken;
