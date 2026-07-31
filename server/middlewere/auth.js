import jwt from 'jsonwebtoken'
import User from '../models/User.js';

 const protect = async (req, res, next) => {
    let token = req.headers.authorization;

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const userId = decoded.id;

        const user = await User.findById(userId)

        if(!user){
            return res.json({success: false, message: "Not authorization, user not found"});
        }
        req.user = user;
        next();
    } catch (error) {
        return res.json({success: false, message: error.message})
    }
}

export default protect;