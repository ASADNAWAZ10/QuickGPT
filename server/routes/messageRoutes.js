import express from 'express'
import protect from '../middlewere/auth.js';
import { imageGeneratorController, textMessageController } from '../controller/messageController.js';

const messageRouter = express.Router();

messageRouter.post('/text', protect, textMessageController )
messageRouter.post('/image', protect, imageGeneratorController )

export default messageRouter;