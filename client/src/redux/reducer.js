const initialState = {
    catDef: null,
    queryResult: null,
    request: null,
}

function reducer(state=initialState, action) {
    switch(action.type) {
        case 'CATDEF':
            return {...state, catDef: action.catDef};
        case 'RESULT':
            return {...state, queryResult: action.queryResult};
        case 'REQUEST':
            return {...state, request: action.request};
        case 'RESET':
            return {...state, queryResult: null, request: null};
        default:
            return state;
    }
}

export default reducer;