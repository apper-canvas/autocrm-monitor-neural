import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Modal from '@/components/molecules/Modal';
import FormField from '@/components/molecules/FormField';
import Button from '@/components/atoms/Button';
import companyService from '@/services/api/companyService';

const CompanyForm = ({ isOpen, onClose, company, onSuccess }) => {
  const [formData, setFormData] = useState({
    name_c: '',
    address_c: '',
    phone_c: '',
    email_c: '',
    Tags: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (company) {
      setFormData({
        name_c: company.name_c || '',
        address_c: company.address_c || '',
        phone_c: company.phone_c || '',
        email_c: company.email_c || '',
        Tags: company.Tags || ''
      });
    } else {
      setFormData({
        name_c: '',
        address_c: '',
        phone_c: '',
        email_c: '',
        Tags: ''
      });
    }
    setErrors({});
  }, [company, isOpen]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name_c || !formData.name_c.trim()) {
      newErrors.name_c = 'Company name is required';
    }

    if (formData.email_c && formData.email_c.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email_c)) {
        newErrors.email_c = 'Invalid email format';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      if (company) {
        await companyService.update(company.Id, formData);
        toast.success('Company updated successfully');
      } else {
        await companyService.create(formData);
        toast.success('Company created successfully');
      }
      
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.message || `Failed to ${company ? 'update' : 'create'} company`);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field) => (e) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
    
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={company ? 'Edit Company' : 'Add Company'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField
          label="Company Name"
          required
          error={errors.name_c}
        >
          <input
            type="text"
            value={formData.name_c}
            onChange={handleChange('name_c')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Enter company name"
          />
        </FormField>

        <FormField
          label="Address"
          error={errors.address_c}
        >
          <textarea
            value={formData.address_c}
            onChange={handleChange('address_c')}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Enter company address"
          />
        </FormField>

        <FormField
          label="Phone"
          error={errors.phone_c}
        >
          <input
            type="tel"
            value={formData.phone_c}
            onChange={handleChange('phone_c')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Enter phone number"
          />
        </FormField>

        <FormField
          label="Email"
          error={errors.email_c}
        >
          <input
            type="email"
            value={formData.email_c}
            onChange={handleChange('email_c')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Enter email address"
          />
        </FormField>

        <FormField
          label="Tags"
          error={errors.Tags}
        >
          <input
            type="text"
            value={formData.Tags}
            onChange={handleChange('Tags')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Enter tags (comma-separated)"
          />
        </FormField>

        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
          >
            {loading ? 'Saving...' : company ? 'Update' : 'Create'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CompanyForm;