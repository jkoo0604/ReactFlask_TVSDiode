import React from 'react';

import colors from '../config/colors';

const MyTable = props => {
    const {columns, data, fixedCol, tdStyle, thStyle, trStyle} = props;

    return (
        <table>
            <thead>
                <tr>
                    {
                        columns.map((col, idx) => (
                            <th key={idx} style={{...thStyle, position: 'sticky', top: 0}}>{col}</th>
                        ))
                    }
                </tr>
            </thead>
            <tbody>
                {
                    data.map((row, idx) => (
                        <tr key={idx} style={{...trStyle}}>
                            {
                                row.map((cell, id) => {
                                    if (id < fixedCol) {
                                        return (
                                            <td key={id} style={{...tdStyle, position: 'sticky', left: id}}>{cell}</td>
                                        )
                                    } else {
                                        return (
                                            <td key={id} style={tdStyle}>{cell}</td>
                                        )
                                    }
                                })
                            }
                        </tr>
                    ))
                }
                {/* <tr>
                    {
                        data.map((row, idx) => {
                            if (idx < fixedCol) {
                                return (
                                    <td key={idx} style={{...tdStyle, position: 'sticky', left: idx}}>{row}</td>
                                )
                            } else {
                                return (
                                    <td key={idx} style={tdStyle}>{row}</td>
                                )
                            }
                        })
                    }
                </tr> */}
            </tbody>
        </table>
    )
}

export default MyTable;
