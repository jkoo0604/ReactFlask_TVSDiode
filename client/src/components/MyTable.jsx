import React from 'react';

import colors from '../config/colors';

const MyTable = props => {
    const {columns, data, fixedCol, tdStyle, thStyle} = props;

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
                <tr>
                    {
                        data.map((row, idx) => {
                            if (idx < fixedCol) {
                                return (
                                    <td key={idx} style={{...tdStyle, position: 'sticky', left: 0}}>{row}</td>
                                )
                            } else {
                                return (
                                    <td key={idx} style={tdStyle}>{row}</td>
                                )
                            }
                        })
                    }
                </tr>
            </tbody>
        </table>
    )
}

export default MyTable;
