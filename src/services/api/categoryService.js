import categoriesData from '../mockData/categories.json';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

let categories = [...categoriesData];

export const categoryService = {
  async getAll() {
    await delay(200);
    return [...categories];
  },

  async getById(id) {
    await delay(150);
    const category = categories.find(c => c.Id === parseInt(id, 10));
    if (!category) {
      throw new Error('Category not found');
    }
    return { ...category };
  },

  async getByType(type) {
    await delay(200);
    return categories.filter(c => c.type === type);
  },

  async create(categoryData) {
    await delay(300);
    const maxId = Math.max(...categories.map(c => c.Id), 0);
    const newCategory = {
      ...categoryData,
      Id: maxId + 1
    };
    categories.push(newCategory);
    return { ...newCategory };
  },

  async update(id, updateData) {
    await delay(250);
    const index = categories.findIndex(c => c.Id === parseInt(id, 10));
    if (index === -1) {
      throw new Error('Category not found');
    }
    
    const updatedCategory = {
      ...categories[index],
      ...updateData,
      Id: categories[index].Id // Prevent ID modification
    };
    categories[index] = updatedCategory;
    return { ...updatedCategory };
  },

  async delete(id) {
    await delay(200);
    const index = categories.findIndex(c => c.Id === parseInt(id, 10));
    if (index === -1) {
      throw new Error('Category not found');
    }
    categories.splice(index, 1);
    return true;
  }
};

export default categoryService;