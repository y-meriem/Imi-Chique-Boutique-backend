// controllers/orderController.js
const OrderModel = require('../models/orderModel');

exports.createOrder = async (req, res) => {
  try {
    const result = await OrderModel.createOrder(req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Erreur création commande:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await OrderModel.getAllOrders();
    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const order = await OrderModel.getOrderById(req.params.id);
    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    await OrderModel.updateOrderStatus(req.params.id, req.body.statut);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
exports.getOrdersByUserId = async (req, res) => {
  try {
    const orders = await OrderModel.getOrdersByUserId(req.params.userId);
    res.json({ success: true, data: orders });
  } catch (error) {
    console.error('Erreur récupération commandes utilisateur:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};