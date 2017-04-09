function handleItems(state = {
  all: [],
}, action) {
  switch (action.type) {
    case 'FIND_ALL_ITEMS_DONE':
      console.log('in FIND_ALL_ITEMS_DONE');
      console.log(action.result);
      return {
        all: action.result
      }

    case 'CREATED_ITEM':
      return {
        all: [action.item, ...state.all]
      }

    case 'UPDATED_ITEM':
      console.log('in UPDATED_ITEM');
      let newAll = [];
      for (const item of state.all) {
        if (item.mac === action.item.mac) {
          newAll.push(action.item);
        } else {
          newAll.push(item);
        }
      }
      return {
        all: newAll
      }

    case 'REMOVED_ITEM':
      return {
        all: state.all.filter((item) => item.mac !== action.item.id)
      }

    default:
      return state;
  }
}

export default handleItems;
