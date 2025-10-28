import { getApperClient } from "@/services/apperClient";
import { toast } from "react-toastify";

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

      // Fetch current deal to detect status change
      const currentDealResponse = await apperClient.getRecordById(this.tableName, parseInt(id), {
        fields: [{ field: { Name: "status_c" } }, { field: { Name: "name_c" } }, { field: { Name: "value_c" } }, { field: { Name: "contact_id_c" } }]
      });

      const currentDeal = currentDealResponse?.data;
      const currentStatus = currentDeal?.status_c;
      const newStatus = dealData.status_c || dealData.status || "lead";
      const statusChanged = currentStatus && currentStatus !== newStatus;

      // Perform primary deal update
      const params = {
        records: [
          {
            Id: parseInt(id),
            Name: dealData.name_c || dealData.name || "",
            name_c: dealData.name_c || dealData.name || "",
            contact_id_c: parseInt(dealData.contact_id_c || dealData.contactId),
            value_c: parseFloat(dealData.value_c || dealData.value),
            status_c: newStatus
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

        const updatedDeal = response.results[0]?.data;

        // Generate email template if status changed
        if (statusChanged && updatedDeal) {
          try {
            const { ApperClient } = window.ApperSDK;
            const apperClientForFunction = new ApperClient({
              apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
              apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
            });

            // Invoke Edge Function to generate email
            const emailResponse = await apperClientForFunction.functions.invoke(
              import.meta.env.VITE_GENERATE_DEAL_EMAIL,
              {
                body: JSON.stringify({
                  dealName: updatedDeal.name_c || updatedDeal.Name,
                  newStage: newStatus,
                  dealValue: updatedDeal.value_c,
                  contactName: updatedDeal.contact_id_c?.Name || "Valued Customer"
                }),
                headers: {
                  'Content-Type': 'application/json'
                }
              }
            );

            if (!emailResponse.success) {
              console.info(`apper_info: Got an error in this function: ${import.meta.env.VITE_GENERATE_DEAL_EMAIL}. The response body is: ${JSON.stringify(emailResponse)}.`);
              toast.warning("Deal updated, but email generation failed. You can manually add notes.");
            } else {
              // Update notes field with generated email
              const generatedEmail = emailResponse.data?.email;
              if (generatedEmail) {
                const notesUpdateParams = {
                  records: [
                    {
                      Id: parseInt(id),
                      notes_c: generatedEmail
                    }
                  ]
                };

                const notesResponse = await apperClient.updateRecord(this.tableName, notesUpdateParams);
                
                if (!notesResponse.success) {
                  console.error("Failed to update notes with generated email:", notesResponse.message);
                  toast.warning("Email generated but failed to save to Notes field.");
                } else {
                  toast.success("Deal updated and email template generated successfully!");
                }
              }
            }
          } catch (emailError) {
            console.info(`apper_info: Got this error in this function: ${import.meta.env.VITE_GENERATE_DEAL_EMAIL}. The error is: ${emailError.message}`);
            toast.warning("Deal updated, but email generation encountered an error.");
          }
        }

        return updatedDeal || null;
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