export function createItem(item) {
  return {
    type: 'CREATE_ITEM',
    item
  }
}

export function removeItem(id) {
  return {
    type: 'REMOVE_ITEM',
    id
  }
}

export function updateItem(id, newData) {
  return {
    type: 'UPDATE_ITEM',
    id,
    newData
  }
}

export function findAllItems() {
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
  return {
    type: 'REMOVED_ITEM',
    item
  }
}
