import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';

import { displayCols } from '../config/categories';
import Input from '../views/Input';

const Start = () => {
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(true);
    const [inputError, setInputError] = useState('');

    useEffect(() => {
        fetch('/getcatdef').then(r => r.json()).then(res => {
        if (res['result_status'] === 'Failure') {
            setInputError('queryError');
        } else {
            // console.log('data: ', res['data']);
            let data = res['data'];
            let ordered = [];
            for (let i=0; i<data.columns.length; i++) {
                if (displayCols.includes(data.columns[i])) {
                    ordered.push({});
                    ordered[ordered.length-1]['name'] = data.columns[i];
                    ordered[ordered.length-1]['values'] = [];
                    for (let j=0; j<data.data.length; j++) {
                        ordered[ordered.length-1]['values'].push(data.data[j][i]);
                    }
                }
            }
            // [{name: 'col1', values: [row1, row2, row3]}, {name: col2, values:[]}]
            // console.log(ordered);
            dispatch({
                type: 'CATDEF',
                catDef: {'orderedCats': ordered, 'allCats': data.data, 'colList': data.columns}
            });
            setLoading(false);
        }
        })
        .catch(error => {
            console.log(error);
        })
    }, []);

    return (
        loading===true ? <p>{loading}</p> :
        <Input />
    )

};

export default Start;