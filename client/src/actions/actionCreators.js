export function createItem(item) {
  console.log('createItem');
  return {
    type: 'CREATE_ITEM',
    item
  }
}

export function removeItem(id) {
  console.log('removeItem');
  return {
    type: 'REMOVE_ITEM',
    id
  }
}

export function updateItem(id, newData) {
  console.log('updateItem');
  return {
    type: 'UPDATE_ITEM',
    id,
    newData
  }
}

export function findAllItems() {
  console.log('findAllItems');
  return {
    type: 'FIND_ALL_ITEMS',
  }
}

export function createdItem(item) {
  console.log('createdItem')
  return {
    type: 'CREATED_ITEM',
    item
  }
}

export function updatedItem(item) {
  console.log('updatedItem');
  return {
    type: 'UPDATED_ITEM',
    item
  }
}

export function removedItem(item) {
  console.log('removedItem');
  return {
    type: 'REMOVED_ITEM',
    item
  }
}
