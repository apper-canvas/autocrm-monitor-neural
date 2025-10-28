import { getApperClient } from "@/services/apperClient";

class TaskService {
  constructor() {
    this.tableName = "task_c";
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
          { field: { Name: "description_c" } },
          { field: { Name: "due_date_c" } },
          { field: { Name: "completed_c" } },
          { field: { Name: "related_entity_type_c" } },
          { field: { Name: "related_entity_id_c" } }
        ]
      };

      const response = await apperClient.fetchRecords(this.tableName, params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      return response.data || [];
    } catch (error) {
      console.error("Error fetching tasks:", error?.response?.data?.message || error);
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
          { field: { Name: "description_c" } },
          { field: { Name: "due_date_c" } },
          { field: { Name: "completed_c" } },
          { field: { Name: "related_entity_type_c" } },
          { field: { Name: "related_entity_id_c" } }
        ]
      };

      const response = await apperClient.getRecordById(this.tableName, id, params);

      if (!response.success) {
        console.error(response.message);
        return null;
      }

      return response.data || null;
    } catch (error) {
      console.error(`Error fetching task ${id}:`, error?.response?.data?.message || error);
      return null;
    }
  }

  async create(taskData) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const params = {
        records: [
          {
            Name: taskData.description_c || taskData.description || "",
            description_c: taskData.description_c || taskData.description || "",
            due_date_c: taskData.due_date_c || taskData.dueDate || "",
            completed_c: taskData.completed_c !== undefined ? taskData.completed_c : (taskData.completed || false),
            related_entity_type_c: taskData.related_entity_type_c || taskData.relatedEntityType || "",
            related_entity_id_c: taskData.related_entity_id_c || taskData.relatedEntityId || ""
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
          console.error(`Failed to create ${failed.length} tasks: ${JSON.stringify(failed)}`);
          throw new Error(failed[0].message || "Failed to create task");
        }
        return response.results[0]?.data || null;
      }

      return null;
    } catch (error) {
      console.error("Error creating task:", error?.response?.data?.message || error);
      throw error;
    }
  }

  async update(id, taskData) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const params = {
        records: [
          {
            Id: parseInt(id),
            Name: taskData.description_c || taskData.description || "",
            description_c: taskData.description_c || taskData.description || "",
            due_date_c: taskData.due_date_c || taskData.dueDate || "",
            completed_c: taskData.completed_c !== undefined ? taskData.completed_c : (taskData.completed || false),
            related_entity_type_c: taskData.related_entity_type_c || taskData.relatedEntityType || "",
            related_entity_id_c: taskData.related_entity_id_c || taskData.relatedEntityId || ""
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
          console.error(`Failed to update ${failed.length} tasks: ${JSON.stringify(failed)}`);
          throw new Error(failed[0].message || "Failed to update task");
        }
        return response.results[0]?.data || null;
      }

      return null;
    } catch (error) {
      console.error("Error updating task:", error?.response?.data?.message || error);
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
          console.error(`Failed to delete ${failed.length} tasks: ${JSON.stringify(failed)}`);
          return false;
        }
        return true;
      }

      return false;
    } catch (error) {
      console.error("Error deleting task:", error?.response?.data?.message || error);
      throw error;
    }
  }
}

export default new TaskService();