import transactionsData from '../mockData/transactions.json';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

let transactions = [...transactionsData];

export const transactionService = {
  async getAll() {
    await delay(300);
    return [...transactions];
  },

  async getById(id) {
    await delay(200);
    const transaction = transactions.find(t => t.Id === parseInt(id, 10));
    if (!transaction) {
      throw new Error('Transaction not found');
    }
    return { ...transaction };
  },

  async create(transactionData) {
    await delay(400);
    const maxId = Math.max(...transactions.map(t => t.Id), 0);
    const newTransaction = {
      ...transactionData,
      Id: maxId + 1,
      date: transactionData.date || new Date().toISOString().split('T')[0]
    };
    transactions.push(newTransaction);
    return { ...newTransaction };
  },

  async update(id, updateData) {
    await delay(300);
    const index = transactions.findIndex(t => t.Id === parseInt(id, 10));
    if (index === -1) {
      throw new Error('Transaction not found');
    }
    
    const updatedTransaction = {
      ...transactions[index],
      ...updateData,
      Id: transactions[index].Id // Prevent ID modification
    };
    transactions[index] = updatedTransaction;
    return { ...updatedTransaction };
  },

  async delete(id) {
    await delay(250);
    const index = transactions.findIndex(t => t.Id === parseInt(id, 10));
    if (index === -1) {
      throw new Error('Transaction not found');
    }
    transactions.splice(index, 1);
    return true;
  }
};

export default transactionService;