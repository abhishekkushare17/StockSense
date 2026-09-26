import React, { useState, useEffect } from 'react';
import { Modal, Input, Button, ErrorMessage } from '../common';
import { Layers, Hash, FileText } from 'lucide-react';

export const CategoryModal = ({
  isOpen,
  onClose,
  onSubmit,
  category = null,
  isLoading = false
}) => {
  const isEdit = Boolean(category?._id);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    status: 'active'
  });

  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || '',
        code: category.code || '',
        description: category.description || '',
        status: category.status || 'active'
      });
    } else {
      setFormData({
        name: '',
        code: '',
        description: '',
        status: 'active'
      });
    }
    setFormError('');
  }, [category, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.name.trim()) {
      setFormError('Category name is required.');
      return;
    }
    if (!formData.code.trim()) {
      setFormError('Category code is required.');
      return;
    }

    try {
      await onSubmit({
        ...formData,
        name: formData.name.trim(),
        code: formData.code.toUpperCase().trim()
      });
      onClose();
    } catch (err) {
      setFormError(err.message || 'Failed to save category.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Category' : 'Create New Category'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {formError && (
          <ErrorMessage message={formError} onDismiss={() => setFormError('')} />
        )}

        <Input
          label="Category Name *"
          id="name"
          name="name"
          placeholder="e.g. Raw Materials"
          value={formData.name}
          onChange={handleChange}
          icon={Layers}
          required
        />

        <Input
          label="Category Code *"
          id="code"
          name="code"
          placeholder="e.g. CAT-RAW"
          value={formData.code}
          onChange={handleChange}
          icon={Hash}
          required
          className="uppercase font-mono"
          disabled={isEdit}
        />

        <div>
          <label className="text-xs font-semibold text-gray-700 block mb-1.5 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-gray-400" />
            Description
          </label>
          <textarea
            name="description"
            rows="3"
            placeholder="Brief scope of materials grouped under this category..."
            value={formData.description}
            onChange={handleChange}
            className="w-full text-xs py-2 px-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-all"
          />
        </div>

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
          </select>
        </div>

        <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-3">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" isLoading={isLoading}>
            {isEdit ? 'Save Changes' : 'Create Category'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CategoryModal;
