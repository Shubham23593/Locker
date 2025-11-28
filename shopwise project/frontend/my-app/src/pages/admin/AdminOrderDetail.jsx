import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext';
import { adminAPIService } from '../../services/adminAPI';
import { orderAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { FaArrowLeft, FaBox, FaMapMarkerAlt, FaUser, FaPrint } from 'react-icons/fa';

const AdminOrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAdmin();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [trackingNote, setTrackingNote] = useState('');

  useEffect(() => {
    if (!isAdmin) {
      navigate('/admin/login');
      return;
    }
    fetchOrder();
  }, [id, isAdmin, navigate]);

  const fetchOrder = async () => {
    try {
      const response = await orderAPI.getOrderById(id);
      const orderData = response.data?. data || response.data;
      setOrder(orderData);
    } catch (error) {
      console.error('Failed to fetch order:', error);
      toast.error('Order not found');
      navigate('/admin/orders');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      await adminAPIService.updateOrderStatus(id, { 
        status: newStatus,
        trackingNote: trackingNote || undefined,
      });
      toast.success(`Order status updated to ${newStatus}`);
      setTrackingNote('');
      fetchOrder();
    } catch (error) {
      console.error('Failed to update status:', error);
      toast.error('Failed to update order status');
    }
  };

  const printInvoice = () => {
    window.print();
    toast.success('Invoice printed');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-indigo-600"></div>
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => navigate('/admin/orders')}
            className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-medium"
          >
            <FaArrowLeft /> Back to Orders
          </button>
          <button
            onClick={printInvoice}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition"
          >
            <FaPrint /> Print Invoice
          </button>
        </div>

        {/* Order Info */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Order Details</h1>
              <p className="text-gray-600 mt-1">
                Order ID: <span className="font-mono font-bold">#{order._id.slice(-8).toUpperCase()}</span>
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Placed on {new Date(order.createdAt).toLocaleString()}
              </p>
            </div>
            <div className={`px-4 py-2 rounded-lg font-bold ${
              order.status === 'delivered' ? 'bg-green-100 text-green-800' :
              order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
              order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
              order. status === 'cancelled' ? 'bg-red-100 text-red-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {order.status. toUpperCase()}
            </div>
          </div>

          {/* Customer Info */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="border rounded-lg p-4">
              <h3 className="font-bold mb-2 flex items-center gap-2">
                <FaUser className="text-indigo-600" /> Customer Information
              </h3>
              <p className="text-gray-700">Name: {order.userId?.name || 'N/A'}</p>
              <p className="text-gray-700">Email: {order.userId?.email || 'N/A'}</p>
            </div>

            <div className="border rounded-lg p-4">
              <h3 className="font-bold mb-2 flex items-center gap-2">
                <FaMapMarkerAlt className="text-red-600" /> Shipping Address
              </h3>
              {order.shippingAddress ? (
                <>
                  <p className="text-gray-700">{order.shippingAddress. address}</p>
                  <p className="text-gray-700">{order.shippingAddress. city}, {order.shippingAddress.zip}</p>
                </>
              ) : (
                <p className="text-gray-500">No address provided</p>
              )}
            </div>
          </div>

          {/* Order Items */}
          <div className="mb-6">
            <h3 className="font-bold mb-4 text-xl flex items-center gap-2">
              <FaBox className="text-indigo-600" /> Order Items
            </h3>
            <div className="space-y-4">
              {order.items. map((item, index) => (
                <div key={index} className="flex gap-4 p-4 border rounded-lg">
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-20 object-contain rounded"
                    />
                  )}
                  <div className="flex-1">
                    <h4 className="font-semibold">{item.name}</h4>
                    {item.brand && <p className="text-sm text-gray-600">Brand: {item.brand}</p>}
                    <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                    <p className="text-sm text-gray-600">Price: ₹{item.price?. toFixed(2)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">
                      ₹{((item.price || 0) * (item.quantity || 0)).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Total */}
          <div className="border-t pt-6">
            <div className="flex justify-end">
              <div className="w-64">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-semibold">₹{order.totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xl font-bold border-t pt-2">
                  <span>Total:</span>
                  <span className="text-indigo-600">₹{order.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Status Update Section */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="font-bold text-xl mb-4">Update Order Status</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Tracking Note (Optional)
              </label>
              <textarea
                value={trackingNote}
                onChange={(e) => setTrackingNote(e.target.value)}
                placeholder="Add tracking information or notes..."
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                rows="3"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Update Status
              </label>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => handleStatusUpdate('processing')}
                  disabled={order.status === 'processing'}
                  className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition disabled:opacity-50"
                >
                  Mark as Processing
                </button>
                <button
                  onClick={() => handleStatusUpdate('shipped')}
                  disabled={order.status === 'shipped' || order.status === 'delivered'}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition disabled:opacity-50"
                >
                  Mark as Shipped
                </button>
                <button
                  onClick={() => handleStatusUpdate('delivered')}
                  disabled={order.status === 'delivered'}
                  className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition disabled:opacity-50"
                >
                  Mark as Delivered
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOrderDetail;