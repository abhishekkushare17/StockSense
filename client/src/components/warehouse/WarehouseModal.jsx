import React, { useState, useEffect } from 'react';
import { X, Warehouse, AlertCircle } from 'lucide-react';
import { Button } from '../common';

export const WarehouseModal = ({
  isOpen,
  onClose,
  onSubmit,
  warehouse = null,
  isLoading = false
}) => {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    status: 'active',
    location: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    contactPerson: '',
    phone: '',
    email: '',
    description: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (warehouse) {
      setFormData({
        name: warehouse.name || '',
        code: warehouse.code || '',
        status: warehouse.status || (warehouse.isActive ? 'active' : 'inactive'),
        location: warehouse.location || '',
        address: warehouse.address || '',
        city: warehouse.city || '',
        state: warehouse.state || '',
        postalCode: warehouse.postalCode || '',
        contactPerson: warehouse.contactPerson || '',
        phone: warehouse.phone || '',
        email: warehouse.email || '',
        description: warehouse.description || ''
      });
    } else {
      setFormData({
        name: '',
        code: '',
        status: 'active',
        location: '',
        address: '',
        city: '',
        state: '',
        postalCode: '',
        contactPerson: '',
        phone: '',
        email: '',
        description: ''
      });
    }
    setErrors({});
  }, [warehouse, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Warehouse name is required';
    if (!formData.code.trim()) newErrors.code = 'Warehouse code is required';
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      ...formData,
      code: formData.code.trim().toUpperCase()
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl border border-gray-100 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Warehouse className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">
                {warehouse ? 'Edit Warehouse Facility' : 'Create New Warehouse'}
              </h2>
              <p className="text-xs text-gray-500">
                {warehouse
                  ? 'Update storage location and facility contact details'
                  : 'Define a new storage facility or distribution center'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Facility Name */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Warehouse Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Central Logistics Hub"
                className={`w-full px-3 py-2 text-xs rounded-xl border ${
                  errors.name ? 'border-rose-400 focus:ring-rose-200' : 'border-gray-200 focus:ring-indigo-200'
                } focus:outline-hidden focus:ring-2`}
              />
              {errors.name && <p className="text-[11px] text-rose-500 mt-1">{errors.name}</p>}
            </div>

            {/* Code */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Warehouse Code <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleChange}
                placeholder="e.g. WH-MAIN"
                className={`w-full px-3 py-2 text-xs font-mono uppercase rounded-xl border ${
                  errors.code ? 'border-rose-400 focus:ring-rose-200' : 'border-gray-200 focus:ring-indigo-200'
                } focus:outline-hidden focus:ring-2`}
              />
              {errors.code && <p className="text-[11px] text-rose-500 mt-1">{errors.code}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Location Zone */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Zone / Location
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g. Sector 5 Industrial Area"
                className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-200"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Operational Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-200 bg-white"
              >
                <option value="active">Active (Operational)</option>
                <option value="inactive">Inactive (Suspended)</option>
              </select>
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Physical Street Address
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="e.g. Building 4A, Ring Road Expressway"
              className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-200"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* City */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                City
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="e.g. Mumbai"
                className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-200"
              />
            </div>

            {/* State */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                State / Province
              </label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                placeholder="e.g. Maharashtra"
                className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-200"
              />
            </div>

            {/* Postal Code */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Postal Code
              </label>
              <input
                type="text"
                name="postalCode"
                value={formData.postalCode}
                onChange={handleChange}
                placeholder="e.g. 400001"
                className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-200"
              />
            </div>
          </div>

          {/* Contact Details */}
          <div className="pt-2 border-t border-gray-100">
            <p className="text-xs font-bold text-gray-800 mb-3">Facility Point of Contact</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                  Contact Person
                </label>
                <input
                  type="text"
                  name="contactPerson"
                  value={formData.contactPerson}
                  onChange={handleChange}
                  placeholder="e.g. Ramesh Patel"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-200"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="e.g. +91 98765 43210"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-200"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="e.g. wh-mum@stocksense.com"
                  className={`w-full px-3 py-2 text-xs rounded-xl border ${
                    errors.email ? 'border-rose-400 focus:ring-rose-200' : 'border-gray-200 focus:ring-indigo-200'
                  } focus:outline-hidden focus:ring-2`}
                />
                {errors.email && <p className="text-[11px] text-rose-500 mt-1">{errors.email}</p>}
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Facility Description
            </label>
            <textarea
              name="description"
              rows={2}
              value={formData.description}
              onChange={handleChange}
              placeholder="Notes on storage capacity, docks, cold storage capabilities..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-200 resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
            <Button variant="outline" type="button" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={isLoading}>
              {warehouse ? 'Save Changes' : 'Create Warehouse'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WarehouseModal;
