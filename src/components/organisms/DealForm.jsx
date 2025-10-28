import { useState } from "react";
import { toast } from "react-toastify";
import Modal from "@/components/molecules/Modal";
import FormField from "@/components/molecules/FormField";
import Button from "@/components/atoms/Button";
import dealService from "@/services/api/dealService";

const DealForm = ({ 
  isOpen, 
  onClose, 
  deal = null, 
  contacts = [],
  onSuccess 
}) => {
  const [formData, setFormData] = useState({
    name: deal?.name || "",
    contactId: deal?.contactId || "",
    value: deal?.value || "",
    status: deal?.status || "lead"
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "Deal name is required";
    }
    
    if (!formData.contactId) {
      newErrors.contactId = "Contact is required";
    }
    
    if (!formData.value || formData.value <= 0) {
      newErrors.value = "Value must be greater than 0";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      const dealData = {
        ...formData,
        contactId: parseInt(formData.contactId),
        value: parseFloat(formData.value)
      };
      
      if (deal) {
        await dealService.update(deal.Id, dealData);
        toast.success("Deal updated successfully");
      } else {
        await dealService.create(dealData);
        toast.success("Deal created successfully");
      }
      
      onSuccess();
      onClose();
      
      // Reset form
      setFormData({
        name: "",
        contactId: "",
        value: "",
        status: "lead"
      });
    } catch (error) {
      toast.error(`Failed to ${deal ? "update" : "create"} deal`);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field) => (e) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ""
      }));
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={deal ? "Edit Deal" : "Add New Deal"}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField
          label="Deal Name *"
          value={formData.name}
          onChange={handleChange("name")}
          error={errors.name}
          placeholder="Enter deal name"
        />
        
        <FormField
          label="Contact *"
          type="select"
          value={formData.contactId}
          onChange={handleChange("contactId")}
          error={errors.contactId}
        >
          <option value="">Select a contact</option>
          {contacts.map((contact) => (
            <option key={contact.Id} value={contact.Id}>
              {contact.name}
            </option>
          ))}
        </FormField>
        
        <FormField
          label="Value *"
          type="input"
          inputType="number"
          value={formData.value}
          onChange={handleChange("value")}
          error={errors.value}
          placeholder="Enter deal value"
          step="0.01"
          min="0"
        />
        
        <FormField
          label="Status"
          type="select"
          value={formData.status}
          onChange={handleChange("status")}
        >
          <option value="lead">Lead</option>
          <option value="negotiation">Negotiation</option>
          <option value="won">Won</option>
          <option value="lost">Lost</option>
        </FormField>
        
        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            loading={loading}
          >
            {deal ? "Update Deal" : "Create Deal"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default DealForm;