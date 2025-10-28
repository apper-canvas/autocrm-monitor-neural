import { useState, useEffect } from "react";
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
    name_c: deal?.name_c || deal?.name || "",
    contact_id_c: deal?.contact_id_c?.Id || deal?.contactId || "",
    value_c: deal?.value_c || deal?.value || "",
    status_c: deal?.status_c || deal?.status || "lead",
    notes_c: deal?.notes_c || deal?.notes || ""
  });
const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Update form data when deal prop changes
  useEffect(() => {
    if (deal) {
      setFormData({
        name_c: deal?.name_c || deal?.name || "",
        contact_id_c: deal?.contact_id_c?.Id || deal?.contactId || "",
        value_c: deal?.value_c || deal?.value || "",
        status_c: deal?.status_c || deal?.status || "lead",
        notes_c: deal?.notes_c || deal?.notes || ""
      });
    } else {
      setFormData({
        name_c: "",
        contact_id_c: "",
        value_c: "",
        status_c: "lead",
        notes_c: ""
      });
    }
  }, [deal]);
const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name_c.trim()) {
      newErrors.name_c = "Deal name is required";
    }
    
    if (!formData.contact_id_c) {
      newErrors.contact_id_c = "Contact is required";
    }
    
    if (!formData.value_c || formData.value_c <= 0) {
      newErrors.value_c = "Value must be greater than 0";
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
        contact_id_c: parseInt(formData.contact_id_c),
        value_c: parseFloat(formData.value_c)
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
        name_c: "",
        contact_id_c: "",
        value_c: "",
        status_c: "lead",
        notes_c: ""
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
          value={formData.name_c}
          onChange={handleChange("name_c")}
          error={errors.name_c}
          placeholder="Enter deal name"
        />
        
<FormField
          label="Contact *"
          type="select"
          value={formData.contact_id_c}
          onChange={handleChange("contact_id_c")}
          error={errors.contact_id_c}
        >
          <option value="">Select a contact</option>
          {contacts.map((contact) => (
<option key={contact.Id} value={contact.Id}>
              {contact.name_c || contact.name || contact.Name}
            </option>
          ))}
        </FormField>
        
<FormField
          label="Value *"
          type="input"
          inputType="number"
          value={formData.value_c}
          onChange={handleChange("value_c")}
          error={errors.value_c}
          placeholder="Enter deal value"
          step="0.01"
          min="0"
        />
        
<FormField
          label="Status"
          type="select"
          value={formData.status_c}
          onChange={handleChange("status_c")}
        >
          <option value="lead">Lead</option>
          <option value="negotiation">Negotiation</option>
          <option value="won">Won</option>
          <option value="lost">Lost</option>
</FormField>
        
<FormField
          label="Notes"
          type="textarea"
          name="notes_c"
          value={formData.notes_c}
          onChange={handleChange("notes_c")}
          error={errors.notes_c}
          rows={4}
          className="col-span-2"
        />
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