import { getApperClient } from '@/services/apperClient';
import { toast } from 'react-toastify';

class CompanyService {
  async getAll() {
    try {
      const apperClient = getApperClient();
      
      if (!apperClient) {
        throw new Error('ApperClient not initialized');
      }

      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "name_c" } },
          { field: { Name: "address_c" } },
          { field: { Name: "phone_c" } },
          { field: { Name: "email_c" } },
          { field: { Name: "Tags" } },
          { field: { Name: "Owner" } },
          { field: { Name: "CreatedOn" } }
        ],
        orderBy: [{ fieldName: "Id", sorttype: "DESC" }],
        pagingInfo: { limit: 100, offset: 0 }
      };

      const response = await apperClient.fetchRecords('company_c', params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message || 'Failed to fetch companies');
      }

      if (!response.data || response.data.length === 0) {
        return [];
      }

      return response.data;
    } catch (error) {
      console.error("Error fetching companies:", error?.message || error);
      throw error;
    }
  }

  async getById(id) {
    try {
      const apperClient = getApperClient();
      
      if (!apperClient) {
        throw new Error('ApperClient not initialized');
      }

      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "name_c" } },
          { field: { Name: "address_c" } },
          { field: { Name: "phone_c" } },
          { field: { Name: "email_c" } },
          { field: { Name: "Tags" } },
          { field: { Name: "Owner" } },
          { field: { Name: "CreatedOn" } },
          { field: { Name: "CreatedBy" } },
          { field: { Name: "ModifiedOn" } },
          { field: { Name: "ModifiedBy" } }
        ]
      };

      const response = await apperClient.getRecordById('company_c', id, params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message || 'Failed to fetch company');
      }

      if (!response.data) {
        throw new Error('Company not found');
      }

      return response.data;
    } catch (error) {
      console.error(`Error fetching company ${id}:`, error?.message || error);
      throw error;
    }
  }

  async create(companyData) {
    try {
      const apperClient = getApperClient();
      
      if (!apperClient) {
        throw new Error('ApperClient not initialized');
      }

      const payload = {
        records: [
          {
            name_c: companyData.name_c || '',
            address_c: companyData.address_c || '',
            phone_c: companyData.phone_c || '',
            email_c: companyData.email_c || '',
            Tags: companyData.Tags || ''
          }
        ]
      };

      const response = await apperClient.createRecord('company_c', payload);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message || 'Failed to create company');
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);

        if (failed.length > 0) {
          console.error(`Failed to create company:`, failed);
          failed.forEach(record => {
            if (record.errors) {
              record.errors.forEach(error => {
                toast.error(`${error.fieldLabel}: ${error.message}`);
              });
            }
            if (record.message) {
              toast.error(record.message);
            }
          });
          throw new Error('Failed to create company');
        }

        return successful[0]?.data;
      }

      throw new Error('No response data received');
    } catch (error) {
      console.error("Error creating company:", error?.message || error);
      throw error;
    }
  }

  async update(id, companyData) {
    try {
      const apperClient = getApperClient();
      
      if (!apperClient) {
        throw new Error('ApperClient not initialized');
      }

      const payload = {
        records: [
          {
            Id: id,
            name_c: companyData.name_c || '',
            address_c: companyData.address_c || '',
            phone_c: companyData.phone_c || '',
            email_c: companyData.email_c || '',
            Tags: companyData.Tags || ''
          }
        ]
      };

      const response = await apperClient.updateRecord('company_c', payload);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message || 'Failed to update company');
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);

        if (failed.length > 0) {
          console.error(`Failed to update company:`, failed);
          failed.forEach(record => {
            if (record.errors) {
              record.errors.forEach(error => {
                toast.error(`${error.fieldLabel}: ${error.message}`);
              });
            }
            if (record.message) {
              toast.error(record.message);
            }
          });
          throw new Error('Failed to update company');
        }

        return successful[0]?.data;
      }

      throw new Error('No response data received');
    } catch (error) {
      console.error(`Error updating company ${id}:`, error?.message || error);
      throw error;
    }
  }

  async delete(id) {
    try {
      const apperClient = getApperClient();
      
      if (!apperClient) {
        throw new Error('ApperClient not initialized');
      }

      const params = {
        RecordIds: [id]
      };

      const response = await apperClient.deleteRecord('company_c', params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message || 'Failed to delete company');
      }

      if (response.results) {
        const failed = response.results.filter(r => !r.success);

        if (failed.length > 0) {
          console.error(`Failed to delete company:`, failed);
          failed.forEach(record => {
            if (record.message) {
              toast.error(record.message);
            }
          });
          throw new Error('Failed to delete company');
        }

        return true;
      }

      return true;
    } catch (error) {
      console.error(`Error deleting company ${id}:`, error?.message || error);
      throw error;
    }
  }
}

export default new CompanyService();