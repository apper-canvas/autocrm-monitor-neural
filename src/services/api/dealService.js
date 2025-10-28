import dealsData from "@/services/mockData/deals.json";

class DealService {
  constructor() {
    this.storageKey = "autocrm_deals";
    this.initializeData();
  }

  initializeData() {
    const existingData = localStorage.getItem(this.storageKey);
    if (!existingData) {
      localStorage.setItem(this.storageKey, JSON.stringify(dealsData));
    }
  }

  getData() {
    const data = localStorage.getItem(this.storageKey);
    return data ? JSON.parse(data) : [];
  }

  saveData(deals) {
    localStorage.setItem(this.storageKey, JSON.stringify(deals));
  }

  async getAll() {
    return new Promise((resolve) => {
      setTimeout(() => {
        const deals = this.getData();
        resolve([...deals]);
      }, 250);
    });
  }

  async getById(id) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const deals = this.getData();
        const deal = deals.find(d => d.Id === parseInt(id));
        resolve(deal ? { ...deal } : null);
      }, 200);
    });
  }

  async create(dealData) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const deals = this.getData();
        const maxId = Math.max(...deals.map(d => d.Id), 0);
        const newDeal = {
          ...dealData,
          Id: maxId + 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        deals.push(newDeal);
        this.saveData(deals);
        resolve({ ...newDeal });
      }, 300);
    });
  }

  async update(id, dealData) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const deals = this.getData();
        const index = deals.findIndex(d => d.Id === parseInt(id));
        if (index !== -1) {
          deals[index] = { 
            ...deals[index], 
            ...dealData,
            updatedAt: new Date().toISOString()
          };
          this.saveData(deals);
          resolve({ ...deals[index] });
        } else {
          resolve(null);
        }
      }, 300);
    });
  }

  async delete(id) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const deals = this.getData();
        const filteredDeals = deals.filter(d => d.Id !== parseInt(id));
        this.saveData(filteredDeals);
        resolve(true);
      }, 250);
    });
  }
}

export default new DealService();