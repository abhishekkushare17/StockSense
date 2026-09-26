import React, { useState, useEffect } from 'react';
import { Modal, Input, Button, ErrorMessage } from '../common';
import { Package, Hash, Layers, Scale, Database, AlertTriangle, FileText } from 'lucide-react';

export const ProductModal = ({
  isOpen,
  onClose,
  onSubmit,
  product = null,
  categories = [],
  warehouses = [],
  isLoading = false
}) => {
  const isEdit = Boolean(product?._id);

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: '',
    unitOfMeasure: 'pcs',
    initialStock: 0,
    warehouseId: '',
    reorderLevel: 10,
    costPrice: '',
    sellingPrice: '',
    description: '',
    status: 'active'
  });

  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        sku: product.sku || '',
        category: product.category?._id || product.category || '',
        unitOfMeasure: product.unitOfMeasure || 'pcs',
        initialStock: 0, // initial stock only set on create
        warehouseId: warehouses[0]?._id || '',
        reorderLevel: product.reorderLevel ?? 10,
        costPrice: product.costPrice ?? '',
        sellingPrice: product.sellingPrice ?? '',
        description: product.description || '',
        status: product.status || 'active'
      });
    } else {
      setFormData({
        name: '',
        sku: '',
        category: categories[0]?._id || '',
        unitOfMeasure: 'pcs',
        initialStock: 0,
        warehouseId: warehouses[0]?._id || '',
        reorderLevel: 10,
        costPrice: '',
        sellingPrice: '',
        description: '',
        status: 'active'
      });
    }
    setFormError('');
  }, [product, categories, warehouses, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.name.trim()) {
      setFormError('Product name is required.');
      return;
    }
    if (!formData.sku.trim()) {
      setFormError('SKU / Code is required.');
      return;
    }
    if (!formData.category) {
      setFormError('Please select a product category.');
      return;
    }

    if (!isEdit && Number(formData.initialStock) > 0 && !formData.warehouseId) {
      setFormError('Please select a warehouse to allocate the initial stock.');
      return;
    }

    try {
      await onSubmit({
        ...formData,
        sku: formData.sku.toUpperCase().trim(),
        initialStock: Number(formData.initialStock) || 0,
        reorderLevel: Number(formData.reorderLevel) || 0,
        costPrice: formData.costPrice ? Number(formData.costPrice) : undefined,
        sellingPrice: formData.sellingPrice ? Number(formData.sellingPrice) : undefined
      });
      onClose();
    } catch (err) {
      setFormError(err.message || 'Failed to save product.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Product Master' : 'Add New Product'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {formError && (
          <ErrorMessage message={formError} onDismiss={() => setFormError('')} />
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Product Name */}
          <Input
            label="Product Name *"
            id="name"
            name="name"
            placeholder="e.g. Steel Rod 10mm"
            value={formData.name}
            onChange={handleChange}
            icon={Package}
            required
          />

          {/* SKU / Code */}
          <Input
            label="SKU / Code *"
            id="sku"
            name="sku"
            placeholder="e.g. ROD-STL-001"
            value={formData.sku}
            onChange={handleChange}
            icon={Hash}
            required
            className="uppercase font-mono"
            disabled={isEdit}
          />

          {/* Category Dropdown */}
          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1.5 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-500" />
              Category *
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="w-full text-xs py-2.5 px-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-all"
            >
              <option value="">Select Category</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name} ({c.code})
                </option>
              ))}
            </select>
          </div>

          {/* Unit of Measure */}
          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1.5 flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5 text-indigo-500" />
              Unit of Measure *
            </label>
            <select
              name="unitOfMeasure"
              value={formData.unitOfMeasure}
              onChange={handleChange}
              required
              className="w-full text-xs py-2.5 px-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-all uppercase"
            >
              <option value="pcs">Pieces (pcs)</option>
              <option value="kg">Kilograms (kg)</option>
              <option value="m">Meters (m)</option>
              <option value="box">Boxes (box)</option>
              <option value="liters">Liters (l)</option>
              <option value="rolls">Rolls (rolls)</option>
            </select>
          </div>

          {/* Initial Stock (Only on Creation) */}
          {!isEdit && (
            <>
              <Input
                label="Initial Stock Quantity"
                id="initialStock"
                name="initialStock"
                type="number"
                min="0"
                placeholder="0"
                value={formData.initialStock}
                onChange={handleChange}
                icon={Database}
              />

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1.5 flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-indigo-500" />
                  Initial Warehouse Location
                </label>
                <select
                  name="warehouseId"
                  value={formData.warehouseId}
                  onChange={handleChange}
                  className="w-full text-xs py-2.5 px-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-all"
                >
                  <option value="">Select Warehouse</option>
                  {warehouses.map((w) => (
                    <option key={w._id} value={w._id}>
                      {w.name} ({w.code})
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          {/* Reorder Level Threshold */}
          <Input
            label="Reorder Level Threshold *"
            id="reorderLevel"
            name="reorderLevel"
            type="number"
            min="0"
            placeholder="10"
            value={formData.reorderLevel}
            onChange={handleChange}
            icon={AlertTriangle}
            required
          />

          {/* Lifecycle Status */}
          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1.5">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full text-xs py-2.5 px-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-all"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="text-xs font-semibold text-gray-700 block mb-1.5 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-gray-400" />
            Product Description
          </label>
          <textarea
            name="description"
            rows="3"
            placeholder="Technical specifications, dimensions, material grade..."
            value={formData.description}
            onChange={handleChange}
            className="w-full text-xs py-2 px-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-all"
          />
        </div>

        {/* Action Buttons */}
        <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-3">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" isLoading={isLoading}>
            {isEdit ? 'Save Changes' : 'Create Product'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ProductModal;
