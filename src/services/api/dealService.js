import { getApperClient } from "@/services/apperClient";

class DealService {
  constructor() {
    this.tableName = "deal_c";
  }

  async getAll() {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "name_c" } },
          { field: { Name: "contact_id_c" }, referenceField: { field: { Name: "Name" } } },
          { field: { Name: "value_c" } },
          { field: { Name: "status_c" } },
          { field: { Name: "ModifiedOn" } }
        ]
      };

      const response = await apperClient.fetchRecords(this.tableName, params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      return response.data || [];
    } catch (error) {
      console.error("Error fetching deals:", error?.response?.data?.message || error);
      throw error;
    }
  }

  async getById(id) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "name_c" } },
          { field: { Name: "contact_id_c" }, referenceField: { field: { Name: "Name" } } },
          { field: { Name: "value_c" } },
          { field: { Name: "status_c" } },
          { field: { Name: "ModifiedOn" } }
        ]
      };

      const response = await apperClient.getRecordById(this.tableName, id, params);

      if (!response.success) {
        console.error(response.message);
        return null;
      }

      return response.data || null;
    } catch (error) {
      console.error(`Error fetching deal ${id}:`, error?.response?.data?.message || error);
      return null;
    }
  }

  async create(dealData) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const params = {
        records: [
          {
            Name: dealData.name_c || dealData.name || "",
            name_c: dealData.name_c || dealData.name || "",
            contact_id_c: parseInt(dealData.contact_id_c || dealData.contactId),
            value_c: parseFloat(dealData.value_c || dealData.value),
            status_c: dealData.status_c || dealData.status || "lead"
          }
        ]
      };

      const response = await apperClient.createRecord(this.tableName, params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const failed = response.results.filter(r => !r.success);
        if (failed.length > 0) {
          console.error(`Failed to create ${failed.length} deals: ${JSON.stringify(failed)}`);
          throw new Error(failed[0].message || "Failed to create deal");
        }
        return response.results[0]?.data || null;
      }

      return null;
    } catch (error) {
      console.error("Error creating deal:", error?.response?.data?.message || error);
      throw error;
    }
  }

  async update(id, dealData) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const params = {
        records: [
          {
            Id: parseInt(id),
            Name: dealData.name_c || dealData.name || "",
            name_c: dealData.name_c || dealData.name || "",
            contact_id_c: parseInt(dealData.contact_id_c || dealData.contactId),
            value_c: parseFloat(dealData.value_c || dealData.value),
            status_c: dealData.status_c || dealData.status || "lead"
          }
        ]
      };

      const response = await apperClient.updateRecord(this.tableName, params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const failed = response.results.filter(r => !r.success);
        if (failed.length > 0) {
          console.error(`Failed to update ${failed.length} deals: ${JSON.stringify(failed)}`);
          throw new Error(failed[0].message || "Failed to update deal");
        }
        return response.results[0]?.data || null;
      }

      return null;
    } catch (error) {
      console.error("Error updating deal:", error?.response?.data?.message || error);
      throw error;
    }
  }

  async delete(id) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const params = {
        RecordIds: [parseInt(id)]
      };

      const response = await apperClient.deleteRecord(this.tableName, params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const failed = response.results.filter(r => !r.success);
        if (failed.length > 0) {
          console.error(`Failed to delete ${failed.length} deals: ${JSON.stringify(failed)}`);
          return false;
        }
        return true;
      }

      return false;
    } catch (error) {
      console.error("Error deleting deal:", error?.response?.data?.message || error);
      throw error;
    }
  }
}

export default new DealService();