import agents from '../assets/agents.json' assert { type: 'json' };

export default class {
  constructor (container, shop) {
    this.container = container;
    this.shop = shop;
    this.programList = agents;

    this.addShopItemForm = this.container.querySelector('#add-shop-item')

    this.addShopItemButton = this.container.querySelector('#add-shop-item-button')
    this.addShopItemButton.addEventListener('click', () => {
      this.addItem(this.getObjectFromFormData(new FormData(this.addShopItemForm)));
    });

    this.itemList = this.container.querySelector('#shop-item-list');

    this.programSelector = this.container.querySelector('#program-selector');
    this.programList.forEach((p) => {
      const option = document.createElement('option');
      option.innerHTML = p.name;
      this.programSelector.appendChild(option);
    })

    this.renderItemList();
  }

  addItem ({ program, price }) {
    if (!this.shop.find((i) => i.name === program)) {
      const newItem = {
        name: program,
        price: parseInt(price, 10)
      }
      this.shop.push(newItem)
      this.shop.sort((a, b) => a.name < b.name ? -1 : 1);
      this.renderItemList();
    }
  }

  removeItem (item) {
    const index = this.shop.findIndex((i) => i === item);
    if (index !== -1) {
      this.shop.splice(index, 1);
    }
    this.renderItemList();
  }

  getObjectFromFormData (formData) {
    const obj = {};
    formData.forEach((val, key) => {
      obj[key] = val;
    })

    return obj;
  }

  renderItemList () {
    this.itemList.innerHTML = '';
    this.shop.forEach((item) => {
      const node = document.createElement('div');
      const removeButton = document.createElement('button');
      removeButton.innerHTML = 'Delete';
      node.innerHTML = `${item.name} : ${item.price}`
      node.appendChild(removeButton);
      removeButton.addEventListener('click', () => {
        this.removeItem(item)
      })
      this.itemList.appendChild(node);
    });
  }
}
