import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";

const ChangeAddress = ({ setIsModalOpen, setAddress, currentAddress }) => {
  const [newAddress, setNewAddress] = useState("");

  useEffect(() => {
    setNewAddress(currentAddress);
  }, [currentAddress]);

  const onSave = () => {
    if (newAddress.trim() !== "") {
      setAddress(newAddress);
      toast.success("Address updated successfully ✅");
      setIsModalOpen(false);
    } else {
      toast.error("Please enter a valid address!");
    }
  };

  return (
    <div>
      <label
        htmlFor="address"
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        New Address
      </label>
      <input
        id="address"
        type="text"
        value={newAddress}
        placeholder="Enter new address"
        className="border border-gray-300 rounded p-2 w-full mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        onChange={(e) => setNewAddress(e.target.value)}
      />

      <div className="flex justify-end">
        <button
          className="bg-gray-500 text-white py-2 px-4 rounded mr-2 hover:bg-gray-600"
          onClick={() => setIsModalOpen(false)}
        >
          Cancel
        </button>
        <button
          className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
          onClick={onSave}
        >
          Save Address
        </button>
      </div>
    </div>
  );
};

export default ChangeAddress;
