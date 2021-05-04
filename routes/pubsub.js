const express =require('express');
const router=express.Router();

const pubsubController=require("../controllers/pubsub_controller");

router.get("/sub",pubsubController.sub);
router.post("/update/:email",pubsubController.update);
router.get("/unsubscribe/:topic",pubsubController.unsubscribe);
router.post("/createChat/",pubsubController.create_chat);

module.exports=router;